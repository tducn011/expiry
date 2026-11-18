import { useEffect, useRef } from "react"
import type { Dispatch, State } from "../store/appStore"
import { addDays, notifications, today } from "../store/appStore"
import EmptyState from "../components/ui/EmptyState"
import {
  ArrowRight,
  BellOff,
  Check,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  Clock3,
  HelpCircle,
  X,
} from "lucide-react"

export function Notifications({
  isOpen = true,
  onClose,
  state,
  dispatch,
  onOpenDetail,
  onOpenReminder,
  onBack,
  notify,
}: {
  isOpen?: boolean
  onClose?: () => void
  state: State
  dispatch: Dispatch
  onOpenDetail: (id: string) => void
  onOpenReminder?: () => void
  onBack?: () => void
  notify: (m: string) => void
}) {
  const handleClose = onClose || onBack || (() => {})
  const onCloseRef = useRef(handleClose)
  const dialogRef = useRef<HTMLElement>(null)
  onCloseRef.current = handleClose

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onCloseRef.current()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKeyDown)
      previousFocus?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const list = notifications(state)
  const unread = list.filter((n) => !state.readNotifs.includes(n.id))
  const unreadCount = unread.length
  const preview = unread.slice(0, 3)

  const handleMarkAllRead = () => {
    const unread = list.filter((n) => !state.readNotifs.includes(n.id))
    for (const n of unread) {
      dispatch({ type: "readNotif", id: n.id })
    }
    notify("Đã đánh dấu tất cả thông báo là đã đọc")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-xs sm:items-start sm:justify-end sm:p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
      role="presentation"
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-popup-title"
        tabIndex={-1}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-t-[20px] border border-border-primary bg-surface-bg text-text-primary shadow-2xl max-h-[80dvh] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[20px] animate-in slide-in-from-bottom-2 sm:slide-in-from-right-2 duration-200"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2
              id="notifications-popup-title"
              className="truncate text-lg font-semibold text-text-heading"
            >
              Thông báo
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex shrink-0 items-center rounded-corner-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-strong">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-corner-md px-2 text-xs font-semibold text-brand-strong transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-brand-primary"
                aria-label="Đánh dấu tất cả thông báo là đã đọc"
              >
                <CheckCheck size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Đã đọc hết</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Đóng thông báo"
              className="flex size-11 items-center justify-center rounded-corner-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-heading focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="min-h-32 flex-1 overflow-y-auto">
          {unreadCount === 0 ? (
            <EmptyState
              icon={<BellOff size={32} />}
              title={
                state.settings.inApp
                  ? "Không có thông báo mới"
                  : "Nhắc nhở trong ứng dụng đang tắt"
              }
            />
          ) : (
            <div className="divide-y divide-border-subtle">
              {preview.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-corner-md ${
                      n.rule === "expired"
                        ? "bg-status-expired-bg text-status-expired"
                        : n.rule === "review"
                          ? "bg-bg-subtle text-text-secondary"
                          : "bg-status-soon-bg text-status-soon"
                    }`}
                  >
                    {n.rule === "expired" ? (
                      <CircleAlert size={18} />
                    ) : n.rule === "review" ? (
                      <HelpCircle size={18} />
                    ) : (
                      <Clock3 size={18} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-start justify-between gap-2 text-left text-sm font-medium leading-snug text-text-heading hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-brand-primary"
                      onClick={() => {
                        dispatch({ type: "readNotif", id: n.id })
                        onOpenDetail(n.food.id)
                      }}
                    >
                      <span>{n.message}</span>
                      <ChevronRight
                        size={16}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                    </button>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-brand-strong hover:underline focus-visible:outline-2 focus-visible:outline-brand-primary"
                        onClick={() =>
                          dispatch({ type: "readNotif", id: n.id })
                        }
                        aria-label={`Đánh dấu đã đọc: ${n.food.name}`}
                      >
                        <Check size={14} aria-hidden="true" /> Đã đọc
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-heading hover:underline focus-visible:outline-2 focus-visible:outline-brand-primary"
                        onClick={() => {
                          dispatch({
                            type: "snooze",
                            id: n.id,
                            until: addDays(today(), 1),
                          })
                          notify("Sẽ nhắc lại vào ngày mai")
                        }}
                        aria-label={`Nhắc lại ${n.food.name} vào ngày mai`}
                      >
                        <Clock3 size={14} aria-hidden="true" /> Nhắc mai
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {onOpenReminder && (
          <div className="shrink-0 border-t border-border-subtle p-4">
            <button
              type="button"
              onClick={onOpenReminder}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-corner-md bg-brand-primary px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Mở Nhắc nhở <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Notifications
