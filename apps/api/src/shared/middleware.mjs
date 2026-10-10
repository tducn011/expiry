import { DomainError } from './domain.mjs';

// Default demo owner for sandbox / test runs when auth is not provided
export const DEFAULT_DEMO_USER = '00000000-0000-4000-8000-000000000001';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  let userId = req.headers['x-user-id'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.slice(7).trim();
  }

  // Use provided user ID or fallback to demo user ID
  req.userId = userId || DEFAULT_DEMO_USER;
  next();
}

export function idempotencyMiddleware(req, res, next) {
  // Only require Idempotency-Key on mutation operations
  if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
    const key = req.headers['idempotency-key'];
    if (key) {
      if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{8,100}$/.test(key)) {
        return res.status(400).json({
          type: 'https://api.expiry.app/problems/INVALID_IDEMPOTENCY_KEY',
          title: 'INVALID_IDEMPOTENCY_KEY',
          status: 400,
          detail: 'Idempotency-Key header must be 8-100 characters of [A-Za-z0-9_-].'
        });
      }
      req.idempotencyKey = key;
    } else {
      // Auto-generate safe key for browser clients that don't supply one
      req.idempotencyKey = `auto_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }
  }
  next();
}

export function errorHandler(err, req, res, next) {
  if (err instanceof DomainError) {
    return res.status(err.status).json({
      type: `https://api.expiry.app/problems/${err.code}`,
      title: err.code,
      status: err.status,
      detail: err.message || err.code
    });
  }

  console.error('Unhandled API Error:', err);
  return res.status(500).json({
    type: 'https://api.expiry.app/problems/INTERNAL_SERVER_ERROR',
    title: 'INTERNAL_SERVER_ERROR',
    status: 500,
    detail: err.message || 'An unexpected error occurred.'
  });
}
