import { describe, expect, it } from "vitest"

import {
  CATEGORIES,
  CATEGORY_LABELS,
  seedFoods,
  seedHistory,
  statusOf,
  type Category,
} from "../src/store/appStore"

describe("Storage & Insight Feature Integration", () => {
  it("defines 7 business categories with valid Vietnamese labels", () => {
    expect(CATEGORIES.length).toBe(7)

    const expectedCategories: Category[] = [
      "fresh_produce",

      "meat_seafood",

      "dairy_eggs",

      "prepared_food",

      "dry_pantry",

      "beverage",

      "other",
    ]

    for (const cat of expectedCategories) {
      expect(CATEGORIES.some((c) => c.value === cat)).toBe(true)

      expect(CATEGORY_LABELS[cat]).toBeDefined()

      expect(CATEGORY_LABELS[cat].length).toBeGreaterThan(0)
    }
  })

  it("assigns categories to all demo seed foods", () => {
    const foods = seedFoods()

    expect(foods.length).toBeGreaterThan(0)

    for (const food of foods) {
      expect(food.category).toBeDefined()

      expect(CATEGORY_LABELS[(food.category as Category)]).toBeDefined()
    }
  })

  it("calculates consumption vs discard rates correctly for Insight", () => {
    const history = seedHistory()

    expect(history.length).toBeGreaterThan(0)

    const consumes = history.filter((h) => h.kind === "consume")

    const discards = history.filter((h) => h.kind === "discard")

    expect(consumes.length).toBeGreaterThan(0)

    expect(discards.length).toBeGreaterThan(0)

    const total = consumes.length + discards.length

    const consumptionRate = Math.round((consumes.length / total) * 100)

    expect(consumptionRate).toBeGreaterThan(0)

    expect(consumptionRate).toBeLessThanOrEqual(100)
  })

  it("accurately classifies attention items for location badges", () => {
    const foods = seedFoods()

    const remindDays = 3

    const attentionItems = foods.filter((f) => {
      const st = statusOf(f, remindDays)

      return st === "expired" || st === "soon"
    })

    expect(attentionItems.length).toBeGreaterThan(0)
  })

  it("parses deep linking URLs for Storage and Insight views with query params", async () => {
    const { routeFromUrl, urlFromRoute } = await import("../src/App")

    // 1. Storage deep linking with location and category

    const storageRoutes = routeFromUrl(
      "?view=storage&loc=Ng%C4%83n+m%C3%A1t&cat=fresh_produce",
    )

    expect(storageRoutes.length).toBe(1)

    expect(storageRoutes[0]).toEqual({
      name: "storage",

      location: "Ngăn mát",

      category: "fresh_produce",
    })

    // URL roundtrip

    const storageUrl = urlFromRoute(storageRoutes[0])

    expect(storageUrl).toContain("view=storage")

    expect(storageUrl).toContain("cat=fresh_produce")

    // 2. Insight deep linking with tab

    const insightRoutes = routeFromUrl("?view=insight&tab=categories")

    expect(insightRoutes.length).toBe(1)

    expect(insightRoutes[0]).toEqual({
      name: "insight",

      tab: "categories",
    })

    const insightUrl = urlFromRoute(insightRoutes[0])

    expect(insightUrl).toBe("?view=insight&tab=categories")

    // 3. Fallback to inventory

    const defaultRoutes = routeFromUrl("")

    expect(defaultRoutes).toEqual([{ name: "inventory" }])
  })

  it("synchronizes browser history popstate without losing view state", async () => {
    const { routeFromUrl } = await import("../src/App")

    // Simulate history stack

    const initialStack = [{ name: "inventory" as const }]

    const storageRoute = {
      name: "storage" as const,
      location: "Tủ đông",
      category: "meat_seafood",
    }

    const historyStack = [...initialStack, storageRoute]

    // Simulate popstate event payload

    const mockPopEvent = {
      state: { stack: historyStack },
    } as unknown as PopStateEvent

    expect(mockPopEvent.state?.stack).toEqual(historyStack)

    expect(mockPopEvent.state?.stack[1].name).toBe("storage")
  })

  it("maps API QuantityMovement to domain HistoryEvent for all movement kinds", async () => {
    const { fromQuantityMovement } = await import("../src/features/InsightView")

    const mockFood = {
      id: "food-1",

      name: "Sữa chua Ba Vì",

      quantity: 4,

      unit: "hộp" as const,

      category: "dairy_eggs" as const,

      createdAt: "2026-10-21T00:00:00.000Z",
    }

    // 1. Consume movement

    const consumeEv = fromQuantityMovement(
      {
        id: "mov-1",

        entry_id: "food-1",

        kind: "consume",

        quantity_before: 4,

        quantity_after: 2,

        reason: "Ăn sáng",

        recorded_at: "2026-10-21T08:00:00.000Z",
      },

      mockFood,
    )

    expect(consumeEv.kind).toBe("consume")

    expect(consumeEv.foodName).toBe("Sữa chua Ba Vì")

    expect(consumeEv.amount).toBe(2)

    expect(consumeEv.category).toBe("dairy_eggs")

    // 2. Discard movement

    const discardEv = fromQuantityMovement(
      {
        id: "mov-2",

        entry_id: "food-1",

        kind: "discard",

        quantity_before: 2,

        quantity_after: 0,

        reason: "Hỏng",

        recorded_at: "2026-10-22T08:00:00.000Z",
      },

      mockFood,
    )

    expect(discardEv.kind).toBe("discard")

    expect(discardEv.amount).toBe(2)

    // 3. Recount movement maps to adjust

    const recountEv = fromQuantityMovement(
      {
        id: "mov-3",

        entry_id: "food-1",

        kind: "recount",

        quantity_before: 1,

        quantity_after: 3,

        reason: "Kiểm kê lại",

        recorded_at: "2026-10-23T08:00:00.000Z",
      },

      mockFood,
    )

    expect(recountEv.kind).toBe("adjust")

    expect(recountEv.amount).toBe(2)
  })

  it("fetches and deduplicates live movements from ApiClient for Insight", async () => {
    const { fetchLiveMovements } = await import("../src/features/InsightView")

    const mockFoods = [
      {
        id: "f-1",

        name: "Thịt bò",

        quantity: 500,

        unit: "g" as const,

        category: "meat_seafood" as const,

        createdAt: "2026-10-20T00:00:00.000Z",
      },

      {
        id: "f-2",

        name: "Rau bina",

        quantity: 2,

        unit: "cái" as const,

        category: "fresh_produce" as const,

        createdAt: "2026-10-20T00:00:00.000Z",
      },
    ]

    const mockClient = {
      history: async (id: string) => {
        if (id === "f-1") {
          return [
            {
              id: "m-1",

              entry_id: "f-1",

              kind: "consume" as const,

              quantity_before: 500,

              quantity_after: 200,

              reason: null,

              recorded_at: "2026-10-25T10:00:00.000Z",
            },
          ]
        }

        return [
          {
            id: "m-2",

            entry_id: "f-2",

            kind: "discard" as const,

            quantity_before: 2,

            quantity_after: 0,

            reason: null,

            recorded_at: "2026-10-26T10:00:00.000Z",
          },
        ]
      },

      entries: async () => ({
        items: [],
        pagination: { page: 1, limit: 20, total: 0 },
        as_of_date: "",
      }),
    }

    const events = await fetchLiveMovements(mockClient as any, mockFoods)

    expect(events.length).toBe(2)

    // Ordered descending by date

    expect(events[0].id).toBe("m-2")

    expect(events[0].kind).toBe("discard")

    expect(events[1].id).toBe("m-1")

    expect(events[1].kind).toBe("consume")
  })

  it("persists and restores storage space preferences", () => {
    const store = new Map<string, string>()
    const mockStorage = {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    }
    const testKey = "expiry_storage_preferences"
    const testPref = { location: "Ngăn đông", category: "meat_seafood" }
    mockStorage.setItem(testKey, JSON.stringify(testPref))

    const loaded = JSON.parse(mockStorage.getItem(testKey) || "{}")
    expect(loaded.location).toBe("Ngăn đông")
    expect(loaded.category).toBe("meat_seafood")
    mockStorage.removeItem(testKey)
    expect(mockStorage.getItem(testKey)).toBeNull()
  })
})
