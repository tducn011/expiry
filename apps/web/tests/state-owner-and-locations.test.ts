import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  DEFAULT_LOCATIONS,
  clearUserLocations,
  getUserLocationsKey,
  loadUserLocations,
  reducer,
  saveUserLocations,
  type Food,
  type State,
} from "../src/store/appStore"

class MockLocalStorage {
  private store = new Map<string, string>()
  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  clear(): void {
    this.store.clear()
  }
}

if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = (new MockLocalStorage() as unknown as Storage)
}

function makeInitialState(overrides: Partial<State> = {}): State {
  return {
    mode: "account",
    userName: "Test User",
    userId: "user-123",
    onboarded: true,
    foods: [],
    history: [],
    locations: [...DEFAULT_LOCATIONS],
    readNotifs: [],
    snoozed: {},
    settings: { remindDays: 3, inApp: true, push: false },
    ...overrides,
  }
}

describe("Issue #205: Server State Ownership & Atomic Inventory Hydration", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("atomically replaces local foods with server snapshot without producing fake history events", () => {
    const existingFood: Food = {
      id: "local-ghost-1",
      name: "Cũ",
      quantity: 1,
      unit: "hộp",
      category: "other",
      location: "Ngăn mát",
      createdAt: "2026-11-01T00:00:00.000Z",
      version: 1,
    }

    const initialHistory = [
      {
        id: "ev-init-1",
        foodId: "local-ghost-1",
        foodName: "Cũ",
        kind: "adjust" as const,
        at: "2026-11-01T00:00:00.000Z",
        from: 1,
        to: 2,
      },
    ]

    const state = makeInitialState({
      foods: [existingFood],
      history: initialHistory,
    })

    const serverSnapshot: Food[] = [
      {
        id: "server-food-1",
        name: "Sữa tươi Ba Vì",
        quantity: 2,
        unit: "hộp",
        category: "dairy_eggs",
        location: "Ngăn mát",
        createdAt: "2026-11-01T12:00:00.000Z",
        version: 1,
      },
      {
        id: "server-food-2",
        name: "Táo Envy",
        quantity: 5,
        unit: "quả",
        category: "fresh_produce",
        location: "Ngăn mát",
        createdAt: "2026-11-01T12:00:00.000Z",
        version: 2,
      },
    ]

    const nextState = reducer(state, {
      type: "hydrateInventory",
      foods: serverSnapshot,
      locations: ["Ngăn mát"],
    })

    // 1. Local ghost items removed, server snapshot accurately represented
    expect(nextState.foods).toEqual(serverSnapshot)
    expect(
      nextState.foods.find((f) => f.id === "local-ghost-1"),
    ).toBeUndefined()

    // 2. Zero fake history events added during hydration (history length unchanged)
    expect(nextState.history).toHaveLength(1)
    expect(nextState.history[0].id).toBe("ev-init-1")
  })

  it("purges backend-deleted records upon next hydration", () => {
    const foodA: Food = {
      id: "item-a",
      name: "Thịt bò",
      quantity: 500,
      unit: "g",
      category: "meat_seafood",
      location: "Ngăn đông",
      createdAt: "2026-11-01T00:00:00.000Z",
      version: 1,
    }
    const foodB: Food = {
      id: "item-b-deleted-on-server",
      name: "Cá hồi",
      quantity: 300,
      unit: "g",
      category: "meat_seafood",
      location: "Ngăn đông",
      createdAt: "2026-11-01T00:00:00.000Z",
      version: 1,
    }

    const state = makeInitialState({ foods: [foodA, foodB] })

    // Server reports only foodA exists now (foodB was deleted on another client/server)
    const nextState = reducer(state, {
      type: "hydrateInventory",
      foods: [foodA],
    })

    expect(nextState.foods).toHaveLength(1)
    expect(nextState.foods[0].id).toBe("item-a")
    expect(
      nextState.foods.find((f) => f.id === "item-b-deleted-on-server"),
    ).toBeUndefined()
  })

  it("preserves user history across repeated hydrations", () => {
    const state = makeInitialState({
      foods: [],
      history: [
        {
          id: "hist-1",
          foodId: "f-1",
          foodName: "Trứng gà",
          kind: "consume",
          at: "2026-11-01T10:00:00.000Z",
        },
      ],
    })

    const stateAfter1 = reducer(state, {
      type: "hydrateInventory",
      foods: [],
    })
    const stateAfter2 = reducer(stateAfter1, {
      type: "hydrateInventory",
      foods: [],
    })

    expect(stateAfter2.history).toHaveLength(1)
    expect(stateAfter2.history[0].id).toBe("hist-1")
  })
})

