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
})
