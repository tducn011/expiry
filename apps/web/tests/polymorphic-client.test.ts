import { describe, expect, it } from "vitest"
import { MockApiClient } from "../src/api/mockClient"
import type { ExpiryApiClient } from "../src/api/client"

describe("PONY-04: Polymorphic ExpiryApiClient & MockApiClient", () => {
  it("MockApiClient implements ExpiryApiClient interface", async () => {
    const client: ExpiryApiClient = new MockApiClient()

    // 1. Session returns demo user with preferences
    const session = await client.session()
    expect(session.user.id).toBe("usr_demo")
    expect(session.user.timezone).toBeDefined()
    expect(session.csrf_token).toBe("mock-csrf-token")

    // 2. Entries lists mock entries with attention and pagination
    const page = await client.entries()
    expect(page.items.length).toBeGreaterThan(0)
    expect(page.items[0].attention).toBeDefined()
    expect(page.as_of_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    // 3. Create entry persists and returns decorated FoodEntry
    const created = await client.createEntry({
      name: "Trứng gà tươi",
      quantity: "10",
      unit: "piece",
      storage_location: "fridge",
      expiry_date: "2026-10-30",
      date_certainty: "known",
      date_source: "printed_label",
      date_label_type: "best_before",
      opened_on: null,
      note: "Hộp 10 quả",
    })
    expect(created.id).toMatch(/^ent_/)
    expect(created.name).toBe("Trứng gà tươi")
    expect(created.remaining_quantity).toBe(10)
    expect(created.attention).toBeDefined()

    // 4. Record movement updates remaining quantity and records history
    const movResult = await client.recordMovement(created.id, {
      expected_version: created.version,
      kind: "consume",
      amount: "3",
      reason: "Nấu ăn sáng",
    })
    expect(movResult.changed).toBe(true)
    expect(movResult.entry.remaining_quantity).toBe(7)
    expect(movResult.movement?.kind).toBe("consume")

    // 5. Recount adjusts remaining quantity
    const recountResult = await client.recount(created.id, {
      expected_version: movResult.entry.version,
      actual_quantity: "8",
      reason: "Kiểm đếm lại",
    })
    expect(recountResult.entry.remaining_quantity).toBe(8)

    // 6. Update entry modifies draft fields
    const updated = await client.updateEntry(created.id, {
      expected_version: recountResult.entry.version,
      note: "Cập nhật ghi chú",
    })
    expect(updated.note).toBe("Cập nhật ghi chú")

    // 7. Delete moves item to trash
    await client.deleteEntry(created.id, updated.version)
    const trash = await client.allEntries(true)
    expect(trash.items.some((i) => i.id === created.id)).toBe(true)

    // 8. Restore recovers item from trash
    const restored = await client.restoreEntry(created.id, updated.version + 1)
    expect(restored.deleted_at).toBeNull()

    // 9. Preferences update
    const currentPrefs = await client.preferences()
    const updatedPrefs = await client.updatePreferences({
      expected_version: currentPrefs.version,
      timezone: "Asia/Ho_Chi_Minh",
      attention_lead_days: 3,
    })
    expect(updatedPrefs.attention_lead_days).toBe(3)
  })
})
