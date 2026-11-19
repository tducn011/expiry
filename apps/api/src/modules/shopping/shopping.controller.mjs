export class ShoppingController {
  constructor(service) { this.service = service; }
  list = async (req,res,next) => { try { res.json({ items: await this.service.list(req.userId) }); } catch (e) { next(e); } };
  send = (res, result) => {
    if (result.replayed) res.setHeader('Idempotency-Replayed', 'true');
    return result.status === 204 ? res.status(204).end() : res.status(result.status).json(result.body);
  };
  create = async (req,res,next) => { try { this.send(res, await this.service.create(req.userId, req.idempotencyKey, req.body)); } catch (e) { next(e); } };
  update = async (req,res,next) => { try { this.send(res, await this.service.update(req.userId, req.idempotencyKey, req.params.id, req.body)); } catch (e) { next(e); } };
  remove = async (req,res,next) => { try { const result = await this.service.remove(req.userId, req.idempotencyKey, req.params.id); this.send(res, { ...result, status: 204 }); } catch (e) { next(e); } };
  importLegacy = async (req,res,next) => { try { this.send(res, await this.service.importLegacy(req.userId, req.idempotencyKey, req.body?.items)); } catch (e) { next(e); } };
}
