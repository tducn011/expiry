import { paginationQuery, queryInteger } from '../../shared/public-dto.mjs';
import { DomainError } from '../../shared/domain.mjs';

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
      const view = req.query.view ?? 'inventory';
      if (!['inventory', 'attention'].includes(view)) throw new DomainError(422, 'VALIDATION_ERROR');
      const query = {
        view,
        lifecycle: req.query.lifecycle ?? 'active',
        attention: req.query.attention,
        ...paginationQuery(req.query),
        q: req.query.q ?? '',
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
      const input = { expected_version: queryInteger(req.query.expected_version ?? req.query.version) };
      const result = await this.service.removeEntry(req.userId, req.idempotencyKey, req.params.id, input);
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
      const body = req.body && req.body.expected_version === undefined && req.body.version !== undefined
        ? { expected_version: req.body.version }
        : (req.body || {});
      const result = await this.service.restoreEntry(req.userId, req.idempotencyKey, req.params.id, body);
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
      const result = await this.service.listMovements(req.userId, req.params.id, paginationQuery(req.query));
      return res.status(200).json(result);
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
        ...paginationQuery(req.query),
        q: req.query.q ?? '',
        location: req.query.location
      };
      const result = await this.service.listTrash(req.userId, query);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
