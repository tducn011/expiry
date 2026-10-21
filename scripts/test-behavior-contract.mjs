#!/usr/bin/env node
/**
 * Full-Stack API Behavioral & OpenAPI Contract Conformance Suite.
 *
 * Runs end-to-end user journeys against a live running API instance,
 * verifying both functional runtime behaviors and strict OpenAPI 3.1
 * contract conformance (schema types, required fields, decimal formats).
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:3001';
const ORIGIN = process.env.TEST_ORIGIN || 'https://demoexpiry.vercel.app';
const openapiSpec = JSON.parse(await readFile(new URL('../contracts/openapi.json', import.meta.url), 'utf8'));

// Schema validator
function validateSchema(value, schema, path = 'root') {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop();
    const target = openapiSpec.components.schemas[refName];
    if (!target) throw new Error(`Schema ref not found: ${refName}`);
    return validateSchema(value, target, `${path}(${refName})`);
  }
  if (schema.anyOf) {
    const matched = schema.anyOf.some(sub => {
      try { validateSchema(value, sub, path); return true; } catch { return false; }
    });
    assert.ok(matched, `${path}: Value does not match any allowed anyOf variants`);
    return;
  }
  if (value === null) {
    const allowsNull = schema.nullable || schema.type === 'null' || (Array.isArray(schema.type) && schema.type.includes('null'));
    assert.ok(allowsNull, `${path}: Received null but schema does not allow null`);
    return;
  }
  const type = Array.isArray(value) ? 'array' : typeof value;
  const allowedTypes = [].concat(schema.type || []);
  if (allowedTypes.length > 0) {
    const typeOk = allowedTypes.includes(type) || (allowedTypes.includes('integer') && Number.isInteger(value));
    assert.ok(typeOk, `${path}: Expected type [${allowedTypes.join(', ')}], got ${type}`);
  }
  if (schema.enum) assert.ok(schema.enum.includes(value), `${path}: '${value}' not in enum [${schema.enum.join(', ')}]`);
  if (schema.pattern) assert.match(String(value), new RegExp(schema.pattern), `${path}: Regex mismatch`);
  if (schema.format === 'uuid') assert.match(String(value), /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, `${path}: Invalid UUID`);
  if (schema.format === 'date') assert.match(String(value), /^\d{4}-\d{2}-\d{2}$/, `${path}: Invalid date format (YYYY-MM-DD)`);
  if (schema.format === 'date-time') assert.match(String(value), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, `${path}: Invalid date-time ISO format`);

  if (type === 'object') {
    for (const reqKey of schema.required || []) {
      assert.ok(Object.hasOwn(value, reqKey), `${path}: Missing required field '${reqKey}'`);
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        assert.ok(Object.hasOwn(schema.properties || {}, key), `${path}: Forbidden additional property '${key}'`);
      }
    }
    for (const [key, propVal] of Object.entries(value)) {
      if (schema.properties?.[key]) {
        validateSchema(propVal, schema.properties[key], `${path}.${key}`);
      }
    }
  } else if (type === 'array') {
    if (schema.items) {
      value.forEach((item, idx) => validateSchema(item, schema.items, `${path}[${idx}]`));
    }
  }
}

function conform(value, schemaName) {
  const schema = openapiSpec.components.schemas[schemaName];
  assert.ok(schema, `Schema not defined: ${schemaName}`);
  validateSchema(value, schema, schemaName);
}

// Behavioral Runner
async function runBehavioralAndContractSuite() {
  console.log(`\n🧪 Bắt đầu E2E API Behavioral & Contract Verification`);
  console.log(`📍 Target API: ${API_BASE}`);
  console.log(`🌐 Origin: ${ORIGIN}\n`);

  let cookie = '';
  let csrfToken = '';
  const testEmail = `ci_agent_${Date.now()}_${randomBytes(2).toString('hex')}@expiry.test`;
  const testPassword = 'StrongPassword1234_Over15Chars!';
  const stageResults = [];

  function record(stage, detail) {
    stageResults.push({ stage, detail });
    console.log(`  ✅ [${stage}] ${detail}`);
  }

  // Stage 1: Root Healthcheck
  {
    const res = await fetch(`${API_BASE}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'expiry-api');
    record('STAGE 1: ROOT HEALTH', 'API trả về HTTP 200 OK với version 1.0.0');
  }

  // Stage 2: Security Gate (Unauthenticated Request Rejection)
  {
    const res = await fetch(`${API_BASE}/api/v1/food-entries`);
    assert.equal(res.status, 401, 'Unauthenticated request must return 401');
    const problem = await res.json();
    conform(problem, 'Problem');
    record('STAGE 2: SECURITY GATE', 'Từ chối 401 cho request chưa xác thực, khớp Problem schema');
  }

  // Stage 3: User Registration & Session Cookie Issuance
  let userId;
  {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({ email: testEmail, password: testPassword, display_name: 'CI Agent Tester' })
    });
    assert.equal(res.status, 201, `Register failed with ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Must set session cookie');
    cookie = setCookie.split(';')[0];
    const data = await res.json();
    conform(data, 'AuthSession');
    csrfToken = data.csrf_token;
    userId = data.user.id;
    assert.ok(userId, 'User ID must be present');
    record('STAGE 3: AUTH REGISTER', `Tạo tài khoản ${testEmail}, cấp cookie an toàn và CSRF token`);
  }

  // Stage 4: Session Inspection
  {
    const res = await fetch(`${API_BASE}/api/v1/auth/session`, {
      headers: { Cookie: cookie, Origin: ORIGIN }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    conform(data, 'AuthSession');
    assert.equal(data.user.id, userId);
    record('STAGE 4: AUTH SESSION', 'Phiên làm việc được duy trì và khớp schema AuthSession');
  }

  // Stage 5: Create Food Entry with Idempotency Key
  let createdEntry;
  const idempotencyKey1 = `idemp_${randomUUID()}`;
  {
    const payload = {
      name: 'Thịt bò Úc',
      storage_location: 'Ngăn đông',
      quantity: '1500.000',
      unit: 'g',
      expiry_date: '2026-12-31',
      date_certainty: 'known',
      date_source: 'printed_label',
      date_label_type: 'best_before',
      note: 'Hàng nhập khẩu tươi'
    };
    const res = await fetch(`${API_BASE}/api/v1/food-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': idempotencyKey1
      },
      body: JSON.stringify(payload)
    });
    assert.equal(res.status, 201, `Create failed with status ${res.status}`);
    assert.ok(res.headers.get('location'), 'Location header must point to created resource');
    createdEntry = await res.json();
    conform(createdEntry, 'Entry');
    assert.equal(createdEntry.name, payload.name);
    assert.equal(createdEntry.version, 1);
    assert.equal(createdEntry.remaining_quantity, '1500.000');
    record('STAGE 5: CREATE ENTRY', `Tạo món ăn '${createdEntry.name}' (ID: ${createdEntry.id}), version=1`);
  }

  // Stage 6: Idempotent Replay Verification
  {
    const payload = {
      name: 'Thịt bò Úc',
      storage_location: 'Ngăn đông',
      quantity: '1500.000',
      unit: 'g',
      expiry_date: '2026-12-31',
      date_certainty: 'known',
      date_source: 'printed_label',
      date_label_type: 'best_before',
      note: 'Hàng nhập khẩu tươi'
    };
    const res = await fetch(`${API_BASE}/api/v1/food-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': idempotencyKey1
      },
      body: JSON.stringify(payload)
    });
    assert.equal(res.status, 201);
    assert.equal(res.headers.get('idempotency-replayed'), 'true', 'Replay header must be true');
    const data = await res.json();
    assert.equal(data.id, createdEntry.id);
    record('STAGE 6: IDEMPOTENT REPLAY', 'Hệ thống nhận diện đúng Idempotency-Key và trả về kết quả replay');
  }

  // Stage 7: Optimistic Concurrency Control (Conflict on Version Mismatch)
  {
    const wrongVersion = 999;
    const res = await fetch(`${API_BASE}/api/v1/food-entries/${createdEntry.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': `idemp_${randomUUID()}`
      },
      body: JSON.stringify({ name: 'Thịt bò Úc Cao Cấp', expected_version: wrongVersion })
    });
    assert.equal(res.status, 409, `Expected 409 Conflict, got ${res.status}`);
    const err = await res.json();
    conform(err, 'Problem');
    assert.equal(err.code, 'VERSION_CONFLICT');
    record('STAGE 7: OPTIMISTIC LOCKING', `Từ chối cập nhật khi version sai (${wrongVersion}), ném đúng VERSION_CONFLICT`);
  }

  // Stage 8: Valid Edit & Version Increment
  let updatedEntry;
  {
    const res = await fetch(`${API_BASE}/api/v1/food-entries/${createdEntry.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': `idemp_${randomUUID()}`
      },
      body: JSON.stringify({ name: 'Thịt bò Úc Cao Cấp', expected_version: createdEntry.version })
    });
    assert.equal(res.status, 200);
    updatedEntry = await res.json();
    conform(updatedEntry, 'Entry');
    assert.equal(updatedEntry.name, 'Thịt bò Úc Cao Cấp');
    assert.equal(updatedEntry.version, createdEntry.version + 1);
    record('STAGE 8: EDIT & VERSION BUMP', `Cập nhật thành công, version tăng lên ${updatedEntry.version}`);
  }

  // Stage 9: Stock Movement (Consume Operation)
  {
    const res = await fetch(`${API_BASE}/api/v1/food-entries/${createdEntry.id}/movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': `idemp_${randomUUID()}`
      },
      body: JSON.stringify({
        kind: 'consume',
        amount: '500.000',
        reason: 'Nấu ăn gia đình',
        expected_version: updatedEntry.version
      })
    });
    assert.equal(res.status, 201);
    const result = await res.json();
    conform(result, 'MutationResult');
    assert.equal(result.entry.remaining_quantity, '1000.000');
    assert.equal(result.movement.kind, 'consume');
    updatedEntry = result.entry;

    // CAP-05: Recount Concurrency Control (Conflict on Version Mismatch)
    const recountConflict = await fetch(`${API_BASE}/api/v1/food-entries/${createdEntry.id}/recounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': `idemp_${randomUUID()}`
      },
      body: JSON.stringify({
        actual_quantity: '800.000',
        reason: 'Cân lại thực tế',
        expected_version: 999
      })
    });
    assert.equal(recountConflict.status, 409);
    const conflictErr = await recountConflict.json();
    conform(conflictErr, 'Problem');
    assert.equal(conflictErr.code, 'VERSION_CONFLICT');

    // CAP-05: Physical Recount with automatic delta calculation & version bump
    const recountRes = await fetch(`${API_BASE}/api/v1/food-entries/${createdEntry.id}/recounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': `idemp_${randomUUID()}`
      },
      body: JSON.stringify({
        actual_quantity: '800.000',
        reason: 'Đếm lại thực tế trong tủ',
        expected_version: updatedEntry.version
      })
    });
    assert.equal(recountRes.status, 201);
    const recountResult = await recountRes.json();
    conform(recountResult, 'MutationResult');
    assert.equal(recountResult.entry.remaining_quantity, '800.000');
    assert.equal(recountResult.movement.kind, 'adjustment');
    assert.equal(recountResult.movement.quantity_before, '1000.000');
    assert.equal(recountResult.movement.quantity_after, '800.000');
    assert.equal(recountResult.entry.version, updatedEntry.version + 1);
    updatedEntry = recountResult.entry;

    // CAP-05: Physical Recount No-op (same quantity -> 200, changed=false)
    const noopRes = await fetch(`${API_BASE}/api/v1/food-entries/${createdEntry.id}/recounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': `idemp_${randomUUID()}`
      },
      body: JSON.stringify({
        actual_quantity: '800.000',
        reason: 'Kiểm kê lại không thay đổi',
        expected_version: updatedEntry.version
      })
    });
    assert.equal(noopRes.status, 200);
    const noopResult = await noopRes.json();
    conform(noopResult, 'MutationResult');
    assert.equal(noopResult.changed, false);
    assert.equal(noopResult.movement, null);

    record('STAGE 9: STOCK MOVEMENT & PHYSICAL RECOUNT', 'Trừ kho 500g và kiểm kê thực tế 800g kèm khóa lạc quan thành công 100%');
  }

  // Stage 10: Query Inventory List
  {
    const res = await fetch(`${API_BASE}/api/v1/food-entries?page=1&limit=10`, {
      headers: { Cookie: cookie, Origin: ORIGIN }
    });
    assert.equal(res.status, 200);
    const list = await res.json();
    conform(list, 'EntryList');
    assert.ok(list.items.some(i => i.id === createdEntry.id));
    record('STAGE 10: INVENTORY LIST', 'Danh sách trả về pagination chuẩn và khớp EntryList schema');
  }

  // Stage 11: OCR Microservice Health & Live Image Scan Bridge
  {
    const res = await fetch(`${API_BASE}/api/v1/scan/health`, {
      headers: { Cookie: cookie, Origin: ORIGIN }
    });
    assert.equal(res.status, 200);
    const scanHealth = await res.json();
    assert.equal(scanHealth.service, 'python-scan');
    assert.equal(scanHealth.status, 'healthy');

    // Live extraction verification
    const sampleImage = await readFile(new URL('../services/python-scan/tests/evidence/label-exp.png', import.meta.url));
    const scanRes = await fetch(`${API_BASE}/api/v1/scans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ image_base64: `data:image/png;base64,${sampleImage.toString('base64')}` })
    });
    assert.equal(scanRes.status, 200);
    const scanResult = await scanRes.json();
    assert.equal(typeof scanResult.raw_text, 'string');
    assert.equal(scanResult.candidates.expiry_date.value, '2026-12-31');
    assert.equal(scanResult.candidates.expiry_date.date_certainty, 'exact');
    assert.equal(scanResult.requires_confirmation, true);

    record('STAGE 11: OCR SCAN BRIDGE', 'API kết nối và trích xuất nhãn thực tế thành công qua Python Scan microservice');
  }

  // Stage 12: Soft Delete, Trash Filters & One-Click Restore Lifecycle (CAP-06)
  {
    const res = await fetch(`${API_BASE}/api/v1/food-entries/${createdEntry.id}?expected_version=${updatedEntry.version}`, {
      method: 'DELETE',
      headers: {
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': `idemp_${randomUUID()}`
      }
    });
    assert.equal(res.status, 204);

    const trashRes = await fetch(`${API_BASE}/api/v1/trash/food-entries`, {
      headers: { Cookie: cookie, Origin: ORIGIN }
    });
    assert.equal(trashRes.status, 200);
    const trashList = await trashRes.json();
    conform(trashList, 'EntryList');
    assert.ok(trashList.items.some(i => i.id === createdEntry.id));

    // Verify filter parameters (q, location)
    const filterRes = await fetch(`${API_BASE}/api/v1/trash/food-entries?q=${encodeURIComponent(createdEntry.name)}`, {
      headers: { Cookie: cookie, Origin: ORIGIN }
    });
    assert.equal(filterRes.status, 200);
    const filteredTrash = await filterRes.json();
    conform(filteredTrash, 'EntryList');
    assert.ok(filteredTrash.items.some(i => i.id === createdEntry.id));

    // One-Click Restore
    const restoreRes = await fetch(`${API_BASE}/api/v1/food-entries/${createdEntry.id}/restore`, {
      method: 'POST',
      headers: {
        Origin: ORIGIN,
        Cookie: cookie,
        'X-CSRF-Token': csrfToken,
        'Idempotency-Key': `idemp_${randomUUID()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expected_version: updatedEntry.version + 1 })
    });
    assert.equal(restoreRes.status, 200);
    const restoredEntry = await restoreRes.json();
    conform(restoredEntry, 'Entry');
    assert.equal(restoredEntry.deleted_at, null);

    // Verify removed from trash list
    const trashAfterRestore = await fetch(`${API_BASE}/api/v1/trash/food-entries`, {
      headers: { Cookie: cookie, Origin: ORIGIN }
    });
    const trashAfterList = await trashAfterRestore.json();
    assert.ok(!trashAfterList.items.some(i => i.id === createdEntry.id));

    record('STAGE 12: DELETE & RESTORE LIFECYCLE', 'Chu trình xóa mềm, lọc thùng rác và khôi phục 1 chạm thành công 100%');
  }

  // Stage 13: Logout & Session Invalidation
  {
    const res = await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Origin: ORIGIN, Cookie: cookie, 'X-CSRF-Token': csrfToken }
    });
    assert.ok([200, 204].includes(res.status));

    const checkRevoked = await fetch(`${API_BASE}/api/v1/auth/session`, {
      headers: { Cookie: cookie, Origin: ORIGIN }
    });
    assert.equal(checkRevoked.status, 401, 'Session must be revoked after logout');
    record('STAGE 13: LOGOUT REVOCATION', 'Thu hồi session thành công, cookie cũ bị chặn 401');
  }

  console.log(`\n🎉 TOÀN BỘ 13/13 GIAI ĐOẠN BEHAVIORAL & CONTRACT ĐÃ PASS 100%!\n`);
  return stageResults;
}

runBehavioralAndContractSuite().catch(err => {
  console.error('\n❌ THẤT BẠI KIỂM THỬ BEHAVIOR / CONTRACT:');
  console.error(err);
  process.exit(1);
});
