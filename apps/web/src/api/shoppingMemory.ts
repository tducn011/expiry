import type { ShoppingItem } from "../domain/types"
import { inferCategory } from "../store/appStore"

const DEFAULT_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: "shop_default_1",
    name: "Trứng gà ta",
    quantity: 10,
    unit: "quả",
    category: "dairy_eggs",
    checked: false,
    addedFromInventory: false,
    createdAt: new Date().toISOString(),
    note: "Hộp 10 quả",
  },
  {
    id: "shop_default_2",
    name: "Sữa tươi ít đường",
    quantity: 1,
    unit: "hộp",
    category: "dairy_eggs",
    checked: false,
    addedFromInventory: false,
    createdAt: new Date().toISOString(),
    note: "1 Lít",
  },
  {
    id: "shop_default_3",
    name: "Rau cải xanh",
    quantity: 500,
    unit: "g",
    category: "fresh_produce",
    checked: true,
    addedFromInventory: true,
    createdAt: new Date().toISOString(),
    note: null,
  },
]

// Demo-only state. Signed-in Shopping lists are owned by the API.
let demoList: ShoppingItem[] | undefined

export function getShoppingItems(): ShoppingItem[] {
  if (demoList) return [...demoList]
  demoList = [...DEFAULT_SHOPPING_ITEMS]
  return [...demoList]
}

export function saveShoppingItems(items: ShoppingItem[]): void {
  demoList = [...items]
}

export class ShoppingItemChanged extends Error {}

export function changeShoppingItem(
  expected: ShoppingItem,
  change: (item: ShoppingItem) => ShoppingItem | null,
): ShoppingItem[] {
  const items = getShoppingItems()
  const current = items.find((item) => item.id === expected.id)
  if (!current || JSON.stringify(current) !== JSON.stringify(expected)) {
    throw new ShoppingItemChanged()
  }
  const updated = change(current)
  const next = items.flatMap((item) =>
    item.id === current.id ? (updated ? [updated] : []) : [item],
  )
  saveShoppingItems(next)
  return next
}

export function addShoppingItem(
  item: Omit<ShoppingItem, "id" | "createdAt">,
): ShoppingItem {
  const items = getShoppingItems()
  const category = item.category || inferCategory(item.name)
  const newItem: ShoppingItem = {
    ...item,
    id: `shop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    category,
    createdAt: new Date().toISOString(),
  }
  const next = [newItem, ...items]
  saveShoppingItems(next)
  return newItem
}

export function toggleShoppingItem(id: string): ShoppingItem[] {
  const items = getShoppingItems()
  const next = items.map((item) =>
    item.id === id
      ? {
          ...item,
          checked: !item.checked,
        }
      : item,
  )
  saveShoppingItems(next)
  return next
}

export function updateShoppingItem(
  id: string,
  patch: Partial<ShoppingItem>,
): ShoppingItem[] {
  const items = getShoppingItems()
  const next = items.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  )
  saveShoppingItems(next)
  return next
}

export function deleteShoppingItem(id: string): ShoppingItem[] {
  const items = getShoppingItems()
  const next = items.filter((item) => item.id !== id)
  saveShoppingItems(next)
  return next
}

export function clearCheckedShoppingItems(): ShoppingItem[] {
  const items = getShoppingItems()
  const next = items.filter((item) => !item.checked)
  saveShoppingItems(next)
  return next
}

/**
 * Suggests items that are depleted, expired, or running low in inventory
 * and not yet present in the current shopping list.
 */
export function suggestItemsFromInventory(
  foods: Array<{
    name: string
    quantity?: number
    remaining_quantity?: number
    unit?: string
    category?: string | null
    expDate?: string
    expiry_date?: string | null
    deletedAt?: string | null
    deleted_at?: string | null
    finishedAt?: string | null
  }>,
  currentShoppingItems: ShoppingItem[] = [],
): Omit<ShoppingItem, "id" | "createdAt" | "checked">[] {
  const existingNames = new Set(
    currentShoppingItems.map((i) => i.name.trim().toLowerCase()),
  )
  const candidates: Map<string, Omit<ShoppingItem, "id" | "createdAt" | "checked">> =
    new Map()

  for (const food of foods) {
    if (food.deletedAt || food.deleted_at) continue
    const q = food.quantity ?? food.remaining_quantity ?? 0
    const name = food.name.trim()
    const nameLower = name.toLowerCase()

    // Consider depleted items (q === 0) or items finished
    if (q === 0 || food.finishedAt) {
      if (!existingNames.has(nameLower) && !candidates.has(nameLower)) {
        candidates.set(nameLower, {
          name,
          quantity: 1,
          unit: food.unit || "cái",
          category: food.category || inferCategory(name),
          addedFromInventory: true,
          note: "Đã hết trong kho",
        })
      }
    }
  }

  return Array.from(candidates.values())
}
