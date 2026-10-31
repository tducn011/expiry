import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"

import { api, ApiError, decimal, type EditEntryDTO } from "./api/client"

import {
  attention,
  notifications,
  useAppStore,
  type Category,
  type Food,
  type State,
  type Unit,
} from "./store/appStore"

import {
  emptyDraft,
  draftFrom,
  type Draft,
  type FormMode,
} from "./features/FoodForm"

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
} from "./components/ui/Icon"

import Button from "./components/ui/Button"

import Card from "./components/ui/Card"

import Modal from "./components/ui/Modal"

import Toast, { type ToastProps } from "./components/ui/Toast"

import {
  SidebarButton,
  SidebarNavigation,
} from "./components/ui/SidebarNavigation"

// Feature screens

import Inventory from "./features/Inventory"

import Attention from "./features/Attention"

import StorageView from "./features/StorageView"

import AddEntry from "./features/AddEntry"

import Scanner from "./features/Scanner"

import FoodForm from "./features/FoodForm"

import Detail from "./features/Detail"

import History from "./features/History"

import InsightView from "./features/InsightView"

import Trash from "./features/Trash"

import Notifications from "./features/Notifications"

import Settings from "./features/Settings"

import AuthForm from "./features/AuthForm"

import Onboarding from "./features/Onboarding"

export type Route = { name: "inventory" } | {
  name: "storage"

  location?: string

  category?: string
} | { name: "attention" } | { name: "add" } | { name: "scan" } | {
  name: "form"

  mode: FormMode

  draft: Draft

  image?: string
} | {
  name: "detail"

  id: string
} | {
  name: "insight"

  tab?: string
} | { name: "history" } | {
  name: "trash"
} | { name: "notifications" } | { name: "settings" }

export function routeFromUrl(
  search = typeof window !== "undefined" ? window.location.search : "",
): Route[] {
  const q = new URLSearchParams(search)

  const v = q.get("view")

  const id = q.get("id")

  if (id) return [{ name: "inventory" }, { name: "detail", id }]

  if (v === "storage" || v === "attention") {
    const loc = q.get("loc") || undefined

    const cat = q.get("cat") || undefined

    return [{ name: "storage", location: loc, category: cat }]
  }

  if (v === "insight" || v === "history") {
    const tab = q.get("tab") || undefined

    return [{ name: "insight", tab }]
  }

  if (v === "trash") return [{ name: "trash" }]

  if (v === "settings") return [{ name: "settings" }]

  if (v === "add") return [{ name: "add" }]

  if (v === "scan") return [{ name: "scan" }]

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
  }

  return `?${p.toString()}`
}

