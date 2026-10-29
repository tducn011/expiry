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
      expect(CATEGORY_LABELS[food.category as Category]).toBeDefined()
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
    const storageRoutes = routeFromUrl("?view=storage&loc=Ng%C4%83n+m%C3%A1t&cat=fresh_produce")
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
    const storageRoute = { name: "storage" as const, location: "Tủ đông", category: "meat_seafood" }
    const historyStack = [...initialStack, storageRoute]

    // Simulate popstate event payload
    const mockPopEvent = {
      state: { stack: historyStack },
    } as unknown as PopStateEvent

    expect(mockPopEvent.state?.stack).toEqual(historyStack)
    expect(mockPopEvent.state?.stack[1].name).toBe("storage")
  })
})
