import express from 'express';
import cors from 'cors';
import { authMiddleware, idempotencyMiddleware, errorHandler } from './shared/middleware.mjs';
import { InventoryService } from './modules/inventory/inventory.service.mjs';
import { InventoryController } from './modules/inventory/inventory.controller.mjs';
import { createInventoryRouter } from './modules/inventory/inventory.routes.mjs';
import { ExpiryService } from './modules/expiry/expiry.service.mjs';
import { ExpiryController } from './modules/expiry/expiry.controller.mjs';
import { createExpiryRouter } from './modules/expiry/expiry.routes.mjs';
import { ScanService } from './modules/scan/scan.service.mjs';
import { ScanController } from './modules/scan/scan.controller.mjs';
import { createScanRouter } from './modules/scan/scan.routes.mjs';

export function createApp({ database, scanServiceUrl } = {}) {
  const app = express();

  // Basic middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

  // Domain security & idempotency
  v1Router.use(authMiddleware);
  v1Router.use(idempotencyMiddleware);

  // Initialize modular services
  const inventoryService = new InventoryService(database);
  const inventoryController = new InventoryController(inventoryService);
  v1Router.use('/', createInventoryRouter(inventoryController));

  const expiryService = new ExpiryService(database);
  const expiryController = new ExpiryController(expiryService);
  v1Router.use('/', createExpiryRouter(expiryController));

  const scanService = new ScanService(scanServiceUrl);
  const scanController = new ScanController(scanService);
  v1Router.use('/', createScanRouter(scanController));

  // Mount API v1
  app.use('/api/v1', v1Router);

  // Fallback 404
  app.use((req, res) => {
    res.status(404).json({
      type: 'https://api.expiry.app/problems/NOT_FOUND',
      title: 'NOT_FOUND',
      status: 404,
      detail: `Route ${req.method} ${req.originalUrl} not found.`
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
