import { useEffect, useRef } from "react"
import type { Dispatch, State } from "../store/appStore"
import { addDays, notifications, today } from "../store/appStore"
import EmptyState from "../components/ui/EmptyState"
import {
  ArrowRight,
  BellOff,
  Check,
  CheckCheck,
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
      if (e.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
          "button:not(:disabled)",
        )
        if (!controls?.length) {
          e.preventDefault()
          return
        }
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !dialogRef.current?.contains(document.activeElement) ||
            document.activeElement === dialogRef.current)
        ) {
          e.preventDefault()
          last.focus()
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !dialogRef.current?.contains(document.activeElement) ||
            document.activeElement === dialogRef.current)
        ) {
          e.preventDefault()
          first.focus()
        }
      }
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/15 sm:items-start sm:justify-end sm:p-5 animate-in fade-in"
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
        className="relative flex w-full max-w-[420px] flex-col overflow-hidden rounded-t-[20px] border border-border-subtle bg-surface-bg text-text-primary shadow-2xl max-h-[80dvh] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[20px] animate-in slide-in-from-bottom-2 sm:slide-in-from-right-2 duration-200"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <h2
              id="notifications-popup-title"
              className="truncate text-base font-semibold text-text-heading"
            >
              Thông báo
            </h2>
            {unreadCount > 0 && (
              <span className="shrink-0 text-xs font-medium text-text-secondary">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="notification-icon-action flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-corner-md px-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-brand-primary"
                aria-label="Đánh dấu tất cả thông báo là đã đọc"
              >
                <CheckCheck size={16} aria-hidden="true" />
                <span className="notification-tooltip">
                  Đánh dấu tất cả đã đọc
                </span>
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

        <div className="min-h-0 overflow-y-auto overscroll-contain">
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
                <article
                  key={n.id}
                  className="flex items-center gap-1 border-l-2 border-l-brand-primary/50 px-3 py-3"
                >
                  <button
                    type="button"
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-corner-sm text-left text-sm leading-5 text-text-heading hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-brand-primary"
                    onClick={() => {
                      dispatch({ type: "readNotif", id: n.id })
                      onOpenDetail(n.food.id)
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-8 shrink-0 items-center justify-center rounded-corner-md ${
                        n.rule === "expired"
                          ? "bg-status-expired-bg text-status-expired"
                          : n.rule === "review"
                            ? "bg-bg-subtle text-text-secondary"
                            : "bg-status-soon-bg text-status-soon"
                      }`}
                    >
                      {n.rule === "expired" ? (
                        <CircleAlert size={17} />
                      ) : n.rule === "review" ? (
                        <HelpCircle size={17} />
                      ) : (
                        <Clock3 size={17} />
                      )}
                    </span>
                    <span className="min-w-0 break-words font-medium">
                      {n.message}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      className="notification-icon-action"
                      aria-label={`Đánh dấu đã đọc: ${n.food.name}`}
                      onClick={() => dispatch({ type: "readNotif", id: n.id })}
                    >
                      <Check size={17} aria-hidden="true" />
                      <span className="notification-tooltip">
                        Đánh dấu đã đọc
                      </span>
                    </button>
                    <button
                      type="button"
                      className="notification-icon-action"
                      aria-label={`Nhắc lại ${n.food.name} vào ngày mai`}
                      onClick={() => {
                        dispatch({
                          type: "snooze",
                          id: n.id,
                          until: addDays(today(), 1),
                        })
                        notify("Sẽ nhắc lại vào ngày mai")
                      }}
                    >
                      <Clock3 size={16} aria-hidden="true" />
                      <span className="notification-tooltip">
                        Nhắc ngày mai
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        {onOpenReminder && (
          <div className="shrink-0 border-t border-border-subtle px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onOpenReminder}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-corner-md px-4 text-sm font-semibold text-text-heading transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Xem tất cả nhắc nhở <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Notifications
