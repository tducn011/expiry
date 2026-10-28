import { useEffect, useReducer, useState } from "react"

import { api } from "../api/client"

export type Unit = "cái" | "hộp" | "gói" | "chai" | "kg" | "g" | "lít" | "ml" | "quả"
export const UNITS: Unit[] = [
  "cái",
  "hộp",
  "gói",
  "chai",
  "quả",
  "kg",
  "g",
  "lít",
  "ml",
]

export type Category = "fresh_produce" | "meat_seafood" | "dairy_eggs" | "prepared_food" | "dry_pantry" | "beverage" | "other"

export interface CategoryItem {
  id: Category
  value: Category
  label: string
}
export type CategoryOption = CategoryItem

export const CATEGORIES: CategoryItem[] = [
  { id: "fresh_produce", value: "fresh_produce", label: "Rau củ quả" },
  { id: "meat_seafood", value: "meat_seafood", label: "Thịt, cá, hải sản" },
  { id: "dairy_eggs", value: "dairy_eggs", label: "Trứng & Sữa" },
  { id: "prepared_food", value: "prepared_food", label: "Món nấu sẵn" },
  { id: "dry_pantry", value: "dry_pantry", label: "Gia vị & Đồ khô" },
  { id: "beverage", value: "beverage", label: "Đồ uống" },
  { id: "other", value: "other", label: "Khác" },
]

export const CATEGORY_LABELS: Record<Category, string> = {
  fresh_produce: "Rau củ quả",
  meat_seafood: "Thịt, cá, hải sản",
  dairy_eggs: "Trứng & Sữa",
  prepared_food: "Món nấu sẵn",
  dry_pantry: "Gia vị & Đồ khô",
  beverage: "Đồ uống",
  other: "Khác",
}

export interface Food {
  id: string
  name: string
  quantity: number
  unit: Unit
  category?: Category
  mfgDate?: string // NSX, ISO yyyy-mm-dd
  expDate?: string // HSD; unknown stays undefined
  location?: string
  createdAt: string
  reviewAt?: string // later-check date; never overwrites expDate
  deletedAt?: string // set => in Trash
  finishedAt?: string // quantity reached 0 => History only
}

export type EventKind = "add" | "edit" | "consume" | "discard" | "adjust" | "trash" | "restore" | "review"

export interface HistoryEvent {
  id: string
  foodId: string
  foodName: string
  kind: EventKind
  at: string
  amount?: number
  from?: number
  to?: number
  unit?: Unit
  category?: Category
}

export interface Settings {
  remindDays: number
  inApp: boolean
  push: boolean
}

export interface State {
  mode: "none" | "demo" | "account"
  userName?: string
  onboarded: boolean
  foods: Food[]
  history: HistoryEvent[]
  locations: string[]
  readNotifs: string[]
  snoozed: Record<string, string> // notifId -> until ISO date
  settings: Settings
}

const initial: State = {
  mode: "none",
  onboarded: false,
  foods: [],
  history: [],
  locations: ["Ngăn mát", "Ngăn đông", "Tủ bếp"],
  readNotifs: [],
  snoozed: {},
  settings: { remindDays: 3, inApp: true, push: false },
}

export type Action = {
  type: "login"
  mode: "demo" | "account"
  name?: string
} | { type: "logout" } | { type: "onboarded" } | {
  type: "save"
  food: Omit<Food, "id" | "createdAt"> & { id?: string }
} | {
  type: "qty"
  id: string
  kind: "consume" | "discard" | "adjust"
  value: number
} | {
  type: "review"
  id: string
  date: string
} | {
  type: "trash"
  id: string
} | {
  type: "restore"
  id: string
} | {
  type: "purge"
  id: string
} | {
  type: "addLocation"
  name: string
} | {
  type: "readNotif"
  id: string
} | {
  type: "snooze"
  id: string
  until: string
} | {
  type: "settings"
  settings: Settings
} | {
  type: "replace"
  state: State
} | {
  type: "demoReset"
  scenario: "full" | "empty"
}

