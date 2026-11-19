import { webcrypto } from "node:crypto"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ApiClient } from "../src/api/client"

describe("Shopping legacy import idempotency", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("reuses a key for the same legacy list and assigns a distinct key to changed contents", async () => {
    vi.stubGlobal("crypto", webcrypto)
    const keys: string[] = []
    const client = new ApiClient(async (_url, init) => {
      keys.push(new Headers(init?.headers).get("Idempotency-Key") ?? "")
      return new Response(JSON.stringify({ imported: true, existing: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    })
    const original = [{ id: "old-a", name: "Sữa", quantity: 1, checked: false }]

    await client.importShoppingItems(original)
    await client.importShoppingItems(original)
    await client.importShoppingItems([
      { id: "old-b", name: "Trứng", quantity: 10, checked: false },
    ])

    expect(keys[0]).toBe(keys[1])
    expect(keys[0]).not.toBe(keys[2])
    expect(keys[0]).toMatch(/^shopping_import_[a-f0-9]{64}$/)
  })
})
