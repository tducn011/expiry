import { Router } from 'express';
import { createHash } from 'node:crypto';
import { DomainError, allow } from '../../shared/domain.mjs';
import { passwordVerifier, validatePassword, verifyPassword, newSessionToken, tokenHash, csrfToken, matchesCsrf } from './auth.crypto.mjs';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const invalid = () => { throw new DomainError(422, 'VALIDATION_ERROR'); };
const emailAddress = value => {
  if (typeof value !== 'string') invalid();
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+\-/=?^_`{|}~]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email)) invalid();
  return email;
};

function cookieToken(req, name) {
  const header = req.headers.cookie;
  if (typeof header !== 'string' || header.length > 8192) return null;
  const values = header.split(';').map(value => value.trim()).filter(value => value.startsWith(`${name}=`));
  if (values.length !== 1) return null;
  const token = values[0].slice(name.length + 1);
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

export function createAuthRateLimiter({ windowMs = 15 * 60 * 1000, maxIp = 20, maxEmail = 10, maxKeys = 10000 } = {}) {
  const buckets = new Map();
  return (ip, email, now) => {
    const timestamp = now.getTime();
    for (const [key, bucket] of buckets) if (bucket.expires <= timestamp) buckets.delete(key);
    const emailKey = createHash('sha256').update(email).digest('hex');
    const keys = [[`ip:${ip}`, maxIp], [`email:${emailKey}`, maxEmail]];
    if (buckets.size + keys.filter(([key]) => !buckets.has(key)).length > maxKeys) throw new DomainError(429, 'AUTH_RATE_LIMITED');
    for (const [key, limit] of keys) {
      const bucket = buckets.get(key) ?? { count: 0, expires: timestamp + windowMs };
      bucket.count += 1;
      buckets.set(key, bucket);
      if (bucket.count > limit) throw new DomainError(429, 'AUTH_RATE_LIMITED');
    }
  };
}

export function createAuthBoundary({
  repository,
  allowedOrigins = [],
  secureCookies = process.env.NODE_ENV === 'production',
  now = () => new Date(),
  absoluteTimeoutMs = 8 * 60 * 60 * 1000,
  idleTimeoutMs = 30 * 60 * 1000,
  rateLimit = createAuthRateLimiter()
} = {}) {
  if (!repository) throw new Error('Auth repository is required');
  if (!Number.isSafeInteger(absoluteTimeoutMs) || absoluteTimeoutMs <= 0 || !Number.isSafeInteger(idleTimeoutMs) || idleTimeoutMs <= 0 || idleTimeoutMs > absoluteTimeoutMs) throw new Error('Invalid session lifetime');
  const origins = new Set(allowedOrigins.map(value => {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== value || secureCookies && parsed.protocol !== 'https:') throw new Error('Configure exact trusted HTTP(S) origins');
    return parsed.origin;
  }));
  const cookieName = secureCookies ? '__Host-expiry_session' : 'expiry_session';
  const cookieOptions = { httpOnly: true, secure: secureCookies, sameSite: 'lax', path: '/' };
  const router = Router();
  const wrap = handler => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
  const noStore = (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); };

  function requireTrustedOrigin(req, res, next) {
    if (!safeMethods.has(req.method) && (!origins.has(req.headers.origin) || req.headers['sec-fetch-site'] === 'cross-site')) return next(new DomainError(403, 'CSRF_FAILED'));
    next();
  }

  const authenticate = (req, res, next) => {
    const token = cookieToken(req, cookieName);
    if (!token) return next(new DomainError(401, 'AUTH_REQUIRED'));
    res.set('Cache-Control', 'no-store');
    Promise.resolve(repository.current(tokenHash(token), now, idleTimeoutMs)).then(session => {
      if (!session) {
        res.clearCookie(cookieName, cookieOptions);
        throw new DomainError(401, 'AUTH_REQUIRED');
      }
      req.auth = { ...session, token };
      req.userId = session.user.id;
      next();
    }).catch(next);
  };

  function requireCsrf(req, res, next) {
    if (safeMethods.has(req.method)) return next();
    requireTrustedOrigin(req, res, error => {
      if (error) return next(error);
      if (!req.auth || !matchesCsrf(req.auth.token, req.headers['x-csrf-token'])) return next(new DomainError(403, 'CSRF_FAILED'));
      next();
    });
  }

  const credentials = (req, register = false) => {
    if (!req.is('application/json')) invalid();
    allow(req.body, register ? ['email', 'password', 'display_name', 'timezone'] : ['email', 'password']);
    const email = emailAddress(req.body.email);
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.ip || req.socket.remoteAddress || 'unknown');
    rateLimit(clientIp, email, now());
    validatePassword(req.body.password);
    return { email, password: req.body.password };
  };
  const sessionData = () => {
    const token = newSessionToken();
    const created = now();
    return { token, record: { token_hash: tokenHash(token), created_at: created, expires_at: new Date(created.getTime() + absoluteTimeoutMs) } };
  };
  const sendSession = (res, user, token, expiry, status) => {
    res.cookie(cookieName, token, { ...cookieOptions, expires: new Date(expiry) });
    return res.status(status).json({ user, csrf_token: csrfToken(token), expires_at: new Date(expiry).toISOString() });
  };

  router.use(noStore);
  router.post('/register', requireTrustedOrigin, wrap(async (req, res) => {
    const input = credentials(req, true);
    if (typeof req.body.display_name !== 'string' || !req.body.display_name.trim() || [...req.body.display_name.trim()].length > 100) invalid();
    const timezone = req.body.timezone ?? 'Asia/Ho_Chi_Minh';
    if (typeof timezone !== 'string' || timezone.length > 100) invalid();
    try { new Intl.DateTimeFormat('en-US', { timeZone: timezone }); } catch { invalid(); }
    const stored = await passwordVerifier(input.password);
    const { token, record } = sessionData();
    const previous = cookieToken(req, cookieName);
    const user = await repository.register({ email: input.email, password_verifier: stored, display_name: req.body.display_name.trim(), timezone }, record, previous ? tokenHash(previous) : null);
    return sendSession(res, user, token, record.expires_at, 201);
  }));
  router.post('/login', requireTrustedOrigin, wrap(async (req, res) => {
    const input = credentials(req);
    const credential = await repository.findCredential(input.email);
    if (!await verifyPassword(input.password, credential?.password_verifier)) throw new DomainError(401, 'INVALID_CREDENTIALS');
    const { token, record } = sessionData();
    const previous = cookieToken(req, cookieName);
    await repository.createSession(credential.user.id, record, previous ? tokenHash(previous) : null);
    return sendSession(res, credential.user, token, record.expires_at, 200);
  }));
  router.get('/session', authenticate, (req, res) => {
    res.json({ user: req.auth.user, csrf_token: csrfToken(req.auth.token), expires_at: req.auth.expires_at });
  });
  router.post('/logout', authenticate, requireCsrf, wrap(async (req, res) => {
    await repository.revoke(tokenHash(req.auth.token), now());
    res.clearCookie(cookieName, cookieOptions);
    res.status(204).end();
  }));

  return { router, requireAuth: authenticate, requireCsrf, requireTrustedOrigin, cookieName };
}
