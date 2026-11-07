import { describe, expect, it, vi, beforeEach } from "vitest"

import {
  notifications,
  statusOf,
  daysLeft,
  today,
  addDays,
  loadUserNotifs,
  saveUserNotifs,
  clearUserNotifs,
  getNotifKey,
  type Food,
  type State,
  type Action,
} from "../src/store/appStore"

// Mock localStorage for test environment

const mockStorage: Record<string, string> = {}

beforeEach(() => {
  for (const k in mockStorage) {
    delete mockStorage[k]
  }

  vi.stubGlobal("localStorage", {
    getItem: (k: string) => mockStorage[k] ?? null,

    setItem: (k: string, v: string) => {
      mockStorage[k] = v
    },

    removeItem: (k: string) => {
      delete mockStorage[k]
    },

    clear: () => {
      for (const k in mockStorage) delete mockStorage[k]
    },
  })
})

function createTestState(foods: Food[], overrides: Partial<State> = {}): State {
  return {
    mode: "account",

    userId: "test-user-1",

    userName: "Tester",

    onboarded: true,

    foods,

    history: [],

    locations: ["Ngăn mát"],

    readNotifs: [],

    snoozed: {},

    settings: { remindDays: 3, inApp: true, push: false },

    ...overrides,
  }
}

describe("Issue #212: Recurring Notifications, Rules & Idempotent Deduplication", () => {
  const t = today()

  it("Rule 1: generates 'expired' notification when food is past expiry date (d < 0)", () => {
    const expiredFood: Food = {
      id: "f-expired",

      name: "Sữa chua",

      quantity: 2,

      unit: "hộp",

      expDate: addDays(t, -2),

      createdAt: new Date().toISOString(),
    }

    const state = createTestState([expiredFood])

    const list = notifications(state)

    expect(list).toHaveLength(1)

    expect(list[0].rule).toBe("expired")

    expect(list[0].status).toBe("expired")

    expect(list[0].title).toBe("Đã quá hạn")

    expect(list[0].message).toContain("Sữa chua đã quá hạn 2 ngày")

    expect(list[0].id).toBe(`f-expired:${expiredFood.expDate}:expired`)
  })

  it("Rule 2: generates 'due_today' notification when food expires today (d === 0)", () => {
    const todayFood: Food = {
      id: "f-today",

      name: "Bánh mì sandwich",

      quantity: 1,

      unit: "gói",

      expDate: t,

      createdAt: new Date().toISOString(),
    }

    const state = createTestState([todayFood])

    const list = notifications(state)

    expect(list).toHaveLength(1)

    expect(list[0].rule).toBe("due_today")

    expect(list[0].status).toBe("soon")

    expect(list[0].title).toBe("Hết hạn hôm nay")

    expect(list[0].message).toContain(
      "Bánh mì sandwich hết hạn sử dụng hôm nay",
    )

    expect(list[0].id).toBe(`f-today:${todayFood.expDate}:due_today`)
  })

  it("Rule 3: generates 'soon' notification when food is within remindDays window (0 < d <= remindDays)", () => {
    const soonFood: Food = {
      id: "f-soon",

      name: "Thịt bò Úc",

      quantity: 500,

      unit: "g",

      expDate: addDays(t, 2),

      createdAt: new Date().toISOString(),
    }

    const state = createTestState([soonFood])

    const list = notifications(state)

    expect(list).toHaveLength(1)

    expect(list[0].rule).toBe("soon")

    expect(list[0].status).toBe("soon")

    expect(list[0].title).toBe("Sắp hết hạn")

    expect(list[0].message).toContain("Thịt bò Úc còn 2 ngày là hết hạn")

    expect(list[0].id).toBe(`f-soon:${soonFood.expDate}:soon`)
  })

  it("Rule 4: generates 'review' notification for items without expDate when reviewAt <= today, without fake dates", () => {
    const reviewFood: Food = {
      id: "f-review",

      name: "Táo Envy",

      quantity: 4,

      unit: "quả",

      reviewAt: t,

      createdAt: new Date().toISOString(),
    }

    const state = createTestState([reviewFood])

    const list = notifications(state)

    expect(list).toHaveLength(1)

    expect(list[0].rule).toBe("review")

    expect(list[0].status).toBe("unknown")

    expect(list[0].food.expDate).toBeUndefined() // Does not invent fake expiry date!

    expect(list[0].title).toBe("Cần kiểm tra lại")

    expect(list[0].message).toContain(
      "Táo Envy chưa rõ hạn sử dụng, đã đến lịch kiểm tra",
    )

    expect(list[0].id).toBe(`f-review:${t}:review`)
  })

  it("Rule 5: items with safe expiry (d > remindDays) or future reviewAt do NOT generate notifications", () => {
    const safeFood: Food = {
      id: "f-safe",

      name: "Gạo ST25",

      quantity: 5,

      unit: "kg",

      expDate: addDays(t, 60),

      createdAt: new Date().toISOString(),
    }

    const futureReviewFood: Food = {
      id: "f-future-review",

      name: "Cam sành",

      quantity: 2,

      unit: "kg",

      reviewAt: addDays(t, 5),

      createdAt: new Date().toISOString(),
    }

    const state = createTestState([safeFood, futureReviewFood])

    const list = notifications(state)

    expect(list).toHaveLength(0)
  })

  it("Deduplication: Idempotent key prevents duplicate notifications for the same food event", () => {
    const food: Food = {
      id: "f-dup",

      name: "Trứng gà ta",

      quantity: 10,

      unit: "quả",

      expDate: addDays(t, 1),

      createdAt: new Date().toISOString(),
    }

    // Duplicate entry in state.foods

    const state = createTestState([food, { ...food }])

    const list = notifications(state)

    expect(list).toHaveLength(1)

    expect(list[0].id).toBe(`f-dup:${food.expDate}:soon`)
  })

  it("Respects inApp notification toggle in settings", () => {
    const food: Food = {
      id: "f-test",

      name: "Sữa chua",

      quantity: 1,

      unit: "hộp",

      expDate: t,

      createdAt: new Date().toISOString(),
    }

    const disabledState = createTestState([food], {
      settings: { remindDays: 3, inApp: false, push: false },
    })

    expect(notifications(disabledState)).toHaveLength(0)
  })
})

