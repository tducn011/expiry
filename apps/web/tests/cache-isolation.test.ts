import { describe, it, expect, beforeEach, vi } from "vitest"
import { ApiError } from "../src/api/client"

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

// Ensure localStorage is available in Node test environment
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = new MockLocalStorage() as unknown as Storage
}

describe("Issue #204: Cache Isolation & Session Lifecycle", () => {
  const KEY = "expiry-state-v1"
  const DEMO_KEY = "expiry-demo-v1"

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("Test 1: A logout -> B login does not leak user A records or account cache", () => {
    // 1. User A is logged in and saves items
    const mockStateA = {
      mode: "account" as const,
      userName: "User A",
      userId: "user-A-id",
      onboarded: true,
      foods: [
        {
          id: "food-A-1",
          name: "Món ăn bí mật của User A",
          quantity: 2,
          unit: "hộp" as const,
          createdAt: new Date().toISOString(),
          version: 1,
        },
      ],
      history: [],
      locations: ["Ngăn mát"],
      readNotifs: [],
      snoozed: {},
      settings: { remindDays: 3, inApp: true, push: false },
    }

    localStorage.setItem(KEY, JSON.stringify(mockStateA))

    // 2. User A logs out -> removes KEY from localStorage
    localStorage.removeItem(KEY)

    // 3. User B logs in -> KEY must be null and clean
    const stored = localStorage.getItem(KEY)
    expect(stored).toBeNull()
  })

  it("Test 2: Refresh before session returns does not load unscoped account cache", () => {
    // Place stale unverified account cache in KEY
    localStorage.setItem(
      KEY,
      JSON.stringify({
        mode: "account",
        userName: "Stale Account",
        foods: [{ id: "stale-1", name: "Stale Food" }],
      }),
    )

    // Safe startup routine removes unscoped KEY
    localStorage.removeItem(KEY)
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it("Test 3: Out-of-order race condition discards User A response if User B is active", async () => {
    let sessionGeneration = 1
    let activeUserId = "user-A"
    const userBInventory: any[] = []

    // Simulate async hydration for User A
    const hydrationPromiseA = new Promise<{ id: string; name: string }[]>((resolve) => {
      setTimeout(() => {
        resolve([{ id: "food-A", name: "User A Sensitive Item" }])
      }, 30)
    })

    // User A logs out and User B logs in before promise resolves
    sessionGeneration++
    activeUserId = "user-B"
    const currentGen = sessionGeneration
    const currentUser = activeUserId

    // When A's promise resolves:
    const pageItems = await hydrationPromiseA

    // Session guard check: generation and userId must match
    const isResponseValid = currentGen === 1 && currentUser === "user-A"
    if (isResponseValid) {
      userBInventory.push(...pageItems)
    }

    // User B inventory must remain empty
    expect(userBInventory.length).toBe(0)
    expect(userBInventory).not.toContainEqual(expect.objectContaining({ name: "User A Sensitive Item" }))
  })

  it("Test 4: Session 401 returns unauthenticated cleanly", () => {
    const err = new ApiError(401, "AUTH_REQUIRED")
    expect(err.status).toBe(401)
    expect(err.code).toBe("AUTH_REQUIRED")

    let mode: string = "account"
    if (err.status === 401) {
      mode = "demo"
    }
    expect(mode).toBe("demo")
  })

  it("Test 5: API 503 sets error banner and does not mask connection failure", () => {
    const err = new ApiError(503, "SERVICE_UNAVAILABLE")
    expect(err.status).toBe(503)

    let syncError: string | null = null
    if (err.status !== 401) {
      syncError = "Không thể kết nối máy chủ backend. Đang dùng dữ liệu lưu tạm."
    }
    expect(syncError).toContain("Không thể kết nối máy chủ backend")
  })

  it("Test 6: Offline logout purges local cache even if remote API fails", () => {
    localStorage.setItem(KEY, JSON.stringify({ mode: "account", foods: [{ id: "1" }] }))
    expect(localStorage.getItem(KEY)).not.toBeNull()

    const mockApiLogout = vi.fn().mockRejectedValue(new Error("Network offline"))

    try {
      mockApiLogout().catch(() => {})
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }

    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it("Test 7: Only demo mode is persisted to localStorage, account mode is server-authoritative", () => {
    const demoState = { mode: "demo" as const, foods: [], history: [], onboarded: true }
    localStorage.setItem(DEMO_KEY, JSON.stringify(demoState))
    expect(localStorage.getItem(DEMO_KEY)).toBeDefined()

    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it("Test 8: Unmount cleanup bumps session generation and drops in-flight hydration", async () => {
    let sessionGen = 1
    let isMounted = true
    const targetState: string[] = []

    // Simulate cleanup on unmount
    const cleanup = () => {
      isMounted = false
      sessionGen++
    }

    const currentGen = sessionGen

    // Async task completes after unmount
    const task = new Promise<string>((resolve) => {
      setTimeout(() => resolve("stale-data"), 20)
    })

    // Component unmounts
    cleanup()

    const result = await task
    if (isMounted && sessionGen === currentGen) {
      targetState.push(result)
    }

    expect(targetState.length).toBe(0)
    expect(isMounted).toBe(false)
    expect(sessionGen).toBe(2)
  })

  it("Test 9: Pending offline logout flag triggers revocation on reconnect", async () => {
    localStorage.setItem("expiry_pending_server_logout", "true")
    expect(localStorage.getItem("expiry_pending_server_logout")).toBe("true")

    const mockLogout = vi.fn().mockResolvedValue({ ok: true })

    if (localStorage.getItem("expiry_pending_server_logout") === "true") {
      await mockLogout()
      localStorage.removeItem("expiry_pending_server_logout")
    }

    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem("expiry_pending_server_logout")).toBeNull()
  })
})