describe("Issue #211: Location Management & Multi-account Isolation", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("exposes default locations constant", () => {
    expect(DEFAULT_LOCATIONS).toContain("Ngăn mát")
    expect(DEFAULT_LOCATIONS).toContain("Ngăn đông")
    expect(DEFAULT_LOCATIONS).toContain("Tủ bếp")
  })

  it("hydrates locations from server entries without duplicates", () => {
    const state = makeInitialState({
      locations: ["Ngăn mát", "Ngăn đông", "Tủ bếp"],
    })

    const nextState = reducer(state, {
      type: "hydrateInventory",
      foods: [],
      locations: ["Kệ gia vị", "Ngăn mát", "Hầm rượu"],
    })

    expect(nextState.locations).toContain("Ngăn mát")
    expect(nextState.locations).toContain("Ngăn đông")
    expect(nextState.locations).toContain("Tủ bếp")
    expect(nextState.locations).toContain("Kệ gia vị")
    expect(nextState.locations).toContain("Hầm rượu")
    // Check no duplicate "Ngăn mát"
    expect(nextState.locations.filter((l) => l === "Ngăn mát")).toHaveLength(1)
  })

  it("adds a new unique location and ignores duplicates", () => {
    const state = makeInitialState()
    const state1 = reducer(state, {
      type: "addLocation",
      name: "Tủ rượu",
    })
    expect(state1.locations).toContain("Tủ rượu")

    // Adding same location again does not duplicate
    const state2 = reducer(state1, {
      type: "addLocation",
      name: "Tủ rượu",
    })
    expect(state2.locations.filter((l) => l === "Tủ rượu")).toHaveLength(1)
  })

  it("renames a location and updates all referencing foods", () => {
    const food1: Food = {
      id: "f-1",
      name: "Bia Heineken",
      quantity: 6,
      unit: "hộp",
      category: "beverage",
      location: "Tủ mini",
      createdAt: "2026-11-01T00:00:00.000Z",
      version: 1,
    }
    const food2: Food = {
      id: "f-2",
      name: "Bánh mì",
      quantity: 1,
      unit: "cái",
      category: "dry_pantry",
      location: "Tủ bếp",
      createdAt: "2026-11-01T00:00:00.000Z",
      version: 1,
    }

    const state = makeInitialState({
      locations: ["Ngăn mát", "Ngăn đông", "Tủ bếp", "Tủ mini"],
      foods: [food1, food2],
    })

    const nextState = reducer(state, {
      type: "renameLocation",
      oldName: "Tủ mini",
      newName: "Tủ lạnh quầy bar",
    })

    expect(nextState.locations).toContain("Tủ lạnh quầy bar")
    expect(nextState.locations).not.toContain("Tủ mini")

    const updatedFood1 = nextState.foods.find((f) => f.id === "f-1")
    expect(updatedFood1?.location).toBe("Tủ lạnh quầy bar")

    const updatedFood2 = nextState.foods.find((f) => f.id === "f-2")
    expect(updatedFood2?.location).toBe("Tủ bếp")
  })

  it("removes a location and clears location on referencing foods", () => {
    const food: Food = {
      id: "f-1",
      name: "Nước ngọt",
      quantity: 3,
      unit: "chai",
      category: "beverage",
      location: "Tủ tạm",
      createdAt: "2026-11-01T00:00:00.000Z",
      version: 1,
    }

    const state = makeInitialState({
      locations: ["Ngăn mát", "Tủ tạm"],
      foods: [food],
    })

    const nextState = reducer(state, {
      type: "removeLocation",
      name: "Tủ tạm",
    })

    expect(nextState.locations).not.toContain("Tủ tạm")
    expect(nextState.locations).toContain("Ngăn mát")

    const updatedFood = nextState.foods.find((f) => f.id === "f-1")
    expect(updatedFood?.location).toBeUndefined()
  })

  it("isolates saved locations per user account and prevents cross-user leakage", () => {
    const userA = "user-alice-111"
    const userB = "user-bob-222"

    const locationsA = ["Ngăn mát", "Ngăn đông", "Tủ bếp", "Kệ sách Alice"]
    const locationsB = ["Ngăn mát", "Ngăn đông", "Tủ bếp", "Tủ đồ chơi Bob"]

    saveUserLocations(userA, locationsA)
    saveUserLocations(userB, locationsB)

    // Check localStorage keys
    expect(localStorage.getItem(getUserLocationsKey(userA))).toBe(
      JSON.stringify(locationsA),
    )
    expect(localStorage.getItem(getUserLocationsKey(userB))).toBe(
      JSON.stringify(locationsB),
    )

    // Load locations for each user
    expect(loadUserLocations(userA)).toEqual(locationsA)
    expect(loadUserLocations(userB)).toEqual(locationsB)

    // Clear User A's locations on logout
    clearUserLocations(userA)
    expect(localStorage.getItem(getUserLocationsKey(userA))).toBeNull()

    // User B's locations must remain intact
    expect(loadUserLocations(userB)).toEqual(locationsB)

    // Loading for User A after clearing returns default locations
    expect(loadUserLocations(userA)).toEqual([...DEFAULT_LOCATIONS])
  })

  it("clears unscoped legacy preferences upon clearUserLocations", () => {
    localStorage.setItem(
      "expiry_user_preferences",
      JSON.stringify({ custom: true }),
    )
    localStorage.setItem(
      "expiry_storage_preferences",
      JSON.stringify({ sort: "desc" }),
    )

    clearUserLocations("user-test")

    expect(localStorage.getItem("expiry_user_preferences")).toBeNull()
    expect(localStorage.getItem("expiry_storage_preferences")).toBeNull()
  })
})
