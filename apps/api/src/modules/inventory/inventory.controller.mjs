export class InventoryController {
  constructor(inventoryService) {
    this.service = inventoryService;
  }

  create = async (req, res, next) => {
    try {
      const result = await this.service.createEntry(req.userId, req.idempotencyKey, req.body);
      if (result.replayed) {
        res.setHeader('Idempotency-Replayed', 'true');
      }
      res.setHeader('Location', `/api/v1/food-entries/${result.body?.id}`);
      return res.status(result.status).json(result.body);
    } catch (err) {
      next(err);
    }
  };

  list = async (req, res, next) => {
    try {
      const query = {
        view: req.query.view || 'inventory',
        lifecycle: req.query.lifecycle || 'active',
        attention: req.query.attention,
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        q: req.query.q || '',
        location: req.query.location
      };
      const result = await this.service.listEntries(req.userId, query);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  get = async (req, res, next) => {
    try {
      const entry = await this.service.getEntry(req.userId, req.params.id);
      return res.status(200).json(entry);
    } catch (err) {
      next(err);
    }
  };

  edit = async (req, res, next) => {
    try {
      const result = await this.service.editEntry(req.userId, req.idempotencyKey, req.params.id, req.body);
      if (result.replayed) {
        res.setHeader('Idempotency-Replayed', 'true');
      }
      return res.status(result.status).json(result.body);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req, res, next) => {
    try {
      const result = await this.service.removeEntry(req.userId, req.idempotencyKey, req.params.id, req.body || {});
      if (result.replayed) {
        res.setHeader('Idempotency-Replayed', 'true');
      }
      return res.status(result.status).send();
    } catch (err) {
      next(err);
    }
  };

  restore = async (req, res, next) => {
    try {
      const result = await this.service.restoreEntry(req.userId, req.idempotencyKey, req.params.id, req.body || {});
      if (result.replayed) {
        res.setHeader('Idempotency-Replayed', 'true');
      }
      return res.status(result.status).json(result.body);
    } catch (err) {
      next(err);
    }
  };

  recordMovement = async (req, res, next) => {
    try {
      const result = await this.service.recordMovement(req.userId, req.idempotencyKey, req.params.id, req.body);
      if (result.replayed) {
        res.setHeader('Idempotency-Replayed', 'true');
      }
      return res.status(result.status).json(result.body);
    } catch (err) {
      next(err);
    }
  };

  listMovements = async (req, res, next) => {
    try {
      const movements = await this.service.listMovements(req.userId, req.params.id);
      return res.status(200).json({ items: movements });
    } catch (err) {
      next(err);
    }
  };

  recount = async (req, res, next) => {
    try {
      const result = await this.service.recountQuantity(req.userId, req.idempotencyKey, req.params.id, req.body);
      if (result.replayed) {
        res.setHeader('Idempotency-Replayed', 'true');
      }
      return res.status(result.status).json(result.body);
    } catch (err) {
      next(err);
    }
  };

  listTrash = async (req, res, next) => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        q: req.query.q || ''
      };
      const result = await this.service.listTrash(req.userId, query);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
