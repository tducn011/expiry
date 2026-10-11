import { DomainError } from './domain.mjs';

export function idempotencyMiddleware(req, res, next) {
  // Only require Idempotency-Key on mutation operations
  if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
    const key = req.headers['idempotency-key'];
    if (key) {
      if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{8,100}$/.test(key)) {
        return next(new DomainError(400, 'INVALID_IDEMPOTENCY_KEY'));
      }
      req.idempotencyKey = key;
    } else return next(new DomainError(400, 'IDEMPOTENCY_KEY_REQUIRED'));
  }
  next();
}

export function errorHandler(err, req, res, next) {
  if (err instanceof DomainError) {
    return res.status(err.status).type('application/problem+json').json({
      type: `https://api.expiry.app/problems/${err.code}`,
      title: err.code,
      status: err.status,
      detail: err.message || err.code
    });
  }

  if (err.type === 'entity.too.large') return res.status(413).type('application/problem+json').json({
    type: 'https://api.expiry.app/problems/PAYLOAD_TOO_LARGE', title: 'PAYLOAD_TOO_LARGE', status: 413, detail: 'Request body exceeds the configured limit.'
  });
  if (err.type === 'entity.parse.failed') return res.status(400).type('application/problem+json').json({
    type: 'https://api.expiry.app/problems/MALFORMED_JSON', title: 'MALFORMED_JSON', status: 400, detail: 'Request body is not valid JSON.'
  });
  // Never expose SQL statements, credential-bearing request data or DB errors.
  console.error('Unhandled API error', { code: err.code || err.name });
  return res.status(500).type('application/problem+json').json({
    type: 'https://api.expiry.app/problems/INTERNAL_SERVER_ERROR',
    title: 'INTERNAL_SERVER_ERROR',
    status: 500,
    detail: 'An unexpected server error occurred.'
  });
}
