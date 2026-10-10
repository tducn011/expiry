export class ExpiryController {
  constructor(expiryService) {
    this.service = expiryService;
  }

  getPreferences = async (req, res, next) => {
    try {
      const prefs = await this.service.getPreferences(req.userId);
      return res.status(200).json(prefs);
    } catch (err) {
      next(err);
    }
  };

  updatePreferences = async (req, res, next) => {
    try {
      const result = await this.service.updatePreferences(req.userId, req.idempotencyKey, req.body);
      if (result.replayed) {
        res.setHeader('Idempotency-Replayed', 'true');
      }
      return res.status(result.status).json(result.body);
    } catch (err) {
      next(err);
    }
  };
}
