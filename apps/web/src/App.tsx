import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import {
  api,
  ApiError,
  decimal,
  type CreateEntryDTO,
  type EditEntryDTO,
} from "./api/client"

import {
  attention,
  notifications,
  saveUserHomeAttention,
  saveUserInApp,
  useAppStore,
  type Category,
  type Food,
  type Settings as AppSettings,
  type State,
  type Unit,
} from "./store/appStore"

import { emptyDraft, draftFrom } from "./domain/foodDraft"
import type { Draft, FormMode } from "./features/FoodForm"
import type { HomeFilters } from "./features/Inventory"
import type { ShoppingFilter } from "./features/ShoppingView"
import type { FoodEntry, ShoppingItem } from "./domain/types"
import { getShoppingItems, saveShoppingItems } from "./api/shoppingMemory"

import {
  Archive,
  BarChart3,
  Bell,
  Boxes,
  CircleAlert,
  History as HistoryIcon,
  Home,
  Leaf,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Settings as SettingsIcon,
  ShoppingBag,
} from "lucide-react"

import Button from "./components/ui/Button"

import Card from "./components/ui/Card"

import Modal from "./components/ui/Modal"

import Toast, { type ToastProps } from "./components/ui/Toast"

import { DUR, EASE, gsap, isDesktopViewport, reducedMotion } from "./lib/motion"

import {
  SidebarButton,
  SidebarNavigation,
} from "./components/ui/SidebarNavigation"

// Feature screens are loaded only when their route is rendered. Each module has
// one import factory shared by lazy() and the idle prefetch below.
const loadInventory = () => import("./features/Inventory")
const loadAttention = () => import("./features/Attention")
const loadStorageView = () => import("./features/StorageView")
const loadScanner = () => import("./features/Scanner")
const loadFoodForm = () => import("./features/FoodForm")
const loadDetail = () => import("./features/Detail")
const loadInsightView = () => import("./features/InsightView")
const loadTrash = () => import("./features/Trash")
const loadNotifications = () => import("./features/Notifications")
const loadSettings = () => import("./features/Settings")
const loadAuthForm = () => import("./features/AuthForm")
const loadOnboarding = () => import("./features/Onboarding")
const loadShoppingView = () => import("./features/ShoppingView")

const Inventory = lazy(loadInventory)
const Attention = lazy(loadAttention)
const StorageView = lazy(loadStorageView)
const Scanner = lazy(loadScanner)
const FoodForm = lazy(loadFoodForm)
const Detail = lazy(loadDetail)
const InsightView = lazy(loadInsightView)
const Trash = lazy(loadTrash)
const Notifications = lazy(loadNotifications)
const Settings = lazy(loadSettings)
const AuthForm = lazy(loadAuthForm)
const Onboarding = lazy(loadOnboarding)
const ShoppingView = lazy(loadShoppingView)

const prefetchRouteChunks = [
  loadInventory,
  loadStorageView,
  loadShoppingView,
  loadInsightView,
  loadAttention,
  loadDetail,
  loadScanner,
  loadFoodForm,
  loadNotifications,
  loadSettings,
  loadTrash,
]

export type SettingsSection = "account" | "notifications" | "inventory" | "data"

export type Route = {
  name: "inventory"
  filters?: HomeFilters
} | {
  name: "storage"

  location?: string

  category?: string
} | {
  name: "attention"
} | { name: "add" } | {
  name: "scan"
  missingForm?: boolean
  shoppingItemId?: string
  shoppingDraft?: Draft
} | {
  name: "form"

  mode: FormMode

  draft: Draft

  image?: string | string[]
  shoppingItemId?: string
} | {
  name: "detail"

  id: string
} | {
  name: "insight"

  tab?: string
} | { name: "history" } | {
  name: "trash"
} | {
  name: "notifications"
  filters?: HomeFilters
} | {
  name: "settings"
  section?: SettingsSection
} | {
  name: "shopping"
  filter?: ShoppingFilter
}

export function routeFromUrl(
  search = typeof window !== "undefined"
    ? window.location.search ||
      (window.location.pathname.startsWith("/view=")
        ? `?${window.location.pathname.slice(1)}`
        : "")
    : "",
): Route[] {
  const q = new URLSearchParams(search)

  const v = q.get("view")

  const id = q.get("id")

  if (id) return [{ name: "inventory" }, { name: "detail", id }]

  if (v === "attention") return [{ name: "attention" }]

  if (v === "storage") {
    const loc = q.get("loc") || undefined

    const cat = q.get("cat") || undefined

    return [{ name: "storage", location: loc, category: cat }]
  }

  if (v === "insight" || v === "history") {
    const tab = v === "history" ? "history" : q.get("tab") || undefined

    return [{ name: "insight", tab }]
  }

  if (v === "trash") return [{ name: "trash" }]

  if (v === "settings") {
    const section = q.get("section")

    if (
      section === "account" ||
      section === "notifications" ||
      section === "inventory" ||
      section === "data"
    ) {
      return [{ name: "settings" }, { name: "settings", section }]
    }

    return [{ name: "settings" }]
  }

  if (v === "shopping") {
    const filter = q.get("filter")
    return [
      {
        name: "shopping",
        filter:
          filter === "active" || filter === "checked" ? filter : undefined,
      },
    ]
  }

  if (v === "add" || v === "scan") return [{ name: "scan" }]

  if (v === "form") return [{ name: "scan", missingForm: true }]

  if (v === "notifications") return [{ name: "notifications" }]

  return [{ name: "inventory" }]
}

export function urlFromRoute(r: Route): string {
  const p = new URLSearchParams()

  if (r.name === "inventory") {
    return typeof window !== "undefined" ? window.location.pathname : "/"
  }

  if (r.name === "detail") {
    p.set("id", r.id)

    return `?${p.toString()}`
  }

  p.set("view", r.name)

  if (r.name === "storage") {
    if (r.location && r.location !== "all") p.set("loc", r.location)

    if (r.category && r.category !== "all") p.set("cat", r.category)
  } else if (r.name === "insight") {
    if (r.tab && r.tab !== "overview") p.set("tab", r.tab)
  } else if (r.name === "shopping") {
    if (r.filter && r.filter !== "all") p.set("filter", r.filter)
  } else if (r.name === "settings") {
    if (r.section) p.set("section", r.section)
  }

  return `?${p.toString()}`
}

// Phone navigation contract: ROOT routes are the four dock tabs (plus the
// notifications deep link, which renders Home under the sheet). Everything else
// is a TASK route: no dock, one Back exit.
const ROOT_ROUTE_NAMES: ReadonlySet<Route["name"]> = new Set([
  "inventory",
  "storage",
  "shopping",
  "insight",
  "history",
  "notifications",
])

function isRootRoute(r: Route | undefined) {
  return !!r && ROOT_ROUTE_NAMES.has(r.name)
}

// Scroll position is remembered per screen and stack depth.
function scrollKey(stack: Route[]) {
  const top = stack[stack.length - 1] ?? { name: "inventory" as const }
  return `${urlFromRoute(top)}#${stack.length}`
}

function RouteLoading() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center text-text-secondary"
      role="status"
      aria-live="polite"
    >
      <Loader2 size={24} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">Đang tải màn hình…</span>
    </div>
  )
}

