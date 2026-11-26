import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react"
import type { Dispatch, State } from "../store/appStore"
import { addDays, notifications, today } from "../store/appStore"
import EmptyState from "../components/ui/EmptyState"
import {
  DUR,
  EASE,
  gsap,
  isDesktopViewport,
  reducedMotion,
  useGSAP,
} from "../lib/motion"
import {
  ArrowRight,
  BellOff,
  Check,
  CheckCheck,
  CircleAlert,
  Clock3,
  HelpCircle,
  PackageOpen,
  X,
} from "lucide-react"

export function Notifications({
  isOpen = true,
  onExited,
  onClose,
  state,
  dispatch,
  onOpenDetail,
  onOpenReminder,
  onBack,
  notify,
  // Called after the exit tween finishes; the owner unmounts the panel then.
}: {
  isOpen?: boolean
  onExited?: () => void
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
  const overlayRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const onExitedRef = useRef(onExited)
  const entered = useRef(false)
  onCloseRef.current = handleClose
  onExitedRef.current = onExited

  useGSAP(
    () => {
      const scrim = scrimRef.current
      const panel = dialogRef.current
      if (!scrim || !panel) return
      const desktop = isDesktopViewport()
      if (isOpen) {
        entered.current = true
        if (reducedMotion()) return
        gsap.fromTo(scrim, { opacity: 0 }, {
          opacity: 1,
          duration: DUR.normal,
          ease: EASE.enter,
          overwrite: true,
          clearProps: "opacity",
        })
        // Phone: bottom sheet slides up. Web: popover fades in with a small
        // translateY. Rows are not animated: that only delays perceived completion.
        gsap.fromTo(
          panel,
          desktop ? { opacity: 0, y: -4 } : { yPercent: 100 },
          desktop
            ? {
                opacity: 1,
                y: 0,
                duration: DUR.normal,
                ease: EASE.enter,
                overwrite: true,
                clearProps: "opacity,transform",
              }
            : {
                yPercent: 0,
                duration: DUR.normal,
                ease: EASE.enter,
                overwrite: true,
                clearProps: "transform",
              },
        )
        return
      }
      if (!entered.current) return
      if (reducedMotion()) {
        onExitedRef.current?.()
        return
      }
      gsap.to(panel, {
        ...(desktop ? { opacity: 0, y: -4 } : { yPercent: 100 }),
        duration: DUR.normal,
        ease: EASE.exit,
        overwrite: true,
      })
      gsap.to(scrim, {
        opacity: 0,
        duration: DUR.normal,
        ease: EASE.exit,
        overwrite: true,
        onComplete: () => onExitedRef.current?.(),
      })
    },
    { scope: overlayRef, dependencies: [isOpen] },
  )

  // Phone drag-to-dismiss on the handle/header: gsap.set while dragging (no
  // tween per move), then close past 96px or 0.5px/ms, else spring back.
  const drag = useRef<{
    startY: number
    lastY: number
    lastT: number
    dy: number
    v: number
  } | null>(null)

  const onDragStart = (e: ReactPointerEvent<HTMLElement>) => {
    if (isDesktopViewport() || !isOpen) return
    if (e.pointerType === "mouse" && e.button !== 0) return
    if ((e.target as HTMLElement).closest("button")) return
    drag.current = {
      startY: e.clientY,
      lastY: e.clientY,
      lastT: e.timeStamp,
      dy: 0,
      v: 0,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onDragMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    const panel = dialogRef.current
    if (!d || !panel) return
    const dt = e.timeStamp - d.lastT
    if (dt > 0) d.v = 0.6 * ((e.clientY - d.lastY) / dt) + 0.4 * d.v
    d.lastY = e.clientY
    d.lastT = e.timeStamp
    d.dy = Math.max(0, e.clientY - d.startY)
    gsap.set(panel, { y: d.dy })
  }

  const onDragEnd = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    const panel = dialogRef.current
    drag.current = null
    if (!d || !panel) return
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (e.type !== "pointercancel" && (d.dy > 96 || d.v > 0.5)) {
      handleClose()
    } else if (reducedMotion()) {
      gsap.set(panel, { clearProps: "transform" })
    } else {
      gsap.to(panel, {
        y: 0,
        duration: DUR.fast,
        ease: EASE.enter,
        overwrite: true,
        clearProps: "transform",
      })
    }
  }

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

  // Without an owner to unmount it, a closed panel renders nothing.
  if (!isOpen && !onExited) return null

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
      ref={overlayRef}
      inert={!isOpen}
      className="notif-overlay fixed inset-0 z-50 md:flex md:items-start md:justify-end md:p-5"
      role="presentation"
    >
      <div
        ref={scrimRef}
        aria-hidden="true"
        className="absolute inset-0 bg-[var(--alpha-overlay-black-50)]"
        onClick={handleClose}
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-popup-title"
        tabIndex={-1}
        className="notif-panel outline-none absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-corner-lg border-t border-border-subtle bg-surface-bg text-text-primary shadow-2xl md:relative md:inset-x-auto md:bottom-auto md:max-h-[calc(100dvh-2rem)] md:w-full md:max-w-[420px] md:rounded-[20px] md:border"
      >
        <div
          className="shrink-0 touch-none md:touch-auto"
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <div
            className="flex justify-center pt-2 md:hidden"
            aria-hidden="true"
          >
            <span className="h-1 w-9 rounded-full bg-border-primary" />
          </div>
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
                  <span className="notification-action-label">Đọc hết</span>
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
        </div>

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
            <ul className="divide-y divide-border-subtle">
              {preview.map((n) => {
                const isRead = state.readNotifs.includes(n.id)
                const tone =
                  n.rule === "expired"
                    ? "text-status-expired"
                    : n.rule === "review"
                      ? "text-text-secondary"
                      : "text-status-soon"
                return (
                  <li
                    key={n.id}
                    className="notification-card flex min-h-16 items-center gap-3 px-4 py-3"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                        n.rule === "expired"
                          ? "bg-status-expired-bg text-status-expired"
                          : n.rule === "review"
                            ? "bg-bg-subtle text-text-secondary"
                            : "bg-status-soon-bg text-status-soon"
                      }`}
                    >
                      {n.rule === "expired" ? (
                        <CircleAlert size={16} />
                      ) : n.rule === "review" ? (
                        <HelpCircle size={16} />
                      ) : (
                        <Clock3 size={16} />
                      )}
                    </span>
                    <button
                      type="button"
                      aria-label={`Mở chi tiết ${n.food.name}`}
                      className="min-h-11 min-w-0 flex-1 rounded-corner-md text-left focus-visible:outline-2 focus-visible:outline-brand-primary"
                      onClick={() => {
                        dispatch({ type: "readNotif", id: n.id })
                        onOpenDetail(n.food.id)
                      }}
                    >
                      <span
                        className={`flex items-center gap-1.5 text-xs font-semibold ${tone}`}
                      >
                        {!isRead && (
                          <span
                            aria-hidden="true"
                            className="size-2 shrink-0 rounded-full bg-brand-primary"
                          />
                        )}
                        {n.title}
                      </span>
                      <span
                        className={`line-clamp-2 break-words text-sm ${
                          isRead
                            ? "font-normal text-text-secondary"
                            : "font-medium text-text-heading"
                        }`}
                      >
                        {n.message}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center">
                      {!isRead && (
                        <button
                          type="button"
                          className="notification-icon-action size-11"
                          aria-label={`Đánh dấu đã đọc: ${n.food.name}`}
                          title="Đánh dấu đã đọc"
                          onClick={() =>
                            dispatch({ type: "readNotif", id: n.id })
                          }
                        >
                          <Check size={16} aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="notification-icon-action size-11"
                        aria-label={`Nhắc lại ${n.food.name} vào ngày mai`}
                        title="Nhắc ngày mai"
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
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        {onOpenReminder && (
          <div className="shrink-0 border-t border-border-subtle px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onOpenReminder}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-corner-md px-4 text-sm font-semibold text-text-heading transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Xem tất cả món cần chú ý{" "}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Notifications