export default function App({ demoMode = false }: { demoMode?: boolean } = {}) {
  const { state, dispatch, problem, retry, reset } = useAppStore()
  const [syncError, setSyncError] = useState<string | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(!demoMode)
  const sessionGenRef = useRef(0)

  // 1. Initial Session Verification on mount
  useEffect(() => {
    if (demoMode) {
      setIsCheckingSession(false)
      return
    }

    let isMounted = true
    const gen = ++sessionGenRef.current
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
        if (!isMounted || sessionGenRef.current !== gen) return
        setSyncError(null)

        if (s.user) {
          dispatch({
            type: "login",
            mode: "account",
            name: s.user.display_name || s.user.email.split("@")[0],
            userId: s.user.id,
          })
        } else {
          if (state.mode === "account") {
            dispatch({ type: "logout" })
          }
        }
      })
      .catch((err) => {
        if (!isMounted || sessionGenRef.current !== gen) return

        if (err instanceof ApiError && err.status === 401) {
          if (state.mode === "account") {
            dispatch({ type: "logout" })
          }
        } else {
          setSyncError(
            "Không thể kết nối máy chủ backend. Đang dùng dữ liệu lưu tạm.",
          )
        }
      })
      .finally(() => {
        if (isMounted && sessionGenRef.current === gen) {
          setIsCheckingSession(false)
        }
      })

    return () => {
      isMounted = false
      sessionGenRef.current++
    }
  }, [demoMode, dispatch])

  // 2. Hydrate Account Inventory when verified userId is established
  useEffect(() => {
    if (demoMode || !state.userId || state.mode !== "account") return

    let isMounted = true
    const gen = ++sessionGenRef.current
    const activeUserId = state.userId

    api
      .entries({ limit: 100 })
      .then((page) => {
        if (
          !isMounted ||
          sessionGenRef.current !== gen ||
          state.userId !== activeUserId
        )
          return

        for (const item of page.items) {
          if (
            !isMounted ||
            sessionGenRef.current !== gen ||
            state.userId !== activeUserId
          )
            return
          dispatch({
            type: "save",
            food: {
              id: item.id,
              name: item.name,
              quantity: item.remaining_quantity,
              unit: (item.unit === "piece" ? "cái" : item.unit) as Unit,
              category: item.category as Category || undefined,
              location: item.storage_location || undefined,
              expDate: item.expiry_date || undefined,
              mfgDate: item.opened_on || undefined,
              finishedAt:
                item.remaining_quantity === 0 ? item.updated_at : undefined,
              version: item.version,
            },
          })

          if (
            item.storage_location &&
            item.storage_location !== "unspecified" &&
            !state.locations.includes(item.storage_location)
          ) {
            dispatch({ type: "addLocation", name: item.storage_location })
          }
        }
      })
      .catch(() => {
        if (
          isMounted &&
          sessionGenRef.current === gen &&
          state.userId === activeUserId
        ) {
          setSyncError("Không thể tải đầy đủ danh mục thực phẩm từ máy chủ.")
        }
      })

    api
      .preferences()
      .then((prefs) => {
        if (
          !isMounted ||
          sessionGenRef.current !== gen ||
          state.userId !== activeUserId
        )
          return
        if (prefs && prefs.attention_lead_days) {
          dispatch({
            type: "settings",
            settings: {
              ...state.settings,
              remindDays: prefs.attention_lead_days,
            },
          })
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
      sessionGenRef.current++
    }
  }, [demoMode, dispatch, state.userId, state.mode])

  const [confirmReset, setConfirmReset] = useState(false)

  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem("expiry_sidebar_expanded") === "true"
    } catch {
      return false
    }
  })

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => {
      const next = !prev

      try {
        localStorage.setItem("expiry_sidebar_expanded", String(next))
      } catch {}

      return next
    })
  }

  const [stack, setStack] = useState<Route[]>(() => routeFromUrl())

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current = stack[stack.length - 1] || { name: "inventory" }

      window.history.replaceState({ stack }, "", urlFromRoute(current))
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handlePopState = (event: PopStateEvent) => {
      if (
        event.state &&
        Array.isArray(event.state.stack) &&
        event.state.stack.length > 0
      ) {
        setStack(event.state.stack)
      } else {
        setStack(routeFromUrl())
      }
    }

    window.addEventListener("popstate", handlePopState)

    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const [toast, setToast] = useState<{
    message: string

    variant?: ToastProps["variant"]
  } | null>(null)

  const [discard, setDiscard] = useState<null | (() => void)>(null)

  const [pendingAuth, setPendingAuth] = useState<Route | null>(null)

  const route = stack[stack.length - 1] || { name: "inventory" }

  const go = (r: Route) => {
    setStack((s) => {
      const next = [...s, r]

      if (typeof window !== "undefined") {
        window.history.pushState({ stack: next }, "", urlFromRoute(r))
      }

      return next
    })
  }

  const tab = (r: Route) => {
    setStack(() => {
      const next = [r]

      if (typeof window !== "undefined") {
        window.history.pushState({ stack: next }, "", urlFromRoute(r))
      }

      return next
    })
  }

  const back = () => {
    setStack((s) => {
      if (s.length > 1) {
        const next = s.slice(0, -1)

        const current = next[next.length - 1]

        if (typeof window !== "undefined") {
          window.history.pushState({ stack: next }, "", urlFromRoute(current))
        }

        return next
      }

      return s
    })
  }

  const notify = (
    message: string,

    variant: ToastProps["variant"] = "success",
  ) => {
    setToast({ message, variant })

    setTimeout(() => setToast(null), 3200)
  }

  // Handle unreadable storage error recovery

  if (problem === "read") {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 bg-brand-tertiary">
        <Card
          className="flex w-full max-w-md flex-col gap-5 shadow-lg"
          role="alert"
        >
          <CircleAlert
            size={36}
            aria-hidden="true"
            className="text-status-expired"
          />
          <h1 className="text-xl font-bold text-text-primary">
            Không đọc được dữ liệu
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
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
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
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
      <AuthForm dispatch={dispatch} onCancel={() => setPendingAuth(null)} />
    )
  }

  // Onboarding flow

  if (state.mode === "account" && !state.onboarded) {
    return <Onboarding onDone={() => dispatch({ type: "onboarded" })} />
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
    { r: "inventory", label: "Thực phẩm", icon: <Home size={22} /> },

    {
      r: "storage",

      label: "Lưu trữ",

      icon: <Archive size={22} />,

      badge: attnCount,
    },

    { r: "add", label: "Thêm", icon: <Plus size={22} /> },

    { r: "insight", label: "Insight", icon: <BarChart3 size={22} /> },

    { r: "settings", label: "Cài đặt", icon: <SettingsIcon size={22} /> },
  ]

  const isAddFlow =
    route.name === "add" ||
    route.name === "scan" ||
    (route.name === "form" && route.mode !== "edit")

  const rootName = isAddFlow
    ? "add"
    : route.name === "detail"
      ? stack[0]?.name || "inventory"
      : route.name

  function toBackendUnitAndQty(quantity: number, unit: string): {
    quantity: number

    unit: "piece" | "g" | "ml"
  } {
    if (unit === "kg") return { quantity: quantity * 1000, unit: "g" }

    if (unit === "lít") return { quantity: quantity * 1000, unit: "ml" }

    if (unit === "g") return { quantity, unit: "g" }

    if (unit === "ml") return { quantity, unit: "ml" }

    return { quantity, unit: "piece" }
  }

  async function handleSaveDraft(d: Draft, mode: FormMode) {
    if (state.mode === "account") {
      const idempotencyKey = `idemp_${crypto.randomUUID()}`

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

              expDate: updated.expiry_date || undefined,

              location: updated.storage_location || undefined,

              finishedAt:
                updated.remaining_quantity === 0
                  ? new Date().toISOString()
                  : undefined,

              version: updated.version,
            },
          })

          notify("Đã lưu thay đổi")

          setStack([{ name: "inventory" }])

          return
        } catch (err: unknown) {
          if (err instanceof ApiError && err.code === "VERSION_CONFLICT") {
            notify(
              "Xung đột phiên bản: Dữ liệu đã thay đổi ở nơi khác. Vui lòng tải lại.",
            )
          } else {
            notify("Lỗi kết nối máy chủ. Không thể lưu thay đổi.")
          }

          return
        }
      } else {
        try {
          const rawQty = Number(d.quantity) || 1

          const { quantity, unit } = toBackendUnitAndQty(
            rawQty,

            d.unit || "cái",
          )

          const created = await api.createEntry(
            {
              name: d.name.trim(),

              storage_location: d.location?.trim() || "unspecified",

              expiry_date: d.expDate || null,

              date_certainty: d.expDate ? "known" : "unknown",

              date_source: d.expDate ? "printed_label" : "unknown",

              date_label_type: "unspecified",

              opened_on: d.mfgDate || null,

              note: null,

              quantity: decimal(quantity),

              unit,
            },

            idempotencyKey,
          )

          dispatch({
            type: "save",

            food: {
              id: created.id,

              name: created.name,

              quantity: Number(d.quantity),

              unit: (d.unit || "cái") as Unit,

              category: d.category || "other",

              mfgDate: d.mfgDate || undefined,

              expDate: created.expiry_date || undefined,

              location: created.storage_location || undefined,

              finishedAt: undefined,

              version: created.version,
            },
          })

          notify(
            d.expDate
              ? `Đã lưu ${d.name.trim()}`
              : `Đã lưu ${d.name.trim()} — chưa rõ HSD`,
          )

          setStack([{ name: "inventory" }])

          return
        } catch {
          notify("Lỗi kết nối máy chủ. Không thể tạo thực phẩm.")

          return
        }
      }
    }

    dispatch({
      type: "save",

      food: {
        id: mode === "edit" ? d.id : undefined,

        name: d.name.trim(),

        quantity: Number(d.quantity),

        unit: d.unit || "cái",

        category: d.category || "other",

        mfgDate: d.mfgDate || undefined,

        expDate: d.expDate || undefined,

        location: d.location || undefined,

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

    setStack([{ name: "inventory" }])
  }

  let screenContent: ReactNode

  switch (route.name) {
    case "inventory":
      screenContent = (
        <Inventory
          state={state}
          onOpenDetail={(id) => go({ name: "detail", id })}
          onAdd={() => go({ name: "add" })}
          onNavigateAttention={() => tab({ name: "storage" })}
          onOpenNotifications={() => go({ name: "notifications" })}
          unreadNotificationsCount={unreadCount}
        />
      )

      break

    case "storage":

    case "attention":
      screenContent = (
        <StorageView
          state={state}
          dispatch={dispatch}
          isLive={state.mode === "account"}
          initialLocation={
            route.name === "storage" ? route.location : undefined
          }
          initialCategory={
            route.name === "storage"
              ? route.category as Category | "all" | undefined
              : undefined
          }
          onFilterChange={(loc, cat) => {
            const nextRoute: Route = {
              name: "storage",

              location: loc !== "all" ? loc : undefined,

              category: cat !== "all" ? cat : undefined,
            }

            if (typeof window !== "undefined") {
              window.history.replaceState(
                { stack: [nextRoute] },

                "",

                urlFromRoute(nextRoute),
              )
            }
          }}
          onAddLocation={async (name) => {
            dispatch({ type: "addLocation", name })

            if (state.mode === "account") {
              try {
                const curPrefs = JSON.parse(
                  (typeof localStorage !== "undefined"
                    ? localStorage.getItem("expiry_user_preferences")
                    : null) || "{}",
                )

                const locs = Array.from(
                  new Set([...(curPrefs.locations || state.locations), name]),
                )

                if (typeof localStorage !== "undefined")
                  localStorage.setItem(
                    "expiry_user_preferences",

                    JSON.stringify({ ...curPrefs, locations: locs }),
                  )
              } catch {}
            }
          }}
          onSavePreferences={async (prefs) => {
            try {
              const curPrefs = JSON.parse(
                (typeof localStorage !== "undefined"
                  ? localStorage.getItem("expiry_user_preferences")
                  : null) || "{}",
              )

              if (typeof localStorage !== "undefined")
                localStorage.setItem(
                  "expiry_user_preferences",

                  JSON.stringify({ ...curPrefs, ...prefs }),
                )
            } catch {}
          }}
          onOpenDetail={(id) => go({ name: "detail", id })}
          onAdd={() => go({ name: "add" })}
        />
      )

      break

    case "add":
      screenContent = (
        <AddEntry
          onScan={() => go({ name: "scan" })}
          onManual={() =>
            go({ name: "form", mode: "manual", draft: emptyDraft() })
          }
          onBack={back}
        />
      )

      break

    case "scan":
      screenContent = (
        <Scanner
          onBack={back}
          onManual={() =>
            setStack((s) => [
              ...s.slice(0, -1),

              { name: "form", mode: "manual", draft: emptyDraft() },
            ])
          }
          onReview={(image, draft) =>
            setStack((s) => [
              ...s.slice(0, -1),

              {
                name: "form",

                mode: "ocr",

                draft: draft || emptyDraft(),

                image,
              },
            ])
          }
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
          onSubmit={(d) => handleSaveDraft(d, route.mode)}
          onCancel={(dirty) => (dirty ? setDiscard(() => back) : back())}
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

            if (typeof window !== "undefined") {
              window.history.replaceState(
                { stack: [nextRoute] },

                "",

                urlFromRoute(nextRoute),
              )
            }
          }}
          onOpenDetail={(id) => go({ name: "detail", id })}
        />
      )

      break

    case "trash":
      screenContent = (
        <Trash
          state={state}
          dispatch={dispatch}
          onBack={back}
          notify={notify}
        />
      )

      break

    case "notifications":
      screenContent = (
        <Notifications
          state={state}
          dispatch={dispatch}
          onOpenDetail={(id) => go({ name: "detail", id })}
          onBack={back}
          notify={notify}
        />
      )

      break

    case "settings":
      screenContent = (
        <Settings
          state={state}
          dispatch={dispatch}
          onNavigateTrash={() => go({ name: "trash" })}
          onLogin={() => setPendingAuth({ name: "settings" })}
          notify={notify}
        />
      )

      break
  }

  const isFullBleed = route.name === "scan"

  return (
    <div className="flex min-h-dvh bg-brand-tertiary text-text-primary antialiased">
      {/* Desktop Sidebar Navigation */}
      <div className="sticky top-0 hidden h-dvh md:block shrink-0">
        <SidebarNavigation
          isExpanded={isSidebarExpanded}
          onToggleExpanded={toggleSidebar}
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
          {navItems.map((n) => (
            <SidebarButton
              key={n.r}
              icon={n.icon}
              aria-label={n.label}
              title={n.label}
              label={n.label}
              isExpanded={isSidebarExpanded}
              active={rootName === n.r}
              badge={n.badge}
              onClick={() => tab({ name: n.r } as Route)}
            />
          ))}
          <SidebarButton
            icon={<Bell size={22} />}
            aria-label={
              unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"
            }
            title="Thông báo"
            label="Thông báo"
            isExpanded={isSidebarExpanded}
            active={rootName === "notifications"}
            badge={unreadCount}
            onClick={() => tab({ name: "notifications" })}
          />
        </SidebarNavigation>
      </div>

      {/* Main Content Area */}
      <main
        className={`mx-auto w-full min-w-0 flex-1 transition-all ${
          isFullBleed
            ? "md:max-w-4xl md:p-6"
            : route.name === "form"
              ? "max-w-5xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8 md:px-8 md:pt-6 md:pb-12"
              : "max-w-7xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-8 md:pt-6 md:pb-12"
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

        {syncError && !isFullBleed && (
          <div
            className="mb-4 flex items-center justify-between gap-3 rounded-corner-md border border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/30 px-3.5 py-2 text-xs text-amber-800 dark:text-amber-200 shadow-xs"
            role="alert"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-medium">⚠️ {syncError}</span>
            </div>
            <button
              type="button"
              className="shrink-0 font-semibold underline hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        )}

        {state.mode === "demo" && !isFullBleed && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-corner-md border border-border-primary/60 bg-surface-bg px-3.5 py-1.5 text-xs shadow-xs">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-corner-full bg-brand-accent text-brand-primary">
                <Leaf size={14} aria-hidden="true" />
              </span>
              <span className="truncate font-medium text-text-secondary">
                Dữ liệu mẫu (chế độ xem thử)
              </span>
            </div>
            <Button
              size="small"
              variant="subtle"
              className="shrink-0 font-semibold text-brand-primary"
              onClick={() => setPendingAuth({ name: "inventory" })}
            >
              Đăng nhập
            </Button>
          </div>
        )}

        {screenContent}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isFullBleed && route.name !== "form" && (
        <nav
          aria-label="Điều hướng chính"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border-primary/60 bg-surface-bg/95 backdrop-blur-md px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden shadow-lg"
        >
          <div className="grid grid-cols-5 w-full">
            {navItems.map((n) => {
              const activeTab = rootName === n.r

              return (
                <button
                  key={n.r}
                  type="button"
                  aria-label={n.badge ? `${n.label}, ${n.badge} mục` : n.label}
                  aria-current={activeTab ? "page" : undefined}
                  onClick={() => tab({ name: n.r } as Route)}
                  className="relative flex min-h-14 w-full flex-col items-center justify-center px-0.5 py-1 text-center transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary cursor-pointer"
                >
                  <span
                    className={`relative flex h-7 w-12 items-center justify-center rounded-corner-full transition-all ${
                      activeTab
                        ? "bg-brand-primary text-white shadow-xs"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {n.icon}
                    {!!n.badge && n.badge > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-xs"
                      >
                        {n.badge}
                      </span>
                    )}
                  </span>
                  <span
                    className={`mt-1 block w-full truncate text-[10px] sm:text-[11px] leading-tight text-center ${
                      activeTab
                        ? "font-bold text-brand-primary"
                        : "text-text-secondary font-medium"
                    }`}
                  >
                    {n.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      {/* Toast notifications */}
      {toast && (
        <div
          className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm md:bottom-6"
          role="status"
        >
          <Toast
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}

      {/* Discard confirmation modal */}
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
    </div>
  )
}