describe("Issue #212: Snooze Persistence vs Mark Read Lifecycle", () => {
  const t = today()

  it("Mark read does NOT equal snooze: read notification stays in notifications list with read status", () => {
    const food: Food = {
      id: "f-read-test",

      name: "Rau cải thìa",

      quantity: 300,

      unit: "g",

      expDate: t,

      createdAt: new Date().toISOString(),
    }

    const notifId = `f-read-test:${t}:due_today`

    const state = createTestState([food], {
      readNotifs: [notifId], // marked as read

      snoozed: {}, // NOT snoozed
    })

    const list = notifications(state)

    // Notification MUST still be in the list!

    expect(list).toHaveLength(1)

    expect(list[0].id).toBe(notifId)

    // Unread count is reduced

    const unread = list.filter((n) => !state.readNotifs.includes(n.id))

    expect(unread).toHaveLength(0)
  })

  it("Snoozing postpones notification until the specified date, then it reappears", () => {
    const food: Food = {
      id: "f-snooze-test",

      name: "Cá hồi phi lê",

      quantity: 400,

      unit: "g",

      expDate: addDays(t, 1),

      createdAt: new Date().toISOString(),
    }

    const notifId = `f-snooze-test:${food.expDate}:soon`

    const tomorrow = addDays(t, 1)

    // 1. Snoozed until tomorrow -> hidden today

    const snoozedState = createTestState([food], {
      snoozed: { [notifId]: tomorrow },
    })

    expect(notifications(snoozedState)).toHaveLength(0)

    // 2. When until date is reached or passed (until <= today) -> reappears!

    const expiredSnoozeState = createTestState([food], {
      snoozed: { [notifId]: t }, // snooze expired today
    })

    const activeList = notifications(expiredSnoozeState)

    expect(activeList).toHaveLength(1)

    expect(activeList[0].id).toBe(notifId)
  })

  it("Lifecycle change: consuming or trashing food immediately terminates its notifications", () => {
    const activeFood: Food = {
      id: "f-consumed-test",

      name: "Thịt heo xay",

      quantity: 300,

      unit: "g",

      expDate: t,

      createdAt: new Date().toISOString(),
    }

    const state1 = createTestState([activeFood])

    expect(notifications(state1)).toHaveLength(1)

    // Food consumed (finishedAt set)

    const consumedFood: Food = {
      ...activeFood,

      quantity: 0,

      finishedAt: new Date().toISOString(),
    }

    const state2 = createTestState([consumedFood])

    expect(notifications(state2)).toHaveLength(0)

    // Food deleted / moved to trash (deletedAt set)

    const trashedFood: Food = {
      ...activeFood,

      deletedAt: new Date().toISOString(),
    }

    const state3 = createTestState([trashedFood])

    expect(notifications(state3)).toHaveLength(0)
  })
})

