import { useEffect, useMemo, useState, type ReactNode } from "react"
import { api } from "./api/client"
import {
  attention,
  notifications,
  useAppStore,
  type Food,
  type State,
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

export type Route = { name: "inventory" } | { name: "storage" } | {
  name: "attention"
} | {
  name: "add"
} | { name: "scan" } | {
  name: "form"
  mode: FormMode
  draft: Draft
  image?: string
} | {
  name: "detail"
  id: string
} | { name: "insight" } | { name: "history" } | { name: "trash" } | {
  name: "notifications"
} | { name: "settings" }

export default function App({ demoMode = false }: { demoMode?: boolean } = {}) {
  const { state, dispatch, problem, retry, reset } = useAppStore()

  useEffect(() => {
    if (demoMode) return
    api
      .session()
      .then((s) => {
        if (s.user) {
          dispatch({
            type: "login",
            mode: "account",
            name: s.user.display_name || s.user.email.split("@")[0],
          })
        }
      })
      .catch(() => {
        // No active server session; retain client mode
      })
  }, [demoMode, dispatch])
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
  const [stack, setStack] = useState<Route[]>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search)
      const v = q.get("view")
      const id = q.get("id")
      if (id) return [{ name: "inventory" }, { name: "detail", id }]
      if (v === "storage" || v === "attention") return [{ name: "storage" }]
      if (v === "insight" || v === "history") return [{ name: "insight" }]
      if (v === "trash") return [{ name: "trash" }]
      if (v === "settings") return [{ name: "settings" }]
    }
    return [{ name: "inventory" }]
  })

  const [toast, setToast] = useState<{
    message: string
    variant?: ToastProps["variant"]
  } | null>(null)
  const [discard, setDiscard] = useState<null | (() => void)>(null)
  const [pendingAuth, setPendingAuth] = useState<Route | null>(null)

  const route = stack[stack.length - 1] || { name: "inventory" }

  const go = (r: Route) => setStack((s) => [...s, r])
  const tab = (r: Route) => setStack([r])
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))

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

  const rootName = isAddFlow ? "add" : stack[0].name

  async function handleSaveDraft(d: Draft, mode: FormMode) {
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
          onReview={(image) =>
            setStack((s) => [
              ...s.slice(0, -1),
              { name: "form", mode: "ocr", draft: emptyDraft(), image },
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