export type Dispatch = (a: Action) => void

const uid = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()
const iso = (x: Date) =>
  `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`

// Calendar date in Vietnam, independent of the device time zone.
export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(),
  )

export const addDays = (d: string, n: number) => {
  const x = new Date(d + "T00:00:00")
  x.setDate(x.getDate() + n)
  return iso(x)
}

const TRASH_DAYS = 30

function ev(
  f: Food,
  kind: EventKind,
  extra: Partial<HistoryEvent> = {},
): HistoryEvent {
  return {
    id: uid(),
    foodId: f.id,
    foodName: f.name,
    kind,
    at: now(),
    unit: f.unit,
    category: f.category,
    ...extra,
  }
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "replace":
      return a.state
    case "login":
      return a.mode === "demo"
        ? loadDemo()
        : {
            ...(readAccount() ?? { ...initial, onboarded: s.onboarded }),
            mode: "account",
            userName: a.name,
          }
    case "logout":
      return loadDemo()
    case "demoReset":
      return s.mode === "demo"
        ? {
            ...s,
            ...initial,
            mode: "demo",
            onboarded: true,
            settings: s.settings,
            foods: a.scenario === "full" ? seedFoods() : [],
            history: a.scenario === "full" ? seedHistory() : [],
          }
        : s
    case "onboarded":
      return { ...s, onboarded: true }
    case "save": {
      const existing = a.food.id
        ? s.foods.find((f) => f.id === a.food.id)
        : undefined
      if (existing) {
        const f = { ...existing, ...a.food } as Food
        return {
          ...s,
          foods: s.foods.map((x) => (x.id === f.id ? f : x)),
          history: [ev(f, "edit"), ...s.history],
        }
      }
      const f = { ...a.food, id: uid(), createdAt: now() } as Food
      return {
        ...s,
        foods: [f, ...s.foods],
        history: [ev(f, "add", { to: f.quantity }), ...s.history],
      }
    }
    case "qty": {
      const f = s.foods.find((x) => x.id === a.id)
      if (!f) return s
      const to =
        a.kind === "adjust"
          ? a.value
          : Math.max(0, +(f.quantity - a.value).toFixed(3))
      const nf: Food = {
        ...f,
        quantity: to,
        finishedAt: to === 0 ? now() : undefined,
      }
      const e = ev(f, a.kind, {
        amount: a.kind === "adjust" ? undefined : a.value,
        from: f.quantity,
        to,
      })
      return {
        ...s,
        foods: s.foods.map((x) => (x.id === f.id ? nf : x)),
        history: [e, ...s.history],
      }
    }
    case "review": {
      const f = s.foods.find((x) => x.id === a.id)
      if (!f) return s
      return {
        ...s,
        foods: s.foods.map((x) =>
          x.id === a.id ? { ...x, reviewAt: a.date } : x,
        ),
        history: [ev(f, "review"), ...s.history],
      }
    }
    case "trash": {
      const f = s.foods.find((x) => x.id === a.id)
      if (!f) return s
      return {
        ...s,
        foods: s.foods.map((x) =>
          x.id === a.id ? { ...x, deletedAt: now() } : x,
        ),
        history: [ev(f, "trash"), ...s.history],
      }
    }
    case "restore": {
      const f = s.foods.find((x) => x.id === a.id)
      if (!f) return s
      return {
        ...s,
        foods: s.foods.map((x) =>
          x.id === a.id ? { ...x, deletedAt: undefined } : x,
        ),
        history: [ev(f, "restore"), ...s.history],
      }
    }
    case "purge":
      return { ...s, foods: s.foods.filter((x) => x.id !== a.id) }
    case "addLocation":
      return s.locations.includes(a.name)
        ? s
        : { ...s, locations: [...s.locations, a.name] }
    case "readNotif":
      return s.readNotifs.includes(a.id)
        ? s
        : { ...s, readNotifs: [...s.readNotifs, a.id] }
    case "snooze":
      return {
        ...s,
        snoozed: { ...s.snoozed, [a.id]: a.until },
        readNotifs: [...s.readNotifs, a.id],
      }
    case "settings":
      return { ...s, settings: a.settings }
  }
}