export default function App({ demoMode = false }: { demoMode?: boolean } = {}) {
  const { state, dispatch, problem, retry, reset } = useAppStore()

  const [isCheckingSession, setIsCheckingSession] = useState(!demoMode)

  // authGenRef guards Effect 1 (session verification) only.

  // hydrationGenRef guards Effect 2 (inventory hydration) only.

  // Keeping them separate prevents Effect 2 from invalidating Effect 1's

  // generation check and blocking setIsCheckingSession(false).

  const authGenRef = useRef(0)

  const dispatchRef = useRef(dispatch)

  dispatchRef.current = dispatch

  const hydrationGenRef = useRef(0)

  const refreshInventoryRef = useRef<(() => Promise<void>) | null>(null)

  // 1. Initial Session Verification on mount

  useEffect(() => {
    if (demoMode) {
      setIsCheckingSession(false)

      return
    }

    let isMounted = true

    const gen = ++authGenRef.current

    setIsCheckingSession(true)

    // Revoke any pending offline server logout before checking session

    try {
      if (localStorage.getItem("expiry_pending_server_logout") === "true") {
        api

          .logout()

          .catch(() => {})

          .finally(() => {
            try {
              localStorage.removeItem("expiry_pending_server_logout")
            } catch {
              /* ignore */
            }
          })
      }
    } catch {
      /* ignore */
    }

    api

      .session()

      .then((s) => {
        if (!isMounted || authGenRef.current !== gen) return

        if (s.user) {
          dispatchRef.current({
            type: "login",

            mode: "account",

            name: s.user.display_name || s.user.email.split("@")[0],

            userId: s.user.id,
          })
        } else {
          if (state.mode === "account") {
            dispatchRef.current({ type: "logout" })
          }
        }
      })

      .catch((err) => {
        if (!isMounted || authGenRef.current !== gen) return

        if (err instanceof ApiError && err.status === 401) {
          if (state.mode === "account") {
            dispatchRef.current({ type: "logout" })
          }
        }
      })

      .finally(() => {
        if (isMounted && authGenRef.current === gen) {
          setIsCheckingSession(false)
        }
      })

    return () => {
      isMounted = false

      authGenRef.current++
    }
  }, [demoMode])

  // 2. Hydrate Account Inventory when verified userId is established

  useEffect(() => {
    if (demoMode || !state.userId || state.mode !== "account") return

    let isMounted = true

    const gen = ++hydrationGenRef.current

    const activeUserId = state.userId

    const hydrateInventory = async () => {
      let pageNum = 1

      const limit = 100

      let hasMore = true

      const allItems: FoodEntry[] = []

      while (hasMore) {
        const page = await api.entries({ page: pageNum, limit })

        if (
          !isMounted ||
          hydrationGenRef.current !== gen ||
          state.userId !== activeUserId
        )
          return

        allItems.push(...page.items)

        if (
          !page.pagination ||
          pageNum * limit >= page.pagination.total ||
          page.items.length === 0
        ) {
          hasMore = false
        } else {
          pageNum++
        }
      }

      if (
        !isMounted ||
        hydrationGenRef.current !== gen ||
        state.userId !== activeUserId
      )
        return

      const mappedFoods: Food[] = allItems.map((item) => ({
        id: item.id,

        name: item.name,

        quantity: item.remaining_quantity,

        unit: (item.unit === "piece" ? "cái" : item.unit) as Unit,

        category: item.category as Category || undefined,

        location: item.storage_location || undefined,

        expDate: item.expiry_date || undefined,

        mfgDate: item.manufactured_on || undefined,

        opened_on: item.opened_on || undefined,

        finishedAt: item.remaining_quantity === 0 ? item.updated_at : undefined,

        deletedAt: item.deleted_at || undefined,

        barcode: item.barcode || undefined,

        reviewAt: item.review_at || undefined,

        note: item.note || undefined,

        createdAt: item.created_at,

        version: item.version,
      }))

      const serverLocations = Array.from(
        new Set(
          allItems

            .map((item) => item.storage_location)

            .filter((l): l is string =>
              Boolean(l && l !== "unspecified" && l.trim()),
            ),
        ),
      )

      dispatch({
        type: "hydrateInventory",

        foods: mappedFoods,

        locations: serverLocations,
      })
    }

    refreshInventoryRef.current = hydrateInventory

    hydrateInventory().catch(() => {})

    api

      .preferences()

      .then((prefs) => {
        if (
          !isMounted ||
          hydrationGenRef.current !== gen ||
          state.userId !== activeUserId
        )
          return

        if (prefs && Number.isInteger(prefs.attention_lead_days)) {
          dispatch({
            type: "remindDays",

            days: prefs.attention_lead_days,
          })
        }
      })

      .catch(() => {})

    return () => {
      isMounted = false

      hydrationGenRef.current++
    }
  }, [demoMode, dispatch, state.userId, state.mode])

  const [confirmReset, setConfirmReset] = useState(false)

  const [sidebarPreference, setIsSidebarExpanded] = useState<boolean>(() => {
    try {
      const savedPreference = localStorage.getItem("expiry_sidebar_expanded")

      return savedPreference === null || savedPreference === "true"
    } catch {
      return true
    }
  })

  const [wideSidebar, setWideSidebar] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1280px)").matches,
  )
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)")
    const update = () => setWideSidebar(query.matches)
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  const isSidebarExpanded = wideSidebar && sidebarPreference

  const toggleSidebar = () => {
    if (!wideSidebar) return
    setIsSidebarExpanded((prev) => {
      const next = !prev

      try {
        localStorage.setItem("expiry_sidebar_expanded", String(next))
      } catch {}

      return next
    })
  }

  const [stack, setStack] = useState<Route[]>(() => routeFromUrl())
  const stackRef = useRef(stack)
  stackRef.current = stack
  const rememberScrollRef = useRef<() => void>(() => {})
  const settingsDirtyRef = useRef(false)
  const settingsSavingRef = useRef(false)
  const handleSettingsDirty = useCallback((dirty: boolean) => {
    settingsDirtyRef.current = dirty
  }, [])
  const handleSettingsSaving = useCallback((saving: boolean) => {
    settingsSavingRef.current = saving
  }, [])
  const pendingSettingsLeaveRef = useRef<null | (() => void)>(null)
  const [showSettingsLeavePrompt, setShowSettingsLeavePrompt] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state
  const pendingShoppingImports = useRef(new Set<string>())
  const formDirty = useRef(false)
  const onFormDirty = useCallback((dirty: boolean) => {
    formDirty.current = dirty
  }, [])
  const owner = state.userId ?? "demo"
  const historyOwner = useRef<string | undefined>(undefined)
  const position = useRef(0)
  const restoringTraversal = useRef<number | null>(null)
  const allowedTraversal = useRef(false)
  const lastShoppingFilter = useRef<ShoppingFilter>("all")
  const shoppingRoot = stack[0]
  if (shoppingRoot?.name === "shopping") {
    lastShoppingFilter.current = shoppingRoot.filter ?? "all"
  }

  // Recover only entries belonging to the session that was just verified.
  useLayoutEffect(() => {
    if (isCheckingSession || historyOwner.current === owner) return
    const saved = window.history.state
    const recover =
      saved?.owner === owner &&
      Array.isArray(saved.stack) &&
      saved.stack.length > 0
    const next: Route[] = recover ? saved.stack : routeFromUrl()
    historyOwner.current = owner
    position.current = recover ? saved.position : 0
    stackRef.current = next
    setStack(next)
    window.history.replaceState(
      {
        ...(recover ? saved : {}),
        owner,
        stack: next,
        position: position.current,
      },
      "",
      urlFromRoute(next[next.length - 1]),
    )
    if (!recover && next[0]?.name === "scan" && next[0].missingForm) {
      notify(
        "Không tìm thấy bản nhập. Bạn có thể quét nhãn hoặc nhập tay.",
        "warning",
      )
    }
  }, [isCheckingSession, owner])

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const current = stackRef.current.at(-1)
      const entry = event.state
      const owned =
        entry?.owner === historyOwner.current && Array.isArray(entry.stack)
      const target =
        owned && Number.isInteger(entry.position) ? entry.position : 0
      const delta = target - position.current
      const previouslyRequested = restoringTraversal.current
      if (previouslyRequested !== null && delta === 0) {
        restoringTraversal.current = null
        const leave = () => {
          allowedTraversal.current = true
          window.history.go(previouslyRequested)
        }
        if (current?.name === "form" && !pendingShoppingImports.current.size) {
          setDiscard(() => leave)
        } else if (current?.name === "settings" && !settingsSavingRef.current) {
          pendingSettingsLeaveRef.current = leave
          setShowSettingsLeavePrompt(true)
        }
        return
      }
      if (
        !allowedTraversal.current &&
        delta &&
        owned &&
        ((current?.name === "form" &&
          (formDirty.current || pendingShoppingImports.current.size)) ||
          (current?.name === "settings" &&
            (settingsDirtyRef.current || settingsSavingRef.current)))
      ) {
        restoringTraversal.current = delta
        window.history.go(-delta)
        return
      }
      allowedTraversal.current = false
      restoringTraversal.current = null
      rememberScrollRef.current()
      const next: Route[] =
        owned && entry.stack.length ? entry.stack : routeFromUrl()
      position.current = target
      stackRef.current = next
      setStack(next)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    const guardUnload = (event: BeforeUnloadEvent) => {
      if (!settingsDirtyRef.current && !formDirty.current) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", guardUnload)
    return () => window.removeEventListener("beforeunload", guardUnload)
  }, [])

  const [toast, setToast] = useState<{
    message: string

    variant?: ToastProps["variant"]

    open: boolean
  } | null>(null)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const dismissToast = () => {
    clearTimeout(toastTimer.current)
    setToast((t) => (t ? { ...t, open: false } : t))
  }

  const [discard, setDiscard] = useState<null | (() => void)>(null)

  const [pendingAuth, setPendingAuth] = useState<Route | null>(null)

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  // Keeps the lazy panel mounted until its exit animation finishes.
  const [notificationsMounted, setNotificationsMounted] = useState(false)

  const mainRef = useRef<HTMLElement>(null)

  const route = stack[stack.length - 1] || { name: "inventory" }

  const showNotifications =
    isNotificationsOpen || route.name === "notifications"

  if (showNotifications && !notificationsMounted) {
    setNotificationsMounted(true)
  }

  const closeNotifications = () => {
    setIsNotificationsOpen(false)
    if (route.name === "notifications") {
      if (stack.length > 1) {
        back()
      } else {
        tab({ name: "inventory" })
      }
    }
  }

  // Idle prefetch of every route chunk so first navigation never waits on the
  // network. The notifications chunk is also prefetched from the bell.
  useEffect(() => {
    const run = () => {
      for (const load of prefetchRouteChunks) load().catch(() => {})
    }
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(run, 1500)
    return () => window.clearTimeout(id)
  }, [])

  // Scroll restoration and the single phone route transition. Back (pop)
  // restores the saved scroll of the screen below; push and tab switches start
  // at the top.
  const scrollPositions = useRef(new Map<string, number>())
  const transitionRef = useRef<HTMLDivElement>(null)
  const prevRouteInfo = useRef({
    length: stack.length,
    name: route.name,
    key: scrollKey(stack),
  })
  const topKey = scrollKey(stack)
  useLayoutEffect(() => {
    const prev = prevRouteInfo.current
    const next = { length: stack.length, name: route.name, key: topKey }
    prevRouteInfo.current = next
    if (prev.key === next.key && prev.length === next.length) return
    const main = mainRef.current
    const kind =
      next.length > prev.length
        ? "push"
        : next.length < prev.length
          ? "pop"
          : next.name !== prev.name
            ? "tab"
            : "none"
    // Same screen updated in place (filters): keep the scroll position.
    if (kind === "none") return

    let raf = 0
    if (main) {
      const saved =
        kind === "pop" ? scrollPositions.current.get(next.key) : undefined
      main.scrollTop = saved ?? 0
      if (saved) {
        // Lazy content may not be laid out yet: retry once on the next frame.
        raf = requestAnimationFrame(() => {
          if (Math.abs(main.scrollTop - saved) > 1) main.scrollTop = saved
        })
      }
    }

    const el = transitionRef.current
    if (!el || isDesktopViewport() || reducedMotion()) {
      return () => cancelAnimationFrame(raf)
    }
    const from =
      kind === "push"
        ? { x: 24, opacity: 0 }
        : kind === "pop"
          ? { x: -24, opacity: 0 }
          : { opacity: 0 }
    const tween = gsap.fromTo(el, from, {
      x: 0,
      opacity: 1,
      duration: kind === "tab" ? DUR.fast : DUR.normal,
      ease: EASE.enter,
      overwrite: true,
      clearProps: "transform,opacity",
    })
    return () => {
      cancelAnimationFrame(raf)
      tween.kill()
      gsap.set(el, { clearProps: "transform,opacity" })
    }
  }, [topKey, stack.length, route.name])

  const rememberScroll = () => {
    if (mainRef.current) {
      scrollPositions.current.set(
        scrollKey(stackRef.current),
        mainRef.current.scrollTop,
      )
    }
  }
  rememberScrollRef.current = rememberScroll

  const navigateStack = (next: Route[], replace = false) => {
    rememberScroll()
    const current = next[next.length - 1]
    const entry = {
      owner,
      stack: next,
      position: replace ? position.current : position.current + 1,
      hasParent: replace ? window.history.state?.hasParent : next.length > 1,
    }
    if (replace) window.history.replaceState(entry, "", urlFromRoute(current))
    else window.history.pushState(entry, "", urlFromRoute(current))
    position.current = entry.position
    stackRef.current = next
    setStack(next)
  }

  const go = (r: Route) => navigateStack([...stackRef.current, r])

  const tab = (r: Route) => {
    if (r.name === "shopping" && r.filter === undefined) {
      r = { ...r, filter: lastShoppingFilter.current }
    }
    if (
      stackRef.current.length === 1 &&
      urlFromRoute(r) === urlFromRoute(stackRef.current[0])
    )
      return
    navigateStack([r])
  }

  const back = () => {
    if (window.history.state?.hasParent) {
      allowedTraversal.current = true
      window.history.back()
      return
    }
    // A directly opened URL can have a logical parent without a browser entry.
    const parent = stackRef.current.slice(0, -1)
    navigateStack(parent.length ? parent : [{ name: "inventory" }], true)
  }

  const reviewScan = (nextRoute: Route) => {
    const parent = stackRef.current.slice(0, -1)
    navigateStack(
      [
        ...(parent.length ? parent : [{ name: "inventory" as const }]),
        nextRoute,
      ],
      true,
    )
  }

  const requestSettingsLeave = (action: () => void) => {
    if (route.name === "settings" && settingsSavingRef.current) return
    if (route.name === "settings" && settingsDirtyRef.current) {
      pendingSettingsLeaveRef.current = action
      setShowSettingsLeavePrompt(true)
      return
    }
    action()
  }

  const handleNav = (targetName: Route["name"]) => {
    const navigate = () => {
      setIsNotificationsOpen(false)
      if (targetName === "scan") {
        if (route.name === "scan") return
        go({ name: "scan" })
      } else {
        tab({ name: targetName } as Route)
      }
    }
    if (route.name === "form") {
      if (pendingShoppingImports.current.size) return
      if (formDirty.current) {
        setDiscard(() => navigate)
        return
      }
    }
    requestSettingsLeave(navigate)
  }

  const notify = (
    message: string,

    variant: ToastProps["variant"] = "success",
  ) => {
    clearTimeout(toastTimer.current)

    setToast({ message, variant, open: true })

    toastTimer.current = setTimeout(dismissToast, 3200)
  }

  const saveSettings = async (draft: AppSettings): Promise<{
    settings: AppSettings
    savedToAccount: boolean
  }> => {
    if (state.mode !== "account" || !state.userId) {
      const settings = { ...draft, push: false }
      localStorage.setItem(
        "expiry-demo-v1",
        JSON.stringify({ ...stateRef.current, settings }),
      )
      dispatch({ type: "settings", settings })
      return { settings, savedToAccount: false }
    }

    const ownerId = state.userId
    let savedToAccount = false
    if (draft.remindDays !== state.settings.remindDays) {
      const current = await api.preferences()
      if (current.attention_lead_days !== draft.remindDays) {
        try {
          const saved = await api.updatePreferences({
            timezone: current.timezone,
            attention_lead_days: draft.remindDays,
            expected_version: current.version,
          })
          if (saved.attention_lead_days !== draft.remindDays) {
            throw new Error("Máy chủ trả về ngưỡng cảnh báo không khớp.")
          }
        } catch (error) {
          if (!(error instanceof ApiError) || !error.uncertain) throw error
          const readback = await api.preferences()
          if (readback.attention_lead_days !== draft.remindDays) throw error
        }
      }
      savedToAccount = true
    }

    if (
      stateRef.current.userId !== ownerId ||
      stateRef.current.mode !== "account"
    ) {
      throw new Error("Tài khoản đã thay đổi. Hãy mở lại Cài đặt.")
    }
    if (draft.inApp !== stateRef.current.settings.inApp) {
      saveUserInApp(ownerId, draft.inApp)
    }
    saveUserHomeAttention(ownerId, draft.homeAttentionExpanded)
    const settings = {
      ...stateRef.current.settings,
      remindDays: draft.remindDays,
      inApp: draft.inApp,
      homeAttentionExpanded: draft.homeAttentionExpanded,
      push: false,
    }
    dispatch({ type: "settings", settings })
    return { settings, savedToAccount }
  }

  // Handle unreadable storage error recovery

  if (problem === "read") {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 bg-brand-tertiary">
        <Card
          className="flex w-full max-w-md flex-col gap-5 border border-border-primary/60 shadow-xs"
          role="alert"
        >
          <CircleAlert
            size={32}
            aria-hidden="true"
            className="text-status-expired"
          />
          <h1 className="text-xl font-semibold text-text-heading tracking-normal">
            Không đọc được dữ liệu
          </h1>
          <p className="text-sm text-text-secondary font-normal leading-relaxed">
            Dữ liệu lưu trên thiết bị của bạn bị lỗi hoặc không truy cập được.
            Dữ liệu cũ vẫn chưa bị xóa.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <Button variant="primary" onClick={retry}>
              Thử lại
            </Button>
            <Button variant="neutral" onClick={() => setConfirmReset(true)}>
              Bắt đầu lại với kho trống
            </Button>
          </div>
        </Card>

        <Modal
          isOpen={confirmReset}
          onClose={() => setConfirmReset(false)}
          title="Xóa dữ liệu trên thiết bị?"
          size="small"
          footer={
            <>
              <Button variant="neutral" onClick={() => setConfirmReset(false)}>
                Giữ nguyên
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  reset()

                  setConfirmReset(false)
                }}
              >
                Xóa và bắt đầu lại
              </Button>
            </>
          }
        >
          <p className="text-sm text-text-secondary">
            Toàn bộ thực phẩm và lịch sử đang lưu trên thiết bị này sẽ bị xóa
            hoàn toàn.
          </p>
        </Modal>
      </div>
    )
  }

  if (isCheckingSession && !demoMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-bg">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <Loader2
            size={32}
            className="animate-spin text-brand-primary"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">Đang kiểm tra phiên làm việc…</p>
        </div>
      </div>
    )
  }

  // Auth flow

  if (state.mode !== "account" && pendingAuth) {
    return (
      <Suspense fallback={<RouteLoading />}>
        <AuthForm dispatch={dispatch} onCancel={() => setPendingAuth(null)} />
      </Suspense>
    )
  }

  // Onboarding flow

  if (state.mode === "account" && !state.onboarded) {
    return (
      <Suspense fallback={<RouteLoading />}>
        <Onboarding onDone={() => dispatch({ type: "onboarded" })} />
      </Suspense>
    )
  }

  if (pendingAuth && state.mode === "account") {
    const target = pendingAuth

    setPendingAuth(null)

    setStack([target])
  }

  const attnCount = attention(state).length

  const unreadCount = notifications(state).filter(
    (n) => !state.readNotifs.includes(n.id),
  ).length

  const navItems: {
    r: Route["name"]

    label: string

    icon: ReactNode

    badge?: number
  }[] = [
    { r: "inventory", label: "Hôm nay", icon: <Home size={20} /> },

    {
      r: "storage",

      label: "Kho thực phẩm",

      icon: <Archive size={20} />,
    },

    {
      r: "shopping",
      label: "Danh sách mua sắm",
      icon: <ShoppingBag size={20} />,
    },

    { r: "insight", label: "Thống kê", icon: <BarChart3 size={20} /> },
  ]

  const isAddFlow =
    route.name === "scan" ||
    route.name === "add" ||
    (route.name === "form" && route.mode !== "edit")

  // Active root for sidebar and dock. Task routes inherit the first root route
  // in the stack; Settings and Trash belong to the Settings sidebar item. The
  // notifications sheet never changes the active tab.
  const normalizeRoot = (name: Route["name"]) =>
    name === "history"
      ? "insight"
      : name === "notifications"
        ? "inventory"
        : name
  const rootName: Route["name"] =
    route.name === "settings" || route.name === "trash"
      ? "settings"
      : isRootRoute(route)
        ? normalizeRoot(route.name)
        : normalizeRoot(stack.find((r) => isRootRoute(r))?.name ?? "inventory")

  async function finishShoppingImport(
    shoppingItemId?: string,
    accountAlreadyMarked = false,
  ) {
    if (shoppingItemId) {
      if (state.mode === "account") {
        if (!accountAlreadyMarked) {
          try {
            const item = await api.shoppingItem(shoppingItemId)
            if (item && !item.inventoryAddedAt)
              await api.updateShoppingItem(
                item,
                { inventoryAddedAt: new Date().toISOString() },
                `shopping_mark_${crypto.randomUUID()}`,
              )
          } catch {
            notify(
              "Thực phẩm đã lưu. Chưa cập nhật được dấu đã nhập trong danh sách mua.",
              "warning",
            )
          }
        }
      } else {
        const current = getShoppingItems()
        const item = current.find(
          (candidate) => candidate.id === shoppingItemId,
        )
        if (item) {
          const next = current.map((candidate) =>
            candidate.id === shoppingItemId
              ? { ...candidate, inventoryAddedAt: new Date().toISOString() }
              : candidate,
          )
          saveShoppingItems(next)
        }
      }
      if (
        stackRef.current[0]?.name === "shopping" &&
        stackRef.current.length === 2
      )
        back()
      else if (stackRef.current[0]?.name !== "shopping")
        tab({ name: "shopping" })
    } else if (stackRef.current.at(-1)?.name === "form") {
      back()
    } else {
      tab({ name: "inventory" })
    }
  }

  async function handleSaveDraft(
    d: Draft,
    mode: FormMode,
    shoppingItemId?: string,
  ) {
    if (!shoppingItemId) return saveFoodDraft(d, mode)

    const owner = state.userId
    // History and retries of the same purchase must refer to the same create.
    const commandKey = `shopping_atomic_import_${shoppingItemId}`
    const pendingKey = JSON.stringify([owner, commandKey])
    if (pendingShoppingImports.current.has(pendingKey)) return

    let item: ShoppingItem | undefined
    try {
      item =
        state.mode === "account"
          ? await api.shoppingItem(shoppingItemId)
          : getShoppingItems().find(
              (candidate) => candidate.id === shoppingItemId,
            )
    } catch {
      notify("Không đọc được danh sách mua. Hãy thử lại.", "warning")
      return
    }
    const returnToShopping = () => {
      if (
        stackRef.current[0]?.name === "shopping" &&
        stackRef.current.length === 2
      )
        back()
      else tab({ name: "shopping" })
    }
    if (!item?.checked) {
      notify("Món này không còn trong danh sách đã mua.", "warning")
      returnToShopping()
      return
    }
    if (
      item.inventoryAddedAt ||
      (state.mode === "demo" &&
        stateRef.current.foods.some((food) => food.id === commandKey))
    ) {
      notify("Món này đã được thêm vào kho.", "warning")
      returnToShopping()
      return
    }

    pendingShoppingImports.current.add(pendingKey)
    try {
      await saveFoodDraft(
        d,
        mode,
        shoppingItemId,
        commandKey,
        item.version ?? 1,
      )
    } finally {
      pendingShoppingImports.current.delete(pendingKey)
    }
  }

  async function saveFoodDraft(
    d: Draft,
    mode: FormMode,
    shoppingItemId?: string,
    commandKey?: string,
    shoppingExpectedVersion?: number,
  ) {
    if (state.mode === "account") {
      const idempotencyKey = commandKey ?? `idemp_${crypto.randomUUID()}`

      if (mode === "edit" && d.id) {
        const existing = state.foods.find((f) => f.id === d.id)

        const expectedVersion = existing?.version ?? 1

        try {
          const patch: EditEntryDTO = {
            name: d.name.trim(),

            storage_location: d.location?.trim() || "unspecified",

            expiry_date: d.expDate || null,

            date_certainty: d.expDate ? "known" : "unknown",

            date_source: d.expDate ? "printed_label" : "unknown",

            date_label_type: "unspecified",

            opened_on: d.opened_on || null,

            manufactured_on: d.mfgDate || null,

            review_at: d.reviewAt || null,

            note: d.note !== undefined ? d.note.trim() || null : undefined,

            category: d.category || null,

            barcode: d.barcode || null,

            expected_version: expectedVersion,
          }

          const updated = await api.updateEntry(d.id, patch, idempotencyKey)

          dispatch({
            type: "save",

            food: {
              id: updated.id,

              name: updated.name,

              quantity: updated.remaining_quantity,

              unit: (d.unit || "cái") as Unit,

              category: d.category || "other",

              mfgDate: d.mfgDate || undefined,

              opened_on: d.opened_on || undefined,

              expDate: updated.expiry_date || undefined,

              location: updated.storage_location || undefined,

              barcode: d.barcode || undefined,

              reviewAt: d.reviewAt || undefined,

              note: d.note?.trim() || undefined,

              finishedAt:
                updated.remaining_quantity === 0
                  ? new Date().toISOString()
                  : undefined,

              version: updated.version,
            },
          })

          notify("Đã lưu thay đổi")

          await finishShoppingImport(shoppingItemId)

          return
        } catch (err: unknown) {
          if (err instanceof ApiError && err.code === "VERSION_CONFLICT") {
            notify(
              "Xung đột phiên bản: Dữ liệu đã thay đổi ở nơi khác. Đang tải lại dữ liệu mới nhất...",

              "warning",
            )

            refreshInventoryRef.current?.()
          } else {
            notify("Lỗi kết nối máy chủ. Không thể lưu thay đổi.")
          }

          return
        }
      } else {
        try {
          const rawQty = Number(d.quantity) || 1

          const quantity = rawQty
          const unit = d.unit || "cái"

          const entry: CreateEntryDTO = {
            name: d.name.trim(),

            storage_location: d.location?.trim() || "unspecified",

            expiry_date: d.expDate || null,

            date_certainty: d.expDate ? "known" : "unknown",

            date_source: d.expDate
              ? mode === "ocr"
                ? "printed_label"
                : "user_entered"
              : "unknown",

            date_label_type: "unspecified",

            opened_on: d.opened_on || null,

            manufactured_on: d.mfgDate || null,

            review_at: d.reviewAt || null,

            note: d.note?.trim() || null,

            category: d.category || null,

            barcode: d.barcode || null,

            quantity: decimal(quantity),

            unit,
          }
          const created = shoppingItemId
            ? (
                await api.importShoppingItemToInventory(
                  shoppingItemId,
                  {
                    expected_version: shoppingExpectedVersion ?? 1,
                    entry,
                  },
                  idempotencyKey,
                )
              ).entry
            : await api.createEntry(entry, idempotencyKey)

          if (
            !shoppingItemId ||
            !stateRef.current.foods.some((food) => food.id === created.id)
          ) {
            dispatch({
              type: "save",

              food: {
                id: created.id,

                name: created.name,

                quantity: Number(d.quantity),

                unit: (d.unit || "cái") as Unit,

                category: d.category || "other",

                mfgDate: d.mfgDate || undefined,

                opened_on: d.opened_on || undefined,

                expDate: created.expiry_date || undefined,

                location: created.storage_location || undefined,

                barcode: d.barcode || undefined,

                reviewAt: d.reviewAt || undefined,

                note: d.note?.trim() || undefined,

                finishedAt: undefined,

                version: created.version,
              },
            })
          }

          notify(
            d.expDate
              ? `Đã lưu ${d.name.trim()}`
              : `Đã lưu ${d.name.trim()} — chưa rõ HSD`,
          )

          await finishShoppingImport(shoppingItemId, Boolean(shoppingItemId))

          return
        } catch (err: unknown) {
          if (
            shoppingItemId &&
            err instanceof ApiError &&
            err.code === "IDEMPOTENCY_KEY_REUSED"
          ) {
            notify(
              "Hãy kiểm tra Kho: món này có thể đã được lưu với thông tin trước đó.",
              "warning",
            )
          } else if (
            shoppingItemId &&
            err instanceof ApiError &&
            ["SHOPPING_NOT_CHECKED", "SHOPPING_ALREADY_IMPORTED"].includes(
              err.code,
            )
          ) {
            notify(err.message, "warning")
          } else if (
            shoppingItemId &&
            err instanceof ApiError &&
            err.uncertain
          ) {
            notify(
              "Chưa xác nhận được kết quả. Hãy kiểm tra Kho trước khi thử lưu lại.",
              "warning",
            )
          } else {
            notify("Lỗi kết nối máy chủ. Không thể tạo thực phẩm.")
          }

          return
        }
      }
    }

    dispatch({
      type: "save",

      food: {
        id: mode === "edit" ? d.id : commandKey,

        name: d.name.trim(),

        quantity: Number(d.quantity),

        unit: d.unit || "cái",

        category: d.category || "other",

        mfgDate: d.mfgDate || undefined,

        opened_on: d.opened_on || undefined,

        expDate: d.expDate || undefined,

        location: d.location || undefined,

        barcode: d.barcode || undefined,

        reviewAt: d.reviewAt || undefined,

        note: d.note?.trim() || undefined,

        finishedAt: undefined,
      },
    })

    notify(
      mode === "edit"
        ? "Đã lưu thay đổi"
        : d.expDate
          ? `Đã lưu ${d.name.trim()}`
          : `Đã lưu ${d.name.trim()} — chưa rõ HSD`,
    )

    await finishShoppingImport(shoppingItemId)
  }

  const navigateGuarded = (action: () => void) => {
    if (route.name === "form") {
      if (pendingShoppingImports.current.size) return
      if (formDirty.current) {
        setDiscard(() => action)
        return
      }
    }
    if (route.name === "settings") {
      requestSettingsLeave(action)
      return
    }
    action()
  }

  const settingsSectionNames: Record<SettingsSection, string> = {
    account: "Tài khoản",
    notifications: "Thông báo & cảnh báo",
    inventory: "Kho thực phẩm",
    data: "Dữ liệu",
  }

  const labelForRoute = (r: Route): string => {
    switch (r.name) {
      case "inventory":
      case "notifications":
        return "Hôm nay"
      case "storage":
        return "Kho thực phẩm"
      case "shopping":
        return "Danh sách mua sắm"
      case "insight":
      case "history":
        return "Thống kê"
      case "attention":
        return "Cần chú ý"
      case "settings":
        return r.section ? settingsSectionNames[r.section] : "Cài đặt"
      case "trash":
        return "Thùng rác"
      case "detail":
        return (
          state.foods.find((x) => x.id === r.id)?.name || "Chi tiết thực phẩm"
        )
      case "form":
        return r.mode === "edit" ? "Chỉnh sửa" : "Thêm thực phẩm"
      case "scan":
      case "add":
        return "Quét thực phẩm"
    }
  }

  const nestedBreadcrumbs = (() => {
    const crumbs = stack.map((item, idx) => ({
      label: labelForRoute(item),
      onClick:
        idx < stack.length - 1
          ? () => navigateGuarded(() => navigateStack(stack.slice(0, idx + 1)))
          : undefined,
    }))
    if (crumbs.length === 1) {
      if (route.name === "trash") {
        return [
          {
            label: "Hôm nay",
            onClick: () => navigateGuarded(() => tab({ name: "inventory" })),
          },
          {
            label: "Cài đặt",
            onClick: () =>
              navigateGuarded(() =>
                navigateStack([{ name: "settings", section: "data" }]),
              ),
          },
          crumbs[0],
        ]
      }
      return [
        {
          label: "Hôm nay",
          onClick: () => navigateGuarded(() => tab({ name: "inventory" })),
        },
        crumbs[0],
      ]
    }
    return crumbs
  })()

  let screenContent: ReactNode

  switch (route.name) {
    case "notifications":
    case "inventory":
      screenContent = (
        <Inventory
          state={state}
          filters={route.filters}
          onFiltersChange={(filters) =>
            navigateStack(
              [...stackRef.current.slice(0, -1), { ...route, filters }],
              true,
            )
          }
          onOpenDetail={(id) => go({ name: "detail", id })}
          onAdd={() => go({ name: "scan" })}
          onNavigateAttention={() => go({ name: "attention" })}
        />
      )

      break

    case "storage":
      screenContent = (
        <StorageView
          state={state}
          dispatch={dispatch}
          isLive={state.mode === "account"}
          initialLocation={route.location}
          initialCategory={route.category as Category | "all" | undefined}
          onNavigateAttention={() => go({ name: "attention" })}
          onFilterChange={(loc, cat) => {
            const nextRoute: Route = {
              name: "storage",

              location: loc !== "all" ? loc : undefined,

              category: cat !== "all" ? cat : undefined,
            }

            navigateStack([nextRoute], true)
          }}
          onAddLocation={async (name) => {
            dispatch({ type: "addLocation", name })

            if (state.mode === "account" && state.userId) {
              try {
                const key = `expiry_user_preferences_${state.userId}`

                const curPrefs = JSON.parse(
                  (typeof localStorage !== "undefined"
                    ? localStorage.getItem(key)
                    : null) || "{}",
                )

                const locs = Array.from(
                  new Set([...(curPrefs.locations || state.locations), name]),
                )

                if (typeof localStorage !== "undefined")
                  localStorage.setItem(
                    key,

                    JSON.stringify({ ...curPrefs, locations: locs }),
                  )
              } catch {}
            }
          }}
          onRenameLocation={async (oldName, newName) => {
            dispatch({ type: "renameLocation", oldName, newName })

            if (state.mode === "account") {
              const affected = state.foods.filter(
                (f) => !f.deletedAt && !f.finishedAt && f.location === oldName,
              )

              for (const f of affected) {
                const idempKey = `idemp_${crypto.randomUUID()}`

                api

                  .updateEntry(
                    f.id,

                    {
                      storage_location: newName,

                      expected_version: f.version ?? 1,
                    },

                    idempKey,
                  )

                  .catch(() => {})
              }
            }
          }}
          onRemoveLocation={async (name) => {
            dispatch({ type: "removeLocation", name })

            if (state.mode === "account") {
              const affected = state.foods.filter(
                (f) => !f.deletedAt && !f.finishedAt && f.location === name,
              )

              for (const f of affected) {
                const idempKey = `idemp_${crypto.randomUUID()}`

                api

                  .updateEntry(
                    f.id,

                    {
                      storage_location: "unspecified",

                      expected_version: f.version ?? 1,
                    },

                    idempKey,
                  )

                  .catch(() => {})
              }
            }
          }}
          onSavePreferences={async (prefs) => {
            try {
              const key = `expiry_user_preferences_${state.userId || "demo"}`

              const curPrefs = JSON.parse(
                (typeof localStorage !== "undefined"
                  ? localStorage.getItem(key)
                  : null) || "{}",
              )

              if (typeof localStorage !== "undefined")
                localStorage.setItem(
                  key,

                  JSON.stringify({ ...curPrefs, ...prefs }),
                )
            } catch {}
          }}
          onOpenDetail={(id) => go({ name: "detail", id })}
          onAdd={() => go({ name: "scan" })}
        />
      )

      break

    case "attention":
      screenContent = (
        <Attention
          state={state}
          onBack={back}
          breadcrumbs={nestedBreadcrumbs}
          onOpenDetail={(id) => go({ name: "detail", id })}
          onNavigateInventory={() => tab({ name: "storage" })}
          onAdd={() => go({ name: "scan" })}
        />
      )

      break

    case "add":
    case "scan":
      screenContent = (
        <Scanner
          onBack={back}
          onManual={(draft, image) => {
            const shoppingDraft =
              route.name === "scan" ? route.shoppingDraft : undefined
            const nextRoute: Route = {
              name: "form",
              mode: draft && (draft.name || draft.barcode) ? "ocr" : "manual",
              draft: shoppingDraft
                ? {
                    ...shoppingDraft,
                    ...draft,
                    name: draft?.name || shoppingDraft.name,
                    quantity: shoppingDraft.quantity || draft?.quantity || "",
                    unit: shoppingDraft.unit || draft?.unit || "",
                    category: draft?.category || shoppingDraft.category,
                  }
                : draft || emptyDraft(),
              image,
              shoppingItemId:
                route.name === "scan" ? route.shoppingItemId : undefined,
            }
            reviewScan(nextRoute)
          }}
          existingFoods={state.foods}
          onReview={(image, draft) => {
            const shoppingDraft =
              route.name === "scan" ? route.shoppingDraft : undefined
            const nextRoute: Route = {
              name: "form",
              mode: "ocr",
              draft: shoppingDraft
                ? {
                    ...shoppingDraft,
                    ...draft,
                    name: draft?.name || shoppingDraft.name,
                    quantity: shoppingDraft.quantity || draft?.quantity || "",
                    unit: shoppingDraft.unit || draft?.unit || "",
                    category: draft?.category || shoppingDraft.category,
                  }
                : draft || emptyDraft(),
              image,
              shoppingItemId:
                route.name === "scan" ? route.shoppingItemId : undefined,
            }
            reviewScan(nextRoute)
          }}
        />
      )

      break

    case "form":
      screenContent = (
        <FoodForm
          key={stack.length}
          mode={route.mode}
          initial={route.draft}
          capturedImage={route.image}
          locations={state.locations}
          onAddLocation={(name) => dispatch({ type: "addLocation", name })}
          onSubmit={(d) => handleSaveDraft(d, route.mode, route.shoppingItemId)}
          onCancel={(dirty) => (dirty ? setDiscard(() => back) : back())}
          breadcrumbs={nestedBreadcrumbs}
          onDirtyChange={onFormDirty}
          restored={window.history.state?.formDraft}
        />
      )

      break

    case "detail":
      screenContent = (
        <Detail
          state={state}
          id={route.id}
          dispatch={dispatch}
          onEdit={(f) =>
            go({ name: "form", mode: "edit", draft: draftFrom(f) })
          }
          onBack={back}
          breadcrumbs={nestedBreadcrumbs}
          notify={notify}
        />
      )

      break

    case "insight":

    case "history":
      screenContent = (
        <InsightView
          state={state}
          dispatch={dispatch}
          isLive={state.mode === "account"}
          initialTab={route.name === "insight" ? route.tab : "history"}
          onTabChange={(t) => {
            const nextRoute: Route = { name: "insight", tab: t }

            navigateStack([nextRoute], true)
          }}
          onNavigateAttention={() => go({ name: "attention" })}
          onOpenDetail={(id) => go({ name: "detail", id })}
        />
      )

      break

    case "trash":
      screenContent = (
        <Trash
          state={state}
          dispatch={dispatch}
          onBack={
            stack.length > 1
              ? back
              : () => navigateStack([{ name: "settings", section: "data" }])
          }
          breadcrumbs={nestedBreadcrumbs}
          notify={notify}
        />
      )

      break

    case "settings":
      screenContent = (
        <Settings
          key={`${route.section ?? "root"}:${state.userId ?? "demo"}`}
          state={state}
          dispatch={dispatch}
          section={route.section}
          onNavigateSection={(section) => go({ name: "settings", section })}
          onBack={back}
          onNavigateHome={() =>
            requestSettingsLeave(() => {
              const nonSettingsParent = [...stack]
                .reverse()
                .find((item) => item.name !== "settings")
              if (nonSettingsParent && stack[0]?.name !== "settings") {
                const idx = stack.findIndex((item) => item.name === "settings")
                if (idx > 0) {
                  navigateStack(stack.slice(0, idx))
                  return
                }
              }
              tab({ name: "inventory" })
            })
          }
          onDirtyChange={handleSettingsDirty}
          onSavingChange={handleSettingsSaving}
          onSave={saveSettings}
          onNavigateTrash={() =>
            requestSettingsLeave(() => go({ name: "trash" }))
          }
          onLogin={() => setPendingAuth({ name: "settings" })}
          notify={notify}
        />
      )

      break

    case "shopping":
      screenContent = (
        <ShoppingView
          key={state.userId ?? state.mode}
          state={state}
          filter={route.filter ?? "all"}
          onFilterChange={(filter) =>
            navigateStack([{ name: "shopping", filter }], true)
          }
          onAddToInventory={(item: ShoppingItem, method) => {
            const draft: Draft = {
              ...emptyDraft(),
              name: item.name,
              quantity: item.quantity?.toString() ?? "",
              unit: (item.unit ?? "") as Draft["unit"],
              category: (item.category || "other") as Category,
            }
            if (method === "scan")
              go({
                name: "scan",
                shoppingItemId: item.id,
                shoppingDraft: draft,
              })
            else
              go({
                name: "form",
                mode: "manual",
                draft,
                shoppingItemId: item.id,
              })
          }}
          notify={notify}
        />
      )

      break
  }

  const isFullBleed = route.name === "scan" || route.name === "add"
  const showMobileDock = isRootRoute(route)
  const showPhoneAppBar = isRootRoute(route)
  // The dock padding only exists while the dock is shown; safe area always.
  const contentBottomPad = showMobileDock
    ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
    : "pb-[calc(1.5rem+env(safe-area-inset-bottom))]"

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-brand-tertiary text-text-primary antialiased">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden h-full md:block shrink-0">
        <SidebarNavigation
          isExpanded={isSidebarExpanded}
          onToggleExpanded={wideSidebar ? toggleSidebar : undefined}
          primaryAction={
            <button
              type="button"
              aria-label="Thêm thực phẩm"
              aria-current={isAddFlow ? "page" : undefined}
              title="Thêm thực phẩm"
              onClick={() => handleNav("scan")}
              className={`flex min-h-12 items-center justify-center rounded-corner-md bg-brand-primary text-white shadow-xs transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                isSidebarExpanded ? "w-full gap-3 px-3 text-left" : "size-12"
              }`}
            >
              <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
              {isSidebarExpanded ? (
                <span className="flex-1 truncate text-sm font-bold">
                  Thêm thực phẩm
                </span>
              ) : (
                <span className="sr-only">Thêm thực phẩm</span>
              )}
            </button>
          }
          footer={
            state.mode !== "account" ? (
              <SidebarButton
                icon={<LogIn size={20} />}
                aria-label="Đăng nhập"
                title="Đăng nhập"
                label="Đăng nhập"
                isExpanded={isSidebarExpanded}
                onClick={() => setPendingAuth({ name: "inventory" })}
              />
            ) : (
              <SidebarButton
                icon={<LogOut size={20} />}
                aria-label="Đăng xuất"
                title="Đăng xuất"
                label="Đăng xuất"
                isExpanded={isSidebarExpanded}
                onClick={() => dispatch({ type: "logout" })}
              />
            )
          }
        >
          <div className="flex w-full flex-col gap-1.5">
            {navItems.map((n) => (
              <SidebarButton
                key={n.r}
                icon={n.icon}
                aria-label={n.label}
                title={n.label}
                label={n.label}
                isExpanded={isSidebarExpanded}
                active={!isAddFlow && rootName === n.r}
                badge={n.badge}
                onClick={() => handleNav(n.r)}
              />
            ))}
          </div>

          <div className="flex w-full flex-col gap-1.5">
            {isSidebarExpanded ? (
              <div className="mt-3 border-t border-border-primary/60 px-3 pb-1 pt-4 text-xs font-semibold text-text-secondary">
                Hệ thống
              </div>
            ) : (
              <div
                role="separator"
                aria-hidden="true"
                className="my-2 h-px w-10 bg-border-primary/70"
              />
            )}
            <SidebarButton
              icon={<Bell size={20} />}
              aria-label={
                unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"
              }
              title="Thông báo"
              label="Thông báo"
              isExpanded={isSidebarExpanded}
              active={isNotificationsOpen || route.name === "notifications"}
              badge={unreadCount}
              onClick={() =>
                requestSettingsLeave(() => setIsNotificationsOpen((v) => !v))
              }
            />
            <SidebarButton
              icon={<SettingsIcon size={20} />}
              aria-label="Cài đặt"
              title="Cài đặt"
              label="Cài đặt"
              isExpanded={isSidebarExpanded}
              active={rootName === "settings"}
              onClick={() => handleNav("settings")}
            />
          </div>
        </SidebarNavigation>
      </div>

      {/* Main Content Area */}
      <main
        ref={mainRef}
        className={`h-full w-full min-w-0 flex-1 overflow-y-auto ${
          showMobileDock
            ? "scroll-pb-[var(--dock-clearance)] md:scroll-pb-3"
            : "scroll-pb-[env(safe-area-inset-bottom)] md:scroll-pb-3"
        }`}
      >
        <div
          className={`mx-auto w-full ${
            isFullBleed
              ? "h-full min-h-full flex flex-col md:max-w-[1120px] md:py-6 md:px-8 md:items-center md:justify-center"
              : route.name === "form"
                ? "max-w-2xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8 md:px-6 md:pt-6 md:pb-12"
                : route.name === "shopping"
                  ? `max-w-4xl px-4 pt-[max(1rem,env(safe-area-inset-top))] ${contentBottomPad} md:px-6 md:pt-6 md:pb-12`
                  : route.name === "settings"
                    ? `max-w-[960px] px-4 pt-[max(1rem,env(safe-area-inset-top))] ${contentBottomPad} md:px-8 md:pt-6 md:pb-12`
                    : route.name === "detail"
                      ? `max-w-[1440px] px-4 pt-[max(1rem,env(safe-area-inset-top))] ${contentBottomPad} md:px-8 md:pt-6 md:pb-12`
                      : route.name === "history"
                        ? `max-w-3xl px-4 pt-[max(1rem,env(safe-area-inset-top))] ${contentBottomPad} md:px-6 md:pt-6 md:pb-12`
                        : `max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] ${contentBottomPad} md:px-8 md:pt-6 md:pb-12`
          }`}
        >
          {problem === "write" && !isFullBleed && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-corner-md bg-status-expired-bg border border-status-expired/30 px-4 py-2.5 text-xs md:text-sm text-status-expired"
            >
              <CircleAlert size={16} aria-hidden="true" className="shrink-0" />
              <span>
                Không lưu được vào thiết bị. Thay đổi gần nhất có thể bị mất khi
                đóng ứng dụng.
              </span>
            </div>
          )}

          {showPhoneAppBar && (
            <div
              className={`mb-3 flex w-full items-center justify-between gap-3 text-xs text-text-secondary ${
                state.mode === "demo" ? "md:flex" : "md:hidden"
              }`}
            >
              {state.mode === "demo" ? (
                <>
                  <div className="flex min-w-0 shrink-0 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-corner-full bg-brand-accent/10 text-brand-primary">
                      <Leaf size={16} aria-hidden="true" />
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-medium text-text-secondary">
                      Dữ liệu mẫu
                      <span className="hidden sm:inline">
                        {" "}
                        · Chế độ xem thử
                      </span>
                    </span>
                  </div>
                  <Button
                    size="small"
                    variant="subtle"
                    className="min-w-0 shrink font-semibold text-brand-primary md:hidden"
                    aria-label="Đăng nhập để đồng bộ"
                    onClick={() => setPendingAuth({ name: "inventory" })}
                  >
                    Đăng nhập
                  </Button>
                </>
              ) : (
                <div />
              )}
              {/* Phone root App Bar actions: one cluster for every root route. */}
              {showPhoneAppBar && (
                <div className="ml-auto flex shrink-0 items-center gap-2 md:hidden">
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={
                        unreadCount
                          ? `Thông báo, ${unreadCount} chưa đọc`
                          : "Thông báo"
                      }
                      onPointerDown={() => void loadNotifications()}
                      onFocus={() => void loadNotifications()}
                      onClick={() => setIsNotificationsOpen(true)}
                      className="flex size-11 items-center justify-center rounded-[16px] text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary"
                    >
                      <Bell size={20} strokeWidth={2} />
                    </button>
                    {unreadCount > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1 right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-danger px-1 text-[12px] font-semibold text-white shadow-xs"
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Cài đặt"
                    title="Cài đặt"
                    onClick={() => go({ name: "settings" })}
                    className="flex size-11 items-center justify-center rounded-full bg-surface-soft border border-border-subtle text-text-primary hover:bg-surface-soft/80 transition-colors cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary"
                  >
                    <SettingsIcon size={20} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            ref={transitionRef}
            className={
              isFullBleed ? "h-full w-full min-w-0 md:h-auto" : "w-full min-w-0"
            }
          >
            <Suspense fallback={<RouteLoading />}>{screenContent}</Suspense>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar matching Figma node 309:217 & 312:136 */}
      {showMobileDock && (
        <nav
          aria-label="Điều hướng chính"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-surface-bg px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden shadow-xs"
        >
          <div className="mx-auto grid min-h-16 w-full max-w-lg grid-cols-[repeat(2,minmax(0,1fr))_auto_repeat(2,minmax(0,1fr))] items-center">
            {/* Tab 1: Hôm nay */}
            <button
              type="button"
              aria-label="Hôm nay"
              aria-current={rootName === "inventory" ? "page" : undefined}
              onClick={() => handleNav("inventory")}
              className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1 text-center cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <span
                className={`transition-colors ${
                  rootName === "inventory"
                    ? "text-brand-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Home size={24} strokeWidth={2} />
              </span>
              <span
                className={`text-[12px] leading-[18px] ${
                  rootName === "inventory"
                    ? "font-semibold text-brand-primary"
                    : "font-medium text-text-secondary"
                }`}
              >
                Hôm nay
              </span>
            </button>

            {/* Tab 2: Kho */}
            <button
              type="button"
              aria-label="Kho"
              aria-current={rootName === "storage" ? "page" : undefined}
              onClick={() => handleNav("storage")}
              className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1 text-center cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <span
                className={`transition-colors ${
                  rootName === "storage"
                    ? "text-brand-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Archive size={24} strokeWidth={2} />
              </span>
              <span
                className={`text-[12px] leading-[18px] ${
                  rootName === "storage"
                    ? "font-semibold text-brand-primary"
                    : "font-medium text-text-secondary"
                }`}
              >
                Kho
              </span>
            </button>

            {/* Center Action FAB (309:93): Add button */}
            <button
              type="button"
              aria-label="Thêm thực phẩm"
              title="Thêm thực phẩm"
              onClick={() => handleNav("scan")}
              className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-brand-primary text-white border border-brand-primary/20 shadow-xs transition-transform hover:bg-brand-hover active:scale-95 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>

            {/* Tab 4: Mua sắm */}
            <button
              type="button"
              aria-label="Mua sắm"
              aria-current={rootName === "shopping" ? "page" : undefined}
              onClick={() => handleNav("shopping")}
              className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1 text-center cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <span
                className={`transition-colors ${
                  rootName === "shopping"
                    ? "text-brand-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <ShoppingBag size={24} strokeWidth={2} />
              </span>
              <span
                className={`text-[12px] leading-[18px] ${
                  rootName === "shopping"
                    ? "font-semibold text-brand-primary"
                    : "font-medium text-text-secondary"
                }`}
              >
                Mua sắm
              </span>
            </button>

            {/* Tab 5: Thống kê */}
            <button
              type="button"
              aria-label="Thống kê"
              aria-current={rootName === "insight" ? "page" : undefined}
              onClick={() => handleNav("insight")}
              className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1 text-center cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <span
                className={`transition-colors ${
                  rootName === "insight"
                    ? "text-brand-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <BarChart3 size={24} strokeWidth={2} />
              </span>
              <span
                className={`text-[12px] leading-[18px] ${
                  rootName === "insight"
                    ? "font-semibold text-brand-primary"
                    : "font-medium text-text-secondary"
                }`}
              >
                Thống kê
              </span>
            </button>
          </div>
        </nav>
      )}

      {/* Toast notifications */}
      {toast && (
        <div
          className={`fixed inset-x-4 z-[70] mx-auto max-w-sm md:bottom-6 ${
            showMobileDock ? "bottom-20" : "bottom-6"
          }`}
          role="status"
        >
          <Toast
            message={toast.message}
            variant={toast.variant}
            open={toast.open}
            onDismiss={dismissToast}
            onExited={() => setToast(null)}
          />
        </div>
      )}

      {/* Discard confirmation modal */}
      <Modal
        isOpen={showSettingsLeavePrompt}
        onClose={() => {
          setShowSettingsLeavePrompt(false)
          pendingSettingsLeaveRef.current = null
        }}
        title="Bỏ thay đổi chưa lưu?"
        size="small"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowSettingsLeavePrompt(false)
                pendingSettingsLeaveRef.current = null
              }}
            >
              Ở lại
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const action = pendingSettingsLeaveRef.current
                pendingSettingsLeaveRef.current = null
                settingsDirtyRef.current = false
                setShowSettingsLeavePrompt(false)
                action?.()
              }}
            >
              Rời đi không lưu
            </Button>
          </>
        }
      />
      <Modal
        isOpen={!!discard}
        onClose={() => setDiscard(null)}
        title="Bỏ thông tin đang nhập?"
        size="small"
        footer={
          <>
            <Button variant="neutral" onClick={() => setDiscard(null)}>
              Tiếp tục nhập
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const entry = window.history.state
                if (entry?.formDraft)
                  window.history.replaceState(
                    { ...entry, formDraft: undefined },
                    "",
                  )
                discard?.()

                setDiscard(null)
              }}
            >
              Bỏ thay đổi
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          Những gì bạn vừa nhập vào mẫu sẽ không được lưu lại.
        </p>
      </Modal>

      {/* Notification Pop-up Modal */}
      {notificationsMounted && (
        <Suspense fallback={null}>
          <Notifications
            isOpen={showNotifications}
            onExited={() => setNotificationsMounted(false)}
            onClose={closeNotifications}
            state={state}
            dispatch={dispatch}
            onOpenDetail={(id) => {
              closeNotifications()
              go({ name: "detail", id })
            }}
            onOpenReminder={() => {
              setIsNotificationsOpen(false)
              go({ name: "attention" })
            }}
            notify={notify}
          />
        </Suspense>
      )}
    </div>
  )
}
