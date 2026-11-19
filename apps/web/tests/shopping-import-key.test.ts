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

  it("reads a single Shopping item through its owner-authenticated API route", async () => {
    const calls: string[] = []
    const item = {
      id: "item-1",
      version: 2,
      name: "Sữa",
      quantity: 1,
      unit: "hộp",
      checked: true,
      createdAt: "2026-11-19T10:00:00.000Z",
    }
    const client = new ApiClient(async (url) => {
      calls.push(String(url))
      return new Response(JSON.stringify(item), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    })

    await expect(client.shoppingItem("item-1")).resolves.toEqual(item)
    expect(calls).toEqual(["/api/v1/shopping-items/item-1"])
  })
})
