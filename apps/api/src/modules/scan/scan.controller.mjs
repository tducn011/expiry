export class ScanController {
  constructor(scanService) {
    this.service = scanService;
  }

  upload = (req, res, next) => this.scan(req, res, next);

  scan = async (req, res, next) => {
    try {
      const image = req.is('multipart/form-data') ? await readMultipartImage(req) : null;
      const imageBase64 = req.body?.image_base64;
      const correlationId = req.headers['x-correlation-id'] || req.idempotencyKey;
      const result = await this.service.scanImage({ imageBytes: image?.bytes, mediaType: image?.mediaType, imageBase64, correlationId });
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
import { readMultipartImage } from './scan.upload.mjs';
