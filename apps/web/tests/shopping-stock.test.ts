import { describe, expect, it } from "vitest"
import { compareShoppingStock, hasComparableUnits } from "../src/domain/shoppingStock"
import type { ShoppingItem } from "../src/domain/types"

const item: ShoppingItem = {
  id: "buy-milk",
  name: "  SỮA   TƯƠI  ",
  quantity: null,
  unit: null,
  checked: false,
  category: "dairy_eggs",
  createdAt: "2026-11-18T00:00:00Z",
}

describe("Shopping stock comparison", () => {
  it("keeps distinct packages and excludes zero quantity and inactive entries", () => {
    const pack = { id: "fresh-1", name: "Sữa tươi", quantity: 2, unit: "hộp" }
    expect(compareShoppingStock(item, [
      pack,
      { ...pack, id: "fresh-2", quantity: 200, unit: "ml" },
      { ...pack, id: "empty", quantity: 0 },
      { ...pack, id: "trash", inactive: true },
    ]).map(({ food, reason }) => [food.id, food.quantity, food.unit, reason])).toEqual([
      ["fresh-1", 2, "hộp", "Tên trùng"],
      ["fresh-2", 200, "ml", "Tên trùng"],
    ])
  })

  it("uses conservative whole-term suggestions within the category", () => {
    const base = { id: "more", name: "Sữa tươi ít đường", quantity: 1, unit: "hộp" }
    expect(compareShoppingStock(item, [
      { ...base, category: "dairy_eggs" },
      { ...base, id: "other-category", category: "beverage" },
      { ...base, id: "partial", name: "Sữa tươiabc", category: "dairy_eggs" },
    ]).map(({ food }) => food.id)).toEqual(["more"])
  })

  it("discloses incompatible or unknown units without adding quantities", () => {
    expect(hasComparableUnits("kg", "g")).toBe(true)
    expect(hasComparableUnits("lít", "ml")).toBe(true)
    expect(hasComparableUnits("hộp", "ml")).toBe(false)
    expect(hasComparableUnits(null, "hộp")).toBe(false)
  })
})
