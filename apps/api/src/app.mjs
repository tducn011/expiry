import express from 'express';
import cors from 'cors';
import { idempotencyMiddleware, errorHandler } from './shared/middleware.mjs';
import { connect } from './shared/connection.mjs';
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
  // Kích hoạt nhận diện IP client từ X-Forwarded-For của reverse proxy (Vercel, Cloudflare Tunnel, Nginx)
  app.set('trust proxy', 1);
  const configuredOrigins = allowedOrigins ?? (process.env.APP_ORIGIN
    ? process.env.APP_ORIGIN.split(',').map(value => value.trim()).filter(Boolean)
    : secureCookies ? ['https://expiry.vercel.app', 'https://expiryapp.vercel.app', 'https://demoexpiry.vercel.app', 'https://homeserver.tailc535bb.ts.net'] : ['http://localhost:8443', 'http://127.0.0.1:8443', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4174', 'http://127.0.0.1:4174', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://100.80.6.17', 'http://100.80.6.17:7680', 'http://100.80.6.17:8443', 'http://192.168.100.179', 'http://192.168.100.179:7680', 'https://homeserver.tailc535bb.ts.net', 'https://expiry.vercel.app', 'https://expiryapp.vercel.app', 'https://demoexpiry.vercel.app']);
  if (secureCookies && configuredOrigins.length === 0) throw new Error('Production requires APP_ORIGIN with the exact HTTPS frontend origin');
  const auth = createAuthBoundary({ repository: authRepository ?? new AuthRepository(database), allowedOrigins: configuredOrigins, secureCookies, ...(now ? { now } : {}) });

  // Basic middleware
  app.use(cors({ credentials: true, origin: (origin, callback) => callback(null, !origin || configuredOrigins.includes(origin)) }));
  app.use(express.json({ limit: '10mb' }));

  // Root healthcheck
  app.get('/health', async (req, res) => {
    let dbStatus = 'unverified';
    try {
      const c = await connect(database);
      const [rows] = await c.query('SELECT 1 as connected');
      await c.end();
      if (Number(rows?.[0]?.connected) === 1) dbStatus = 'connected';
    } catch {
      dbStatus = 'unavailable';
    }

    res.json({
      status: 'ok',
      service: 'expiry-api',
      version: '1.0.0',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  });

  // Dedicated DB check endpoint with live metrics
  app.get('/health/db', async (req, res) => {
    try {
      const c = await connect(database);
      const [[dbInfo]] = await c.query('SELECT 1 as connected, DATABASE() as db, VERSION() as version');
      const [[foodCount]] = await c.query('SELECT COUNT(*) as total FROM food_entries WHERE deleted_at IS NULL');
      const [[userCount]] = await c.query('SELECT COUNT(*) as total FROM users');
      await c.end();
      res.json({
        status: 'ok',
        database: {
          connected: true,
          name: dbInfo.db,
          mysqlVersion: dbInfo.version,
          activeFoodEntries: Number(foodCount.total),
          totalUsers: Number(userCount.total)
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(503).json({
        status: 'error',
        database: {
          connected: false,
          error: err.message
        },
        timestamp: new Date().toISOString()
      });
    }
  });

  // API v1 Router
  const v1Router = express.Router();

  // Extraction service
  const scanService = new ScanService(scanServiceUrl, scanOptions);
  const scanController = new ScanController(scanService);

  // Public health check for OCR microservice monitoring
  v1Router.get('/scan/health', scanController.health);

  // Credential endpoints precede domain commands. Ownership comes only from a
  // durable verified session; caller identity headers have no authority.
  v1Router.use('/auth', auth.router);
  v1Router.use(auth.requireAuth);
  v1Router.use(auth.requireCsrf);

  // Extraction is transient and does not reserve a mutation replay key.
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