const KEY = "expiry-state-v1"
const DEMO_KEY = "expiry-demo-v1"
export type StorageProblem = "read" | "write" | null

// Sample inventory for the isolated demo namespace. Dates are relative to today (Asia/Ho_Chi_Minh).
const SEED: {
  id: string
  name: string
  quantity: number
  unit: Unit
  category: Category
  location: string
  days: number | null
}[] = [
  {
    id: "demo-sua-tuoi",
    name: "Sữa tươi",
    quantity: 1,
    unit: "hộp",
    category: "dairy_eggs",
    location: "Ngăn mát",
    days: 1,
  },
  {
    id: "demo-rau-cai",
    name: "Rau cải",
    quantity: 500,
    unit: "g",
    category: "fresh_produce",
    location: "Ngăn mát",
    days: -1,
  },
  {
    id: "demo-sua-chua",
    name: "Sữa chua",
    quantity: 4,
    unit: "hộp",
    category: "dairy_eggs",
    location: "Ngăn mát",
    days: -2,
  },
  {
    id: "demo-banh-mi",
    name: "Bánh mì",
    quantity: 1,
    unit: "gói",
    category: "prepared_food",
    location: "Tủ bếp",
    days: 2,
  },
  {
    id: "demo-pho-mai",
    name: "Phô mai",
    quantity: 200,
    unit: "g",
    category: "dairy_eggs",
    location: "Ngăn mát",
    days: 3,
  },
  {
    id: "demo-trung-ga",
    name: "Trứng gà",
    quantity: 10,
    unit: "quả",
    category: "dairy_eggs",
    location: "Ngăn mát",
    days: 9,
  },
  {
    id: "demo-thit-ga",
    name: "Thịt gà",
    quantity: 700,
    unit: "g",
    category: "meat_seafood",
    location: "Ngăn đông",
    days: 15,
  },
  {
    id: "demo-ca-chua",
    name: "Cà chua",
    quantity: 300,
    unit: "g",
    category: "fresh_produce",
    location: "Ngăn mát",
    days: 6,
  },
  {
    id: "demo-tao",
    name: "Táo",
    quantity: 4,
    unit: "quả",
    category: "fresh_produce",
    location: "Ngăn mát",
    days: null,
  },
  {
    id: "demo-gao",
    name: "Gạo",
    quantity: 2,
    unit: "kg",
    category: "dry_pantry",
    location: "Tủ bếp",
    days: 120,
  },
]

export function seedFoods(): Food[] {
  const t = today()
  const at = new Date().toISOString()
  return SEED.map(({ days, ...f }) => ({
    ...f,
    expDate: days === null ? undefined : addDays(t, days),
    createdAt: at,
  }))
}

export function seedHistory(): HistoryEvent[] {
  const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString()
  const e = (
    id: string,
    name: string,
    kind: EventKind,
    h: number,
    unit: Unit,
    extra: Partial<HistoryEvent>,
  ): HistoryEvent => ({
    id: "demo-ev-" + id,
    foodId: "demo-" + id,
    foodName: name,
    kind,
    at: ago(h),
    unit,
    ...extra,
  })
  return [
    e("trung-ga", "Trứng gà", "consume", 3, "quả", {
      amount: 2,
      from: 12,
      to: 10,
      category: "dairy_eggs",
    }),
    e("thit-ga", "Thịt gà", "consume", 20, "g", {
      amount: 300,
      from: 1000,
      to: 700,
      category: "meat_seafood",
    }),
    e("ca-chua", "Cà chua", "discard", 30, "g", {
      amount: 200,
      from: 500,
      to: 300,
      category: "fresh_produce",
    }),
    e("tao", "Táo", "adjust", 52, "quả", {
      from: 6,
      to: 4,
      category: "fresh_produce",
    }),
    e("sua-chua", "Sữa chua", "consume", 76, "hộp", {
      amount: 2,
      from: 6,
      to: 4,
      category: "dairy_eggs",
    }),
    e("gao", "Gạo", "adjust", 120, "kg", {
      from: 3,
      to: 2,
      category: "dry_pantry",
    }),
  ]
}

