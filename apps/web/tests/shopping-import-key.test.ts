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

  it("sends the reviewed entry through the atomic Shopping inventory route", async () => {
    type ApiCall = {
      url: string
      key: string | null
      body: unknown
    }
    const calls: ApiCall[] = []
    const result = {
      item: {
        id: "item-1",
        version: 4,
        name: "Sữa",
        quantity: 1,
        unit: "hộp",
        checked: true,
        inventoryAddedAt: "2026-11-19T10:00:00.000Z",
        createdAt: "2026-11-19T09:00:00.000Z",
      },
      entry: {
        id: "food-1",
        name: "Sữa",
        storage_location: "unspecified",
        category: "dairy_eggs",
        remaining_quantity: "1.000",
        unit: "piece",
        expiry_date: null,
        date_certainty: "unknown",
        date_source: "unknown",
        date_label_type: "unspecified",
        opened_on: null,
        manufactured_on: null,
        review_at: null,
        note: null,
        barcode: null,
        barcode_format: null,
        version: 1,
        lifecycle: "active",
        attention: {
          status: "unknown",
          reason_code: "RECORDED_DATE_UNKNOWN",
          as_of_date: "2026-11-19",
        },
        deleted_at: null,
        created_at: "2026-11-19T09:00:00.000Z",
        updated_at: "2026-11-19T09:00:00.000Z",
      },
    }
    const client = new ApiClient(async (url, init) => {
      calls.push({
        url: String(url),
        key: new Headers(init?.headers).get("Idempotency-Key"),
        body: JSON.parse(String(init?.body)),
      })
      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    })

    const imported = await client.importShoppingItemToInventory(
      "item-1",
      {
        expected_version: 3,
        entry: {
          name: "Sữa",
          storage_location: "unspecified",
          category: "dairy_eggs",
          expiry_date: null,
          date_certainty: "unknown",
          date_source: "unknown",
          date_label_type: "unspecified",
          opened_on: null,
          note: null,
          quantity: "1.000",
          unit: "piece",
        },
      },
      "shopping_atomic_import_item-1",
    )

    expect(calls).toEqual([
      {
        url: "/api/v1/shopping-items/item-1/import-to-inventory",
        key: "shopping_atomic_import_item-1",
        body: expect.objectContaining({ expected_version: 3 }),
      },
    ])
    expect(imported.item.inventoryAddedAt).toBe(result.item.inventoryAddedAt)
    expect(imported.entry.id).toBe("food-1")
  })
})
