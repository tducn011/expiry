import { DomainError } from '../../shared/domain.mjs';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 65536;
const MAX_BASE64_LENGTH = 4 * Math.ceil(MAX_IMAGE_BYTES / 3);
const supported = new Set(['image/jpeg', 'image/png', 'image/webp']);
const mediaTypeAliases = new Map([
  ['image/jpg', 'image/jpeg'],
  ['image/pjpeg', 'image/jpeg']
]);

export function imageMediaType(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  throw new DomainError(415, 'UNSUPPORTED_MEDIA_TYPE');
}

export function checkedImage(bytes, declaredMediaType) {
  if (!Buffer.isBuffer(bytes) || bytes.length === 0) throw new DomainError(400, 'INVALID_IMAGE_BYTES');
  if (bytes.length > MAX_IMAGE_BYTES) throw new DomainError(413, 'IMAGE_TOO_LARGE');
  const mediaType = imageMediaType(bytes);
  const declared = typeof declaredMediaType === 'string'
    ? declaredMediaType.split(';', 1)[0].trim().toLowerCase()
    : undefined;
  const normalizedDeclared = mediaTypeAliases.get(declared) ?? declared;
  if (normalizedDeclared !== undefined && normalizedDeclared !== 'application/octet-stream' &&
      (!supported.has(normalizedDeclared) || normalizedDeclared !== mediaType)) {
    throw new DomainError(415, 'UNSUPPORTED_MEDIA_TYPE');
  }
  // Python/Pillow performs complete codec decoding; a signature alone cannot
  // establish that all image bytes are valid.
  return { bytes, mediaType };
}

export function decodeBase64Image(value) {
  if (typeof value !== 'string' || value.length === 0) throw new DomainError(400, 'INVALID_BASE64');
  let declaredMediaType;
  if (value.startsWith('data:')) {
    const match = /^data:(image\/(?:jpeg|jpg|pjpeg|png|webp));base64,(.*)$/i.exec(value);
    if (!match) throw new DomainError(415, 'UNSUPPORTED_MEDIA_TYPE');
    [, declaredMediaType, value] = match;
  }
  if (value.length > MAX_BASE64_LENGTH) throw new DomainError(413, 'IMAGE_TOO_LARGE');
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new DomainError(400, 'INVALID_BASE64');
  const bytes = Buffer.from(value, 'base64');
  if (bytes.toString('base64') !== value) throw new DomainError(400, 'INVALID_BASE64');
  return checkedImage(bytes, declaredMediaType);
}

export async function readMultipartImage(req, field = 'image') {
  const contentType = req.headers['content-type'];
  if (typeof contentType !== 'string' || !/^multipart\/form-data(?:;|$)/i.test(contentType)) throw new DomainError(415, 'UNSUPPORTED_MEDIA_TYPE');
  const declaredLength = Number(req.headers['content-length']);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) throw new DomainError(413, 'IMAGE_TOO_LARGE');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_REQUEST_BYTES) throw new DomainError(413, 'IMAGE_TOO_LARGE');
    chunks.push(chunk);
  }
  let form;
  try {
    form = await new Request('http://scan-upload.invalid', {
      method: 'POST', headers: { 'Content-Type': contentType }, body: Buffer.concat(chunks)
    }).formData();
  } catch { throw new DomainError(400, 'INVALID_MULTIPART'); }
  const alternateField = field === 'image' ? 'file' : 'image';
  const files = [...form.getAll(field), ...form.getAll(alternateField)];
  if (files.length !== 1 || typeof files[0]?.arrayBuffer !== 'function') throw new DomainError(400, 'INVALID_IMAGE_UPLOAD');
  const file = files[0];
  if (file.size > MAX_IMAGE_BYTES) throw new DomainError(413, 'IMAGE_TOO_LARGE');
  return checkedImage(Buffer.from(await file.arrayBuffer()), file.type);
}