export function inferCategory(name: string): Category {
  const n = name.toLowerCase().trim()
  if (
    n.includes("sữa") ||
    n.includes("trứng") ||
    n.includes("phô mai") ||
    n.includes("bơ") ||
    n.includes("yaourt") ||
    n.includes("sữa chua")
  ) {
    return "dairy_eggs"
  }
  if (
    n.includes("rau") ||
    n.includes("cải") ||
    n.includes("cà chua") ||
    n.includes("táo") ||
    n.includes("chuối") ||
    n.includes("cam") ||
    n.includes("quả") ||
    n.includes("nấm") ||
    n.includes("dưa") ||
    n.includes("hành") ||
    n.includes("tỏi") ||
    n.includes("ớt") ||
    n.includes("củ")
  ) {
    return "fresh_produce"
  }
  if (
    n.includes("thịt") ||
    n.includes("gà") ||
    n.includes("bò") ||
    n.includes("heo") ||
    n.includes("lợn") ||
    n.includes("cá") ||
    n.includes("tôm") ||
    n.includes("mực") ||
    n.includes("hải sản") ||
    n.includes("xúc xích") ||
    n.includes("chả")
  ) {
    return "meat_seafood"
  }
  if (
    n.includes("bánh mì") ||
    n.includes("bánh") ||
    n.includes("cơm") ||
    n.includes("canh") ||
    n.includes("kho") ||
    n.includes("xào") ||
    n.includes("thức ăn") ||
    n.includes("nấu sẵn") ||
    n.includes("đồ ăn")
  ) {
    return "prepared_food"
  }
  if (
    n.includes("gạo") ||
    n.includes("mì") ||
    n.includes("bún") ||
    n.includes("miến") ||
    n.includes("đường") ||
    n.includes("muối") ||
    n.includes("hạt nêm") ||
    n.includes("nước mắm") ||
    n.includes("dầu ăn") ||
    n.includes("gia vị") ||
    n.includes("đồ hộp") ||
    n.includes("ngũ cốc")
  ) {
    return "dry_pantry"
  }
  if (
    n.includes("nước") ||
    n.includes("bia") ||
    n.includes("trà") ||
    n.includes("cà phê") ||
    n.includes("nước ngọt") ||
    n.includes("nước ép")
  ) {
    return "beverage"
  }
  return "other"
}

function parseState(raw: string | null): State | null {
  if (!raw) return null
  const s = { ...initial, ...JSON.parse(raw) } as State
  if (!Array.isArray(s.foods) || !Array.isArray(s.history))
    throw new Error("invalid")
  s.foods = s.foods.map((f) => ({
    ...f,
    category:
      f.category && f.category !== "other" ? f.category : inferCategory(f.name),
  }))
  s.history = s.history.map((h) => ({
    ...h,
    category:
      h.category && h.category !== "other"
        ? h.category
        : inferCategory(h.foodName),
  }))
  return s
}

function loadDemo(): State {
  try {
    const s = parseState(localStorage.getItem(DEMO_KEY))
    if (s)
      return {
        ...s,
        mode: "demo",
        onboarded: true,
        history:
          s.history.length === 0 && s.foods.length > 0
            ? seedHistory()
            : s.history,
      }
  } catch {
    /* disposable */
  }
  return {
    ...initial,
    mode: "demo",
    onboarded: true,
    foods: seedFoods(),
    history: seedHistory(),
  }
}

function readAccount(): State | null {
  try {
    const s = parseState(localStorage.getItem(KEY))
    return s && s.mode === "account" ? s : null
  } catch {
    return null
  }
}

interface StoredResult {
  state: State
  problem: StorageProblem
}

