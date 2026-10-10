export class ScanService {
  constructor(baseUrl = process.env.SCAN_SERVICE_URL || 'http://127.0.0.1:8000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async health() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) throw new Error(`Scan service returned ${res.status}`);
      return await res.json();
    } catch (err) {
      return { status: 'unavailable', service: 'python-scan', error: err.message };
    }
  }

  async scanImage({ imageBase64, correlationId }) {
    if (!imageBase64) {
      const error = new Error('image_base64 is required');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const headers = {
      'Content-Type': 'application/json'
    };
    if (correlationId) {
      headers['X-Correlation-ID'] = correlationId;
    }

    try {
      const res = await fetch(`${this.baseUrl}/scan`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ image_base64: imageBase64 })
      });

      if (!res.ok) {
        const errorText = await res.text();
        const error = new Error(`Scan service error: ${errorText}`);
        error.status = res.status;
        error.code = 'SCAN_FAILED';
        throw error;
      }

      return await res.json();
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        const error = new Error('Python Scan Service is currently unreachable');
        error.status = 503;
        error.code = 'SCAN_SERVICE_UNAVAILABLE';
        throw error;
      }
      throw err;
    }
  }
}
