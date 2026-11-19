import type { ShoppingItem } from "./types"

export interface StockPackage {
  id: string
  name: string
  quantity: number
  unit: string
  category?: string | null
  location?: string | null
  expiry?: string | null
  inactive?: boolean
  version?: number
}

export function normalizeShoppingName(name: string): string {
  return name
    .normalize("NFKC")
    .toLocaleLowerCase("vi")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ")
    .trim()
}

export function compareShoppingStock(
  item: ShoppingItem,
  foods: StockPackage[],
) {
  const name = normalizeShoppingName(item.name)
  if (!name) return []
  return foods.flatMap((food) => {
    if (food.inactive || !Number.isFinite(food.quantity) || food.quantity <= 0)
      return []
    const recordedName = normalizeShoppingName(food.name)
    if (recordedName === name) return [{ food, reason: "Tên trùng" }]
    if (!recordedName || !item.category || item.category !== food.category)
      return []
    const [shorter, longer] = [name, recordedName].sort(
      (a, b) => a.length - b.length,
    )
    if (!shorter.includes(" ") || !` ${longer} `.includes(` ${shorter} `))
      return []
    return [{ food, reason: "Tên gần giống, cùng danh mục" }]
  })
}

export function hasComparableUnits(
  desired: string | null,
  recorded: string,
): boolean {
  if (!desired) return false
  const unitGroup = (unit: string) =>
    ["g", "kg"].includes(unit)
      ? "mass"
      : ["ml", "lít"].includes(unit)
        ? "volume"
        : unit
  return unitGroup(desired) === unitGroup(recorded)
}
