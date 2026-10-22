import assert from 'node:assert/strict';
import test from 'node:test';
import { registerShutdownHandlers } from '../src/shared/server-shutdown.mjs';

function createHarness({ closePools = async () => {}, delayClose = false } = {}) {
  const handlers = new Map();
  const events = [];
  let closeCallback;
  let resolveExit;
  const exited = new Promise(resolve => {
    resolveExit = resolve;
  });
  const processRef = {
    on: (event, handler) => handlers.set(event, handler),
    exit: code => {
      events.push(['exit', code]);
      resolveExit(code);
    }
  };
  const server = {
    close: callback => {
      events.push('close');
      closeCallback = callback;
      if (!delayClose) setImmediate(() => closeCallback());
    },
    closeIdleConnections: () => events.push('close-idle')
  };
  registerShutdownHandlers(server, closePools, processRef, 50);

  return { events, exited, handlers, server, completeClose: () => closeCallback() };
}

test('closes idle connections, drains requests, and exits once on SIGTERM', async () => {
  let poolCloseCount = 0;
  const harness = createHarness({
    closePools: async () => {
      poolCloseCount += 1;
    }
  });

  harness.handlers.get('SIGTERM')();
  harness.handlers.get('SIGINT')();

  assert.equal(await harness.exited, 0);
  assert.deepEqual(harness.events, ['close', 'close-idle', ['exit', 0]]);
  assert.equal(poolCloseCount, 1);
});

test('forces a nonzero exit when shutdown exceeds the timeout', async () => {
  const harness = createHarness({ delayClose: true });

  harness.handlers.get('SIGTERM')();

  assert.equal(await harness.exited, 1);
  harness.completeClose();
});

test('logs and exits nonzero after an unhandled rejection', async () => {
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args);
  try {
    const harness = createHarness();
    const reason = new Error('unexpected rejection');
    harness.handlers.get('unhandledRejection')(reason);

    assert.equal(await harness.exited, 1);
    assert.deepEqual(errors[0], ['[Expiry API] Unhandled promise rejection:', reason]);
  } finally {
    console.error = originalError;
  }
});

test('logs and exits nonzero after an uncaught exception', async () => {
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args);
  try {
    const harness = createHarness();
    const error = new Error('unexpected exception');
    harness.handlers.get('uncaughtException')(error);

    assert.equal(await harness.exited, 1);
    assert.deepEqual(errors[0], ['[Expiry API] Uncaught exception:', error]);
  } finally {
    console.error = originalError;
  }
});
