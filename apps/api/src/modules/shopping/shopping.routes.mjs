import { Router } from 'express';
export function createShoppingRouter(controller) {
  const router = Router();
  router.get('/shopping-items', controller.list);
  router.post('/shopping-items', controller.create);
  router.post('/shopping-items/import', controller.importLegacy);
  router.patch('/shopping-items/:id', controller.update);
  router.delete('/shopping-items/:id', controller.remove);
  return router;
}
