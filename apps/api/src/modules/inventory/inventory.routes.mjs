import { Router } from 'express';

export function createInventoryRouter(controller) {
  const router = Router();

  // /food-entries
  router.post('/food-entries', controller.create);
  router.get('/food-entries', controller.list);

  // /food-entries/:id
  router.get('/food-entries/:id', controller.get);
  router.patch('/food-entries/:id', controller.edit);
  router.delete('/food-entries/:id', controller.remove);

  // /food-entries/:id/movements
  router.post('/food-entries/:id/movements', controller.recordMovement);
  router.get('/food-entries/:id/movements', controller.listMovements);

  // /food-entries/:id/recounts
  router.post('/food-entries/:id/recounts', controller.recount);

  // /food-entries/:id/restore
  router.post('/food-entries/:id/restore', controller.restore);

  // /trash/food-entries
  router.get('/trash/food-entries', controller.listTrash);

  return router;
}
