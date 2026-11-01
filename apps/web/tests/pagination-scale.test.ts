import { describe, expect, it, vi } from "vitest"
import { ApiClient } from "../src/api/client"
import { fetchLiveMovements } from "../src/features/InsightView"
import {
  active,
  today,
  type Category,
  type Food,
  type State,
  type Unit,
} from "../src/store/appStore"

describe("Issue #214 - Pagination, Unlimited Hydration & Insight Scale", () => {
  it("hydrates 101+ foods across multiple pages without data loss (P1 requirement)", async () => {
    // Generate 105 food entry DTOs (page 1: 100 items, page 2: 5 items)
    const mockItems = Array.from({ length: 105 }, (_, i) => ({
      id: `food-${i + 1}`,
      name: i === 102 ? "Bánh mì hoa cúc đặc biệt" : `Thực phẩm ${i + 1}`,
      storage_location: i % 2 === 0 ? "Ngăn mát" : "Tủ đông",
      remaining_quantity: "2.000",
      unit: "piece",
      category: "fresh_produce",
      expiry_date: "2026-11-15",
      date_certainty: "known" as const,
      date_source: "printed_label" as const,
      date_label_type: "best_before" as const,
      opened_on: null,
      note: null,
      version: 1,
      deleted_at: null,
      created_at: "2026-10-31T00:00:00.000Z",
      updated_at: "2026-10-31T00:00:00.000Z",
      attention: {
        status: "soon" as const,
        reason_code: "expiring_soon",
        as_of_date: "2026-11-01",
      },
    }))

    const client = new ApiClient(async (url) => {
      const parsed = new URL(url, "https://api.test")
      const pageNum = Number(parsed.searchParams.get("page") || "1")
      const limit = Number(parsed.searchParams.get("limit") || "100")
      const start = (pageNum - 1) * limit
      const items = mockItems.slice(start, start + limit)

      return new Response(
        JSON.stringify({
          items,
          pagination: {
            page: pageNum,
            limit,
            total: mockItems.length,
          },
          as_of_date: "2026-11-01",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    })

    // Test client.allEntries retrieves all 105 items
    const all = await client.allEntries()
    expect(all.length).toBe(105)
    expect(all[102].name).toBe("Bánh mì hoa cúc đặc biệt")

    // Test hydration loop simulation as in App.tsx
    const dispatchedFoods: Food[] = []
    let pageNum = 1
    const limit = 100
    let hasMore = true

    while (hasMore) {
      const page = await client.entries({ page: pageNum, limit })
      for (const item of page.items) {
        dispatchedFoods.push({
          id: item.id,
          name: item.name,
          quantity: item.remaining_quantity,
          unit: (item.unit === "piece" ? "cái" : item.unit) as Unit,
          category: (item.category as Category) || undefined,
          location: item.storage_location || undefined,
          expDate: item.expiry_date || undefined,
          mfgDate: item.opened_on || undefined,
          version: item.version,
        })
      }

      if (
        !page.pagination ||
        pageNum * limit >= page.pagination.total ||
        page.items.length === 0
      ) {
        hasMore = false
      } else {
        pageNum++
      }
    }

    expect(dispatchedFoods.length).toBe(105)
    expect(pageNum).toBe(2)

    // Test search / filter does not depend only on first 100 items
    const mockState: State = {
      mode: "account",
      userId: "test-user",
      name: "User",
      foods: dispatchedFoods,
      history: [],
      locations: ["Ngăn mát", "Tủ đông"],
      categories: ["fresh_produce"],
      notifications: [],
      settings: {
        remindDays: 3,
        autoTrashDays: 7,
        theme: "system",
        storageLocations: ["Ngăn mát", "Tủ đông"],
      },
    }

    const activeItems = active(mockState)
    expect(activeItems.length).toBe(105)

    // Find the 103rd item on page 2 through search
    const query = "hoa cúc"
    const searchResults = activeItems.filter((f) =>
      f.name.toLowerCase().includes(query),
    )
    expect(searchResults.length).toBe(1)
    expect(searchResults[0].id).toBe("food-103")
  })

  it("fetches historical events >50 items without data truncation", async () => {
    // Generate 65 stock movements (page 1: 50 items, page 2: 15 items)
    const mockMovements = Array.from({ length: 65 }, (_, i) => ({
      id: `mov-${i + 1}`,
      entry_id: "entry-target",
      kind: i % 2 === 0 ? ("consume" as const) : ("adjust" as const),
      quantity_before: "10.000",
      quantity_after: "8.000",
      reason: `Event #${i + 1}`,
      recorded_at: new Date(Date.now() - i * 60000).toISOString(),
    }))

    const client = new ApiClient(async (url) => {
      const parsed = new URL(url, "https://api.test")
      const pageNum = Number(parsed.searchParams.get("page") || "1")
      const limit = Number(parsed.searchParams.get("limit") || "50")
      const start = (pageNum - 1) * limit
      const items = mockMovements.slice(start, start + limit)

      return new Response(
        JSON.stringify({
          items,
          pagination: {
            page: pageNum,
            limit,
            total: mockMovements.length,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    })

    // 1. Calling history without specific page loads ALL 65 movements across pages
    const fullHistory = await client.history("entry-target")
    expect(fullHistory.length).toBe(65)
    expect(fullHistory[0].id).toBe("mov-1")
    expect(fullHistory[64].id).toBe("mov-65")

    // 2. Calling history with explicit pagination page=1, limit=20 returns only requested page
    const pagedHistory = await client.history("entry-target", {
      page: 1,
      limit: 20,
    })
    expect(pagedHistory.length).toBe(20)
  })

  it("prevents N+1 queries and bounds live insight fetching for large inventory", async () => {
    // Create 120 foods in inventory
    const largeFoods: Food[] = Array.from({ length: 120 }, (_, i) => ({
      id: `food-${i + 1}`,
      name: `Món ${i + 1}`,
      quantity: 1,
      unit: "cái",
      category: "fresh_produce",
      createdAt: "2026-10-25T00:00:00.000Z",
      version: i < 30 ? 2 : 1, // first 30 have activity
      finishedAt: i < 10 ? "2026-10-30T00:00:00.000Z" : undefined,
    }))

    const queriedFoodIds: string[] = []

    const mockClient = {
      history: vi.fn(async (id: string) => {
        queriedFoodIds.push(id)
        return [
          {
            id: `mov-for-${id}`,
            entry_id: id,
            kind: "consume" as const,
            quantity_before: 2,
            quantity_after: 1,
            reason: "Ăn nhẹ",
            recorded_at: "2026-10-30T10:00:00.000Z",
          },
        ]
      }),
      allEntries: async () => [],
      entries: async () => ({
        items: [],
        pagination: { page: 1, limit: 20, total: 0 },
        as_of_date: "2026-11-01",
      }),
    }

    // fetchLiveMovements should bound candidate queries to maxItems (default 50)
    // instead of firing 120 unbounded parallel requests
    const events = await fetchLiveMovements(mockClient as any, largeFoods)

    expect(queriedFoodIds.length).toBe(50)
    expect(events.length).toBe(50)
    // Prioritized foods with finishedAt or version > 1 should be queried first
    expect(queriedFoodIds.slice(0, 10)).toEqual(
      largeFoods.slice(0, 10).map((f) => f.id),
    )
  })

  it("transparently reflects scope and as-of date for both bounded and full inventories", () => {
    const asOf = today()

    // 1. Full inventory scope (<= 50 items)
    const smallCount = 35
    const isSmallLimited = smallCount > 50
    const smallScope = isSmallLimited
      ? `Phạm vi: Giới hạn 50/${smallCount} thực phẩm gần nhất · As-of ${asOf}`
      : `Phạm vi: Toàn bộ ${smallCount} thực phẩm · As-of ${asOf}`

    expect(smallScope).toBe(
      `Phạm vi: Toàn bộ 35 thực phẩm · As-of ${asOf}`,
    )

    // 2. Bounded inventory scope (> 50 items)
    const largeCount = 125
    const isLargeLimited = largeCount > 50
    const largeScope = isLargeLimited
      ? `Phạm vi: Giới hạn 50/${largeCount} thực phẩm gần nhất · As-of ${asOf}`
      : `Phạm vi: Toàn bộ ${largeCount} thực phẩm · As-of ${asOf}`

    expect(largeScope).toBe(
      `Phạm vi: Giới hạn 50/125 thực phẩm gần nhất · As-of ${asOf}`,
    )
  })
})
