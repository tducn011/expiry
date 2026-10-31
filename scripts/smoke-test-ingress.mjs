#!/usr/bin/env node
import assert from 'node:assert/strict';

const baseUrl = process.argv[2] || process.env.SMOKE_TEST_URL || 'https://homeserver.tailc535bb.ts.net';
console.log(`[Smoke Test] Target Ingress: ${baseUrl}`);
console.log(`[Smoke Test] Timestamp: ${new Date().toISOString()}`);

async function runSmokeTests() {
  const results = [];
  let failures = 0;

  // 1. Root /health endpoint
  try {
    const start = Date.now();
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(10000) });
    const duration = Date.now() - start;
    const isJson = (res.headers.get('content-type') || '').includes('json');
    const body = isJson ? await res.json() : await res.text();

    const ok = res.status === 200 && isJson && body.status === 'ok' && body.database === 'connected';
    results.push({
      test: 'GET /health',
      status: res.status,
      duration: `${duration}ms`,
      passed: ok,
      detail: body
    });
    if (!ok) failures++;
  } catch (err) {
    results.push({ test: 'GET /health', status: 'ERR', passed: false, detail: err.message });
    failures++;
  }

  // 2. Scan microservice health endpoint
  try {
    const start = Date.now();
    const res = await fetch(`${baseUrl}/api/v1/scan/health`, { signal: AbortSignal.timeout(10000) });
    const duration = Date.now() - start;
    const isJson = (res.headers.get('content-type') || '').includes('json');
    const body = isJson ? await res.json() : await res.text();

    const ok = res.status === 200 && isJson && body.status === 'healthy' && body.service === 'python-scan';
    results.push({
      test: 'GET /api/v1/scan/health',
      status: res.status,
      duration: `${duration}ms`,
      passed: ok,
      detail: body
    });
    if (!ok) failures++;
  } catch (err) {
    results.push({ test: 'GET /api/v1/scan/health', status: 'ERR', passed: false, detail: err.message });
    failures++;
  }

  // 3. Unauthenticated session endpoint (must return 401 JSON according to public contract)
  try {
    const start = Date.now();
    const res = await fetch(`${baseUrl}/api/v1/auth/session`, { signal: AbortSignal.timeout(10000) });
    const duration = Date.now() - start;
    const isJson = (res.headers.get('content-type') || '').includes('json');
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }

    const ok = res.status === 401 && (isJson || body === '');
    results.push({
      test: 'GET /api/v1/auth/session (unauthenticated)',
      status: res.status,
      duration: `${duration}ms`,
      passed: ok,
      detail: body || '(empty/clean 401)'
    });
    if (!ok) failures++;
  } catch (err) {
    results.push({ test: 'GET /api/v1/auth/session', status: 'ERR', passed: false, detail: err.message });
    failures++;
  }

  // 4. Untrusted Origin rejection (CSRF protection)
  try {
    const start = Date.now();
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': 'https://evil-untrusted-site.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'probe@example.com', password: 'Password123!' }),
      signal: AbortSignal.timeout(10000)
    });
    const duration = Date.now() - start;
    const ok = res.status === 403;
    results.push({
      test: 'POST /api/v1/auth/login from untrusted origin',
      status: res.status,
      duration: `${duration}ms`,
      passed: ok,
      detail: ok ? 'Rejected with 403 as expected' : 'Unexpected status (did not reject untrusted origin)'
    });
    if (!ok) failures++;
  } catch (err) {
    results.push({ test: 'Untrusted origin check', status: 'ERR', passed: false, detail: err.message });
    failures++;
  }

  // 5. Trusted Vercel preview/production alias acceptance
  try {
    const start = Date.now();
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': 'https://uidemo.vercel.app',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'probe@example.com', password: 'Password123!' }),
      signal: AbortSignal.timeout(10000)
    });
    const duration = Date.now() - start;
    // Expected: Passed origin filter -> reaches credential validation (401 or 422, NOT 403)
    const ok = res.status !== 403;
    results.push({
      test: 'POST /api/v1/auth/login from trusted origin (uidemo.vercel.app)',
      status: res.status,
      duration: `${duration}ms`,
      passed: ok,
      detail: ok ? `Accepted through origin boundary (HTTP ${res.status})` : 'Blocked with 403 CSRF_FAILED'
    });
    if (!ok) failures++;
  } catch (err) {
    results.push({ test: 'Trusted origin check', status: 'ERR', passed: false, detail: err.message });
    failures++;
  }

  console.log('\n================== Smoke Test Results ==================');
  for (const r of results) {
    const icon = r.passed ? '✓' : '✗';
    console.log(`${icon} [${r.status}] ${r.test} (${r.duration ?? 'N/A'})`);
    console.log(`   Detail: ${typeof r.detail === 'object' ? JSON.stringify(r.detail) : r.detail}`);
  }
  console.log('========================================================\n');

  if (failures > 0) {
    console.error(`[Smoke Test] ${failures} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('[Smoke Test] All ingress smoke tests passed successfully!');
    process.exit(0);
  }
}

runSmokeTests();
