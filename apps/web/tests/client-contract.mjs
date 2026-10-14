import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import ts from "../node_modules/typescript/lib/typescript.js"

const source = await readFile(
  new URL("../src/api/client.ts", import.meta.url),
  "utf8",
)
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const { ApiClient, ApiError, newCommand } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
)

const waitForAbort = (signal) =>
  new Promise((_resolve, reject) => {
    signal.addEventListener(
      "abort",
      () => reject(new DOMException("Aborted", "AbortError")),
      { once: true },
    )
  })

const command = newCommand(
  "owner-1",
  "POST",
  "/food-entries/entry-1/movements",
  {
    expected_version: 4,
    kind: "consume",
    amount: "100",
    reason: null,
  },
)
const deliveries = []
let committed = 0
const replayClient = new ApiClient(
  function (url, init) {
    assert.equal(this, globalThis)
    deliveries.push({
      url,
      key: init.headers.get("Idempotency-Key"),
      body: init.body,
    })
    if (deliveries.length === 1) {
      committed += 1
      return waitForAbort(init.signal)
    }
    return Promise.resolve(
      new Response(JSON.stringify({ replayed: true }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    )
  },
  "/api/v1",
  20,
)

const replay = await replayClient.execute(command)
assert.deepEqual(replay, { replayed: true })
assert.equal(
  committed,
  1,
  "the lost first response must not duplicate the committed mutation",
)
assert.equal(
  deliveries.length,
  2,
  "a timeout retries the same immutable command once",
)
assert.deepEqual(deliveries[0], deliveries[1])
assert(Object.isFrozen(command))

const stalledDeliveries = []
const frozenClient = new ApiClient(
  (_url, init) => {
    stalledDeliveries.push({
      key: init.headers.get("Idempotency-Key"),
      body: init.body,
    })
    return waitForAbort(init.signal)
  },
  "/api/v1",
  20,
)
await assert.rejects(
  frozenClient.execute(command),
  (failure) =>
    failure instanceof ApiError &&
    failure.code === "REQUEST_TIMEOUT" &&
    failure.uncertain,
)
assert.equal(stalledDeliveries.length, 2)
assert.deepEqual(stalledDeliveries[0], stalledDeliveries[1])
assert.equal(
  command.key,
  stalledDeliveries[0].key,
  "a recoverable timeout keeps the original command key for the UI retry",
)

const stalledBodyController = new AbortController()
let bodyReadAborted = false
const stalledBodyClient = new ApiClient(
  (_url, init) => {
    init.signal.addEventListener(
      "abort",
      () => {
        bodyReadAborted = true
      },
      { once: true },
    )
    return Promise.resolve({
      status: 201,
      ok: true,
      json: () => new Promise(() => {}),
    })
  },
  "/api/v1",
  20,
)
await assert.rejects(
  stalledBodyClient.request("/food-entries", {
    method: "POST",
    signal: stalledBodyController.signal,
  }),
  (failure) =>
    failure instanceof ApiError &&
    failure.code === "REQUEST_TIMEOUT" &&
    failure.uncertain,
)
assert(
  bodyReadAborted,
  "the timeout abort signal must reach an in-progress body read",
)

const caller = new AbortController()
let requestSignal
const callerAbortClient = new ApiClient(
  (_url, init) => {
    requestSignal = init.signal
    return waitForAbort(init.signal)
  },
  "/api/v1",
  1000,
)
const callerRequest = callerAbortClient.request("/auth/session", {
  signal: caller.signal,
})
while (!requestSignal) await new Promise((resolve) => setTimeout(resolve, 0))
caller.abort()
await assert.rejects(callerRequest, (failure) => failure?.name === "AbortError")
assert(
  requestSignal.aborted,
  "the caller signal must be combined with the timeout signal",
)

console.log("EXPIRY_CLIENT_DEADLINE_VERIFIED")
