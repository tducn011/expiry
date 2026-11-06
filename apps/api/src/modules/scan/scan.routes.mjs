import { Router } from 'express';
import { DomainError } from '../../shared/domain.mjs';

/**
 * In-memory per-user scan rate limiter.
 * Allows up to `maxPerUser` requests per `windowMs` milliseconds per authenticated user.
 * Falls back to IP-keyed limiting for unauthenticated requests.
 */
export function createScanRateLimiter({ windowMs = 60 * 1000, maxPerUser = 10, maxKeys = 10000 } = {}) {
  const buckets = new Map();
  return (req) => {
    const key = req.userId ? `user:${req.userId}` : `ip:${req.ip || 'unknown'}`;
    const now = Date.now();
    // Evict expired entries
    for (const [k, bucket] of buckets) {
      if (bucket.expires <= now) buckets.delete(k);
    }
    if (!buckets.has(key) && buckets.size >= maxKeys) {
      throw new DomainError(429, 'SCAN_RATE_LIMITED');
    }
    const bucket = buckets.get(key) ?? { count: 0, expires: now + windowMs };
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > maxPerUser) throw new DomainError(429, 'SCAN_RATE_LIMITED');
  };
}

export function createScanRouter(controller, { rateLimiter = createScanRateLimiter() } = {}) {
  const router = Router();

  const scanRateLimit = (req, res, next) => {
    try {
      rateLimiter(req);
      next();
    } catch (err) {
      next(err);
    }
  };

  // Timeout guard middleware: abort if the scan handler takes longer than 15 seconds
  const scanTimeout = (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          type: 'https://api.expiry.app/problems/SCAN_TIMEOUT',
          title: 'SCAN_TIMEOUT',
          status: 503,
          code: 'SCAN_TIMEOUT',
          detail: 'Scan service did not respond in time. Please try again.',
        });
      }
    }, 15000);
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };

  router.post('/scans', scanRateLimit, scanTimeout, controller.upload);
  router.post('/scan', scanRateLimit, scanTimeout, controller.scan);

  return router;
}
