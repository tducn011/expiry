import { DomainError } from '../../shared/domain.mjs';
import { checkedImage, decodeBase64Image } from './scan.upload.mjs';

const calendarDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const stringArray = value => Array.isArray(value) && value.every(item => typeof item === 'string');

export function publicScanResult(result) {
  const candidate = result?.candidates?.expiry_date;
  if (typeof result?.raw_text !== 'string' || !result.raw_text.trim() || !candidate ||
      ![null, 'exact', 'inferred'].includes(candidate.date_certainty) ||
      !['expiry', 'best_before', 'use_by', 'manufactured', 'unknown'].includes(candidate.date_label_type) ||
      candidate.value !== null && !calendarDate(candidate.value) ||
      typeof candidate.source_text !== 'string' || typeof candidate.ambiguous !== 'boolean' ||
      !Array.isArray(candidate.alternatives) || !candidate.alternatives.every(calendarDate) ||
      !stringArray(result.warnings) || !stringArray(result.errors) ||
      result.candidates.food_name !== null && typeof result.candidates.food_name !== 'string') {
    throw new DomainError(502, 'INVALID_SCAN_RESPONSE');
  }
  const manufactured = result.candidates.manufactured_date;
  if (!manufactured || manufactured.value !== null && !calendarDate(manufactured.value) || typeof manufactured.source_text !== 'string') throw new DomainError(502, 'INVALID_SCAN_RESPONSE');
  return {
    raw_text: result.raw_text,
    candidates: {
      food_name: result.candidates.food_name,
      expiry_date: {
        value: candidate.ambiguous || candidate.date_label_type === 'manufactured' ? null : candidate.value,
        date_certainty: candidate.date_certainty,
        date_label_type: candidate.date_label_type,
        source_text: candidate.source_text,
        alternatives: [...candidate.alternatives], ambiguous: candidate.ambiguous,
        requires_confirmation: true
      },
      manufactured_date: { value: manufactured.value, source_text: manufactured.source_text }
    },
    warnings: [...result.warnings], errors: [...result.errors], requires_confirmation: true
  };
}

export class ScanService {
  constructor(baseUrl = process.env.SCAN_SERVICE_URL || 'http://127.0.0.1:8000', options = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetch = options.fetch ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 3000;
  }

  async request(path, options, project) {
    const controller = new AbortController();
    let timer;
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => { controller.abort(); reject(new DomainError(504, 'SCAN_TIMEOUT')); }, this.timeoutMs);
    });
    try {
      const work = (async () => {
        const response = await this.fetch(`${this.baseUrl}${path}`, { ...options, signal: controller.signal });
        if (!response.ok) {
          const status = [400, 413, 415, 422, 500, 503, 504].includes(response.status) ? response.status : 502;
          const payload = await response.json().catch(() => ({}));
          const knownCodes = new Set(['INVALID_BASE64', 'INVALID_IMAGE_BYTES', 'INVALID_REQUEST', 'INVALID_MULTIPART', 'IMAGE_TOO_LARGE', 'UNSUPPORTED_MEDIA_TYPE', 'NO_LEGIBLE_TEXT', 'OCR_ENGINE_UNAVAILABLE', 'OCR_TIMEOUT', 'OCR_FAILED']);
          throw new DomainError(status, knownCodes.has(payload.code) ? payload.code : 'SCAN_FAILED');
        }
        return project(await response.json());
      })();
      return await Promise.race([work, deadline]);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      if (controller.signal.aborted) throw new DomainError(504, 'SCAN_TIMEOUT');
      throw new DomainError(503, 'SCAN_SERVICE_UNAVAILABLE');
    } finally { clearTimeout(timer); }
  }

  async health() {
    return this.request('/health', {}, result => {
      if (typeof result?.tesseract_available !== 'boolean') throw new DomainError(502, 'INVALID_SCAN_RESPONSE');
      return { status: result.tesseract_available ? 'healthy' : 'unavailable', service: 'python-scan', version: result.version, tesseract_available: result.tesseract_available };
    });
  }

  async scanImage({ imageBytes, mediaType, imageBase64, correlationId }) {
    const image = imageBytes ? checkedImage(imageBytes, mediaType) : decodeBase64Image(imageBase64);
    const headers = { 'Content-Type': 'application/json' };
    if (typeof correlationId === 'string') headers['X-Correlation-ID'] = correlationId;
    return this.request('/scan', {
      method: 'POST', headers, body: JSON.stringify({ image_base64: image.bytes.toString('base64') })
    }, publicScanResult);
  }
}