function readStored(): StoredResult {
  try {
    const s = parseState(localStorage.getItem(KEY))
    if (!s || s.mode !== "account") return { state: loadDemo(), problem: null }
    const cutoff = Date.now() - TRASH_DAYS * 864e5
    return {
      state: {
        ...s,
        foods: s.foods.filter(
          (f) => !f.deletedAt || new Date(f.deletedAt).getTime() > cutoff,
        ),
      },
      problem: null,
    }
  } catch {
    return { state: initial, problem: "read" }
  }
}

function signOutStorage() {
  try {
    api.logout().catch(() => {})
    const s = parseState(localStorage.getItem(KEY))
    if (s) localStorage.setItem(KEY, JSON.stringify({ ...s, mode: "none" }))
  } catch {
    /* nothing */
  }
}

export function useAppStore() {
  const [first] = useState(readStored)
  const [state, rawDispatch] = useReducer(reducer, first.state)
  const dispatch = (a: Action) => {
    if (a.type === "logout") signOutStorage()
    rawDispatch(a)
  }
  const [problem, setProblem] = useState<StorageProblem>(first.problem)

  useEffect(() => {
    if (problem === "read" || state.mode === "none") return
    try {
      localStorage.setItem(
        state.mode === "demo" ? DEMO_KEY : KEY,
        JSON.stringify(state),
      )
      if (problem === "write") setProblem(null)
    } catch {
      setProblem("write")
    }
  }, [state, problem])

  const retry = () => {
    const r = readStored()
    if (r.problem === null) rawDispatch({ type: "replace", state: r.state })
    setProblem(r.problem)
  }

  const reset = () => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
    rawDispatch({ type: "replace", state: loadDemo() })
    setProblem(null)
  }

  return { state, dispatch, problem, retry, reset }
}

export type Status = "unknown" | "ok" | "soon" | "expired"

export function daysLeft(f: Food) {
  if (!f.expDate) return null
  return Math.round(
    (new Date(f.expDate + "T00:00:00").getTime() -
      new Date(today() + "T00:00:00").getTime()) /
      864e5,
  )
}

export function statusOf(f: Food, remindDays: number): Status {
  const d = daysLeft(f)
  if (d === null) return "unknown"
  if (d < 0) return "expired"
  if (d <= remindDays) return "soon"
  return "ok"
}

export const active = (s: State) =>
  s.foods.filter((f) => !f.deletedAt && !f.finishedAt)
export const trashed = (s: State) => s.foods.filter((f) => f.deletedAt)

export function trashDaysLeft(f: Food) {
  if (!f.deletedAt) return TRASH_DAYS
  return Math.max(
    0,
    TRASH_DAYS -
      Math.floor((Date.now() - new Date(f.deletedAt).getTime()) / 864e5),
  )
}

export function attention(s: State) {
  const t = today()
  return active(s)
    .filter((f) => {
      if (f.reviewAt && f.reviewAt > t) return false
      const st = statusOf(f, s.settings.remindDays)
      return (
        st === "expired" ||
        st === "soon" ||
        (f.reviewAt !== undefined && f.reviewAt <= t)
      )
    })
    .sort((a, b) => (daysLeft(a) ?? 9999) - (daysLeft(b) ?? 9999))
}

export interface Notif {
  id: string
  food: Food
  status: Status
}

export function notifications(s: State): Notif[] {
  if (!s.settings.inApp) return []
  const t = today()
  return attention(s)
    .map((f) => {
      const status = statusOf(f, s.settings.remindDays)
      return {
        id: `${f.id}:${f.expDate ?? "review"}:${status}`,
        food: f,
        status,
      }
    })
    .filter((n) => !(s.snoozed[n.id] && s.snoozed[n.id] > t))
}

export function formatDate(d?: string) {
  if (!d) return ""
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

export function statusText(f: Food, remindDays: number) {
  const d = daysLeft(f)
  const st = statusOf(f, remindDays)
  if (st === "unknown") return "Chưa rõ HSD"
  if (st === "expired") return `Quá HSD ${Math.abs(d ?? 0)} ngày`
  if (d === 0) return "Hết HSD hôm nay"
  return st === "soon" ? `Sắp HSD · còn ${d} ngày` : "Còn hạn"
}
