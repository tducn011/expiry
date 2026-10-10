import { Router } from 'express';

export function createExpiryRouter(controller) {
  const router = Router();

  router.get('/me/preferences', controller.getPreferences);
  router.patch('/me/preferences', controller.updatePreferences);

  return router;
}
