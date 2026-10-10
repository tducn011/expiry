export class ScanController {
  constructor(scanService) {
    this.service = scanService;
  }

  scan = async (req, res, next) => {
    try {
      const imageBase64 = req.body.image_base64 || req.body.file;
      const correlationId = req.headers['x-correlation-id'] || req.idempotencyKey;
      const result = await this.service.scanImage({ imageBase64, correlationId });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  health = async (req, res, next) => {
    try {
      const status = await this.service.health();
      return res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  };
}