describe("Issue #212 & #213: User-Scoped Persistence & Account Isolation on Logout", () => {
  it("persists user snoozed and read notifications in user-scoped storage key", () => {
    const userId = "user-123"

    const notifData = {
      snoozed: { "item-1:2026-11-05:soon": "2026-11-06" },

      readNotifs: ["item-1:2026-11-05:soon", "item-2:2026-11-04:expired"],
    }

    saveUserNotifs(userId, notifData)

    const key = getNotifKey(userId)

    expect(key).toBe("expiry_notifs_user-123")

    expect(localStorage.getItem(key)).not.toBeNull()

    const loaded = loadUserNotifs(userId)

    expect(loaded.snoozed).toEqual(notifData.snoozed)

    expect(loaded.readNotifs).toEqual(notifData.readNotifs)
  })

  it("isolates notification storage across distinct user accounts", () => {
    const userA = "user-A"

    const userB = "user-B"

    saveUserNotifs(userA, {
      snoozed: { "secret-item-A:soon": "2026-11-10" },

      readNotifs: ["notif-A-1"],
    })

    saveUserNotifs(userB, {
      snoozed: {},

      readNotifs: ["notif-B-1"],
    })

    const notifsA = loadUserNotifs(userA)

    const notifsB = loadUserNotifs(userB)

    expect(notifsA.snoozed["secret-item-A:soon"]).toBe("2026-11-10")

    expect(notifsB.snoozed["secret-item-A:soon"]).toBeUndefined()

    expect(notifsB.readNotifs).toContain("notif-B-1")

    expect(notifsB.readNotifs).not.toContain("notif-A-1")
  })

  it("purges user-scoped notifications on logout to prevent credential or data leakage", () => {
    const userId = "user-leaving"

    saveUserNotifs(userId, {
      snoozed: { "item:soon": "2026-11-05" },

      readNotifs: ["item:soon"],
    })

    expect(loadUserNotifs(userId).readNotifs.length).toBe(1)

    // Clear on logout

    clearUserNotifs(userId)

    expect(localStorage.getItem(getNotifKey(userId))).toBeNull()

    const clean = loadUserNotifs(userId)

    expect(clean.readNotifs).toEqual([])

    expect(clean.snoozed).toEqual({})
  })
})

describe("Issue #213: UX Writing & In-Browser Notification Lifecycle", () => {
  it("does not claim background push notifications when app is closed", async () => {
    const settingsModule = await import("../src/features/Settings")

    expect(settingsModule).toBeDefined()

    // Read source code of Settings.tsx to ensure false claim is not present

    const fs = await import("fs")

    const path = await import("path")

    const settingsCode = fs.readFileSync(
      path.resolve(__dirname, "../src/features/Settings.tsx"),

      "utf-8",
    )

    // Must NOT promise background notifications when closed without service worker

    expect(settingsCode).not.toContain("kể cả khi đóng ứng dụng")

    // Must clearly state in-browser notifications

    expect(settingsCode).toContain("Thông báo trên trình duyệt")
  })

  it("handles notification permission lifecycle states (granted, denied, unsupported)", async () => {
    const fs = await import("fs")

    const path = await import("path")

    const settingsCode = fs.readFileSync(
      path.resolve(__dirname, "../src/features/Settings.tsx"),

      "utf-8",
    )

    // Denied guidance instructions

    expect(settingsCode).toContain("Thông báo trên trình duyệt đang bị chặn")

    expect(settingsCode).toContain("Site Settings")

    // Test notification feature for granted permission

    expect(settingsCode).toContain("sendTestNotification")

    expect(settingsCode).toContain("Gửi thông báo thử")

    // Unsupported fallback notice

    expect(settingsCode).toContain("không hỗ trợ Web Notification API")
  })

  it("navigates to notifications when clicking attention summary in Inventory", async () => {
    const fs = await import("fs")
    const path = await import("path")
    const appCode = fs.readFileSync(
      path.resolve(__dirname, "../src/App.tsx"),
      "utf-8",
    )
    expect(appCode).toMatch(
      /onNavigateAttention=\{\(\)\s*=>\s*go\(\{\s*name:\s*"notifications"\s*\}\)\}/,
    )
  })
})
