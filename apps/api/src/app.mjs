import express from 'express';
import cors from 'cors';
import { idempotencyMiddleware, errorHandler } from './shared/middleware.mjs';
import { AuthRepository } from './modules/auth/auth.repository.mjs';
import { createAuthBoundary } from './modules/auth/auth.routes.mjs';
import { InventoryService } from './modules/inventory/inventory.service.mjs';
import { InventoryController } from './modules/inventory/inventory.controller.mjs';
import { createInventoryRouter } from './modules/inventory/inventory.routes.mjs';
import { ExpiryService } from './modules/expiry/expiry.service.mjs';
import { ExpiryController } from './modules/expiry/expiry.controller.mjs';
import { createExpiryRouter } from './modules/expiry/expiry.routes.mjs';
import { ScanService } from './modules/scan/scan.service.mjs';
import { ScanController } from './modules/scan/scan.controller.mjs';
import { createScanRouter } from './modules/scan/scan.routes.mjs';

export function createApp({ database, scanServiceUrl, authRepository, allowedOrigins, secureCookies = process.env.NODE_ENV === 'production', now, scanOptions = {} } = {}) {
  const app = express();
  app.disable('x-powered-by');
  const configuredOrigins = allowedOrigins ?? (process.env.APP_ORIGIN
    ? process.env.APP_ORIGIN.split(',').map(value => value.trim()).filter(Boolean)
    : secureCookies ? ['https://expiry.vercel.app', 'https://expiryapp.vercel.app', 'https://demoexpiry.vercel.app'] : ['http://localhost:8443', 'http://127.0.0.1:8443', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4174', 'http://127.0.0.1:4174', 'http://localhost:3001', 'http://127.0.0.1:3001', 'https://expiry.vercel.app', 'https://expiryapp.vercel.app', 'https://demoexpiry.vercel.app']);
  if (secureCookies && configuredOrigins.length === 0) throw new Error('Production requires APP_ORIGIN with the exact HTTPS frontend origin');
  const auth = createAuthBoundary({ repository: authRepository ?? new AuthRepository(database), allowedOrigins: configuredOrigins, secureCookies, ...(now ? { now } : {}) });

  // Basic middleware
  app.use(cors({ credentials: true, origin: (origin, callback) => callback(null, !origin || configuredOrigins.includes(origin)) }));
  app.use(express.json({ limit: '10mb' }));

  // Root healthcheck
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'expiry-api',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // API v1 Router
  const v1Router = express.Router();

  // Credential endpoints precede domain commands. Ownership comes only from a
  // durable verified session; caller identity headers have no authority.
  v1Router.use('/auth', auth.router);
  v1Router.use(auth.requireAuth);
  v1Router.use(auth.requireCsrf);

  // Extraction is transient and does not reserve a mutation replay key.
  const scanService = new ScanService(scanServiceUrl, scanOptions);
  const scanController = new ScanController(scanService);
  v1Router.use('/', createScanRouter(scanController));
  v1Router.use(idempotencyMiddleware);

  // Initialize modular services
  const inventoryService = new InventoryService(database);
  const inventoryController = new InventoryController(inventoryService);
  v1Router.use('/', createInventoryRouter(inventoryController));

  const expiryService = new ExpiryService(database);
  const expiryController = new ExpiryController(expiryService);
  v1Router.use('/', createExpiryRouter(expiryController));

  // Mount API v1
  app.use('/api/v1', v1Router);

  // Fallback 404
  app.use((req, res) => {
    res.status(404).type('application/problem+json').json({
      type: 'https://api.expiry.app/problems/NOT_FOUND',
      title: 'NOT_FOUND',
      status: 404,
      code: 'NOT_FOUND',
      detail: `Route ${req.method} ${req.originalUrl} not found.`
    });
  });


  // Global Error Handler
  app.use(errorHandler);

  return app;
}
