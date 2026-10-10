import { Router } from 'express';

export function createScanRouter(controller) {
  const router = Router();

  router.post('/scan', controller.scan);
  router.get('/scan/health', controller.health);

  return router;
}
