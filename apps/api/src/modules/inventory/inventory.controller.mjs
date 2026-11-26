import { paginationQuery, queryInteger } from '../../shared/public-dto.mjs';
import { DomainError, categories } from '../../shared/domain.mjs';

const categorySlugMap = {
  fresh_produce: 'fresh_produce',
  'rau củ quả': 'fresh_produce',
  'rau củ': 'fresh_produce',
  'rau': 'fresh_produce',
  meat_seafood: 'meat_seafood',
  'thịt, cá, hải sản': 'meat_seafood',
  'thịt & cá': 'meat_seafood',
  'thịt': 'meat_seafood',
  'cá': 'meat_seafood',
  dairy_eggs: 'dairy_eggs',
  'trứng & sữa': 'dairy_eggs',
  'trứng và sữa': 'dairy_eggs',
  'trứng': 'dairy_eggs',
  'sữa': 'dairy_eggs',
  prepared_food: 'prepared_food',
  'món nấu sẵn': 'prepared_food',
  'đồ ăn sẵn': 'prepared_food',
  dry_pantry: 'dry_pantry',
  'gia vị & đồ khô': 'dry_pantry',
  'đồ khô': 'dry_pantry',
  beverage: 'beverage',
  'đồ uống': 'beverage',
  other: 'other',
  'khác': 'other'
};

export class InventoryController {
  constructor(inventoryService) {
    this.service = inventoryService;
  }

  create = async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (body.unit === 'gram') body.unit = 'g';
      if (body.unit === 'milliliter') body.unit = 'ml';
      if (typeof body.quantity === 'number') body.quantity = String(body.quantity);
      if (body.quantity === undefined && body.initial_quantity !== undefined) {
        body.quantity = String(body.initial_quantity);
      }
      if (body.category && typeof body.category === 'string') {
        const mapped = categorySlugMap[body.category.trim().toLowerCase()];
        if (mapped) body.category = mapped;
      }
      const result = await this.service.createEntry(req.userId, req.idempotencyKey, body);
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

      let category = req.query.category;
      if (category === 'all' || category === '') {
        category = undefined;
      } else if (category !== undefined) {
        const catLower = typeof category === 'string' ? category.trim().toLowerCase() : '';
        const mapped = categorySlugMap[catLower];
        if (mapped) category = mapped;
      }
      if (category !== undefined && !categories.includes(category)) {
        throw new DomainError(422, 'VALIDATION_ERROR');
      }

      let attentionFilter = req.query.attention;
      if (attentionFilter === 'all' || attentionFilter === '') {
        attentionFilter = undefined;
      } else if (attentionFilter !== undefined) {
        const attLower = typeof attentionFilter === 'string' ? attentionFilter.trim().toLowerCase() : '';
        if (attLower === 'past' || attLower === 'expired') attentionFilter = 'past_date';
        else if (attLower === 'today' || attLower === 'due_today') attentionFilter = 'due_today';
        else if (attLower === 'soon' || attLower === 'expiring' || attLower === 'expiring_soon') attentionFilter = 'soon';
      }

      let location = req.query.location;
      if (location === 'all' || location === '') {
        location = undefined;
      }

      const query = {
        view,
        lifecycle: req.query.lifecycle ?? 'active',
        attention: attentionFilter,
        ...paginationQuery(req.query),
        q: req.query.q ?? '',
        location,
        category
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
      const body = { ...req.body };
      if (body.version !== undefined && body.expected_version === undefined) {
        body.expected_version = body.version;
        delete body.version;
      }
      if (body.category && typeof body.category === 'string') {
        const mapped = categorySlugMap[body.category.trim().toLowerCase()];
        if (mapped) body.category = mapped;
      }
      const result = await this.service.editEntry(req.userId, req.idempotencyKey, req.params.id, body);
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
      const body = { ...req.body };
      if (body.amount === undefined && body.quantity_delta !== undefined) {
        const raw = String(body.quantity_delta).trim();
        body.amount = raw.startsWith('-') ? raw.slice(1) : raw;
        delete body.quantity_delta;
      }
      if (body.kind === undefined && body.movement_type !== undefined) {
        if (body.movement_type === 'consumed') body.kind = 'consume';
        else if (body.movement_type === 'discarded') body.kind = 'discard';
        else body.kind = body.movement_type;
        delete body.movement_type;
      }
      if (body.reason === undefined && body.note !== undefined) {
        body.reason = body.note;
        delete body.note;
      }
      if (body.expected_version === undefined && body.version !== undefined) {
        body.expected_version = body.version;
        delete body.version;
      }
      const result = await this.service.recordMovement(req.userId, req.idempotencyKey, req.params.id, body);
      if (result.replayed) {
        res.setHeader('Idempotency-Replayed', 'true');
      }
      return res.status(result.status).json(result.body);
    } catch (err) {
      if (err.code === 'INSUFFICIENT_QUANTITY') {
        err.status = 422;
      }
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
      const body = { ...req.body };
      if (body.target_quantity !== undefined && body.actual_quantity === undefined) {
        body.actual_quantity = typeof body.target_quantity === 'number' ? String(body.target_quantity) : body.target_quantity;
        delete body.target_quantity;
      }
      if (body.note !== undefined && body.reason === undefined) {
        body.reason = body.note;
        delete body.note;
      }
      if (body.version !== undefined && body.expected_version === undefined) {
        body.expected_version = body.version;
        delete body.version;
      }
      const result = await this.service.recountQuantity(req.userId, req.idempotencyKey, req.params.id, body);
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
