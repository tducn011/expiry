import assert from 'node:assert/strict';
import test from 'node:test';
import { Readable } from 'node:stream';
import { checkedImage, decodeBase64Image, readMultipartImage } from '../src/modules/scan/scan.upload.mjs';

const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0x00]);

function multipartRequest(field, mediaType, bytes = jpeg) {
  const form = new FormData();
  form.append(field, new Blob([bytes], { type: mediaType }), 'capture.jpg');
  const request = new Request('http://scan-upload.invalid', { method: 'POST', body: form });
  return {
    headers: Object.fromEntries(request.headers),
    async *[Symbol.asyncIterator]() {
      for await (const chunk of Readable.fromWeb(request.body)) yield chunk;
    }
  };
}

test('normalizes legacy JPEG MIME types and infers octet-stream images from magic bytes', () => {
  for (const mediaType of ['image/jpeg', 'image/jpg', 'image/pjpeg', 'application/octet-stream']) {
    assert.equal(checkedImage(jpeg, mediaType).mediaType, 'image/jpeg');
  }
  assert.equal(
    decodeBase64Image(`data:image/jpg;base64,${jpeg.toString('base64')}`).mediaType,
    'image/jpeg'
  );
  assert.throws(() => checkedImage(jpeg, 'image/png'), { code: 'UNSUPPORTED_MEDIA_TYPE' });
});

test('accepts either file or image multipart field name', async () => {
  for (const field of ['image', 'file']) {
    const image = await readMultipartImage(multipartRequest(field, 'image/jpg'));
    assert.equal(image.mediaType, 'image/jpeg');
    assert.deepEqual(image.bytes, jpeg);
  }
});

test('rejects multiple image fields instead of choosing an ambiguous upload', async () => {
  const form = new FormData();
  form.append('image', new Blob([jpeg], { type: 'image/jpeg' }), 'one.jpg');
  form.append('file', new Blob([jpeg], { type: 'image/jpeg' }), 'two.jpg');
  const request = new Request('http://scan-upload.invalid', { method: 'POST', body: form });
  const multipart = {
    headers: Object.fromEntries(request.headers),
    async *[Symbol.asyncIterator]() {
      for await (const chunk of Readable.fromWeb(request.body)) yield chunk;
    }
  };
  await assert.rejects(readMultipartImage(multipart), { code: 'INVALID_IMAGE_UPLOAD' });
});
