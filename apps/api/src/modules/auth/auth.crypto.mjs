import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { DomainError } from '../../shared/domain.mjs';

const derive = promisify(scrypt);
// OWASP's scrypt fallback: N=2^17, r=8, p=1. Explicit maxmem exceeds 128 MiB.
const options = Object.freeze({ N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 });
const dummyVerifier = `scrypt$131072$8$1$${randomBytes(16).toString('hex')}$${randomBytes(64).toString('hex')}`;
let activeDerivations = 0;
const derivationQueue = [];
const maxQueuedDerivations = 8;
const queueTimeoutMs = 2000;

function overloaded() {
  const error = new DomainError(429, 'AUTH_RATE_LIMITED');
  error.retryAfter = 1;
  return error;
}

async function acquireDerivationSlot() {
  if (activeDerivations < 2) {
    activeDerivations += 1;
    return;
  }
  if (derivationQueue.length >= maxQueuedDerivations) throw overloaded();
  await new Promise((resolve, reject) => {
    const waiter = {
      resolve,
      reject,
      timeout: setTimeout(() => {
        const index = derivationQueue.indexOf(waiter);
        if (index !== -1) derivationQueue.splice(index, 1);
        reject(overloaded());
      }, queueTimeoutMs)
    };
    derivationQueue.push(waiter);
  });
}

function releaseDerivationSlot() {
  const next = derivationQueue.shift();
  if (next) {
    clearTimeout(next.timeout);
    next.resolve();
  } else {
    activeDerivations -= 1;
  }
}

async function passwordKey(password, salt) {
  await acquireDerivationSlot();
  try {
    return await derive(password, salt, 64, options);
  } finally {
    releaseDerivationSlot();
  }
}

export function validatePassword(password) {
  if (typeof password !== 'string' || [...password].length < 15 || [...password].length > 128) {
    throw new DomainError(422, 'VALIDATION_ERROR');
  }
  return password;
}

export async function passwordVerifier(password) {
  validatePassword(password);
  const salt = randomBytes(16);
  const hash = await passwordKey(password, salt);
  return `scrypt$131072$8$1$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(password, verifier) {
  validatePassword(password);
  const stored = verifier ?? dummyVerifier;
  const match = /^scrypt\$131072\$8\$1\$([0-9a-f]{32})\$([0-9a-f]{128})$/.exec(stored);
  // Malformed persisted credentials fail closed; never lower the work factor from input.
  if (!match) throw new DomainError(503, 'AUTH_UNAVAILABLE');
  const actual = await passwordKey(password, Buffer.from(match[1], 'hex'));
  const equal = timingSafeEqual(actual, Buffer.from(match[2], 'hex'));
  return verifier !== undefined && verifier !== null && equal;
}

export const newSessionToken = () => randomBytes(32).toString('base64url');
export const tokenHash = token => createHash('sha256').update(token).digest('hex');
export const csrfToken = token => createHmac('sha256', token).update('expiry-csrf-v1').digest('hex');

export function matchesCsrf(token, candidate) {
  if (typeof candidate !== 'string' || !/^[0-9a-f]{64}$/.test(candidate)) return false;
  return timingSafeEqual(Buffer.from(csrfToken(token), 'hex'), Buffer.from(candidate, 'hex'));
}
