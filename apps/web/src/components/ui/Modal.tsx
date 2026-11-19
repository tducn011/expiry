import { useEffect, useId, useRef, useState, type ReactNode } from "react"

import Button from "./Button"

import { X } from "lucide-react"

let foregroundModalCount = 0

let previousBodyOverflow = ""

function acquireModalScrollLock() {
  if (foregroundModalCount === 0) {
    previousBodyOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"
  }

  foregroundModalCount += 1

  return () => {
    foregroundModalCount = Math.max(0, foregroundModalCount - 1)

    if (foregroundModalCount === 0) {
      document.body.style.overflow = previousBodyOverflow
    }
  }
}

export interface ModalProps {
  isOpen?: boolean

  active?: boolean

  eyebrow?: string

  title: string

  description?: string

  onClose: () => void

  footer?: ReactNode

  children?: ReactNode

  size?: "small" | "compact" | "regular" | "wide"

  layout?: "flow" | "form" | "list"

  dismissible?: boolean
}

export function Modal(props: ModalProps) {
  return props.isOpen === false ? null : <OpenModal {...props} />
}

const openDialogs: HTMLElement[] = []

function OpenModal({
  active = true,

  eyebrow,

  title,

  description,

  onClose,

  footer,

  children,

  size = "regular",

  layout = "flow",

  dismissible = true,
}: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLElement>(null)

  const [opener] = useState(() =>
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  )

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const dismissibleRef = useRef(dismissible)
  dismissibleRef.current = dismissible

  useEffect(() => {
    if (!active) return

    const dialog = dialogRef.current

    if (!dialog) return

    const releaseScrollLock = acquireModalScrollLock()
    openDialogs.push(dialog)
    const controls = () =>
      [
        ...dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length > 0)
    const first = controls()[0] ?? dialog
    first.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (openDialogs.at(-1) !== dialog) return
      if (e.key === "Tab") {
        const focusable = controls()
        const target = document.activeElement
        const first = focusable[0] ?? dialog
        const last = focusable.at(-1) ?? dialog
        if (
          !focusable.length ||
          target === dialog ||
          !dialog.contains(target) ||
          (e.shiftKey ? target === first : target === last)
        ) {
          e.preventDefault()
          const next = e.shiftKey ? last : first
          next.focus()
        }
      }
      if (e.key === "Escape" && dismissibleRef.current) {
        e.stopPropagation()

        onCloseRef.current()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      const index = openDialogs.indexOf(dialog)
      if (index >= 0) openDialogs.splice(index, 1)
      releaseScrollLock()

      window.removeEventListener("keydown", onKeyDown)
    }
  }, [active])

  // Return focus to opener ONLY when Modal unmounts
  useEffect(() => {
    return () => {
      if (
        opener &&
        typeof document !== "undefined" &&
        document.contains(opener)
      ) {
        opener.focus?.()
      }
    }
  }, [opener])

  const maxWClass =
    size === "small" || size === "compact"
      ? "max-w-md"
      : size === "wide"
        ? "max-w-3xl"
        : "max-w-lg"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && dismissible) onClose()
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`modal relative flex flex-col w-full ${maxWClass} max-h-[calc(100dvh-2rem)] rounded-corner-lg bg-surface-bg shadow-xl border border-border-primary/50 overflow-hidden text-text-primary`}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border-primary/40">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {eyebrow}
              </span>
            )}
            <h2
              id={titleId}
              className="text-base sm:text-lg font-semibold text-text-heading tracking-normal break-words text-balance"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed break-words">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="grid size-11 shrink-0 place-items-center -my-2 -mr-2 rounded-corner-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X size={20} aria-hidden />
            </button>
          )}
        </header>

        <div
          className={`min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 ${
            layout === "form" ? "flex flex-col gap-4" : ""
          }`}
        >
          {children}
        </div>

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-bg-subtle/50 border-t border-border-primary/40">
            {footer}
          </footer>
        )}
      </section>
    </div>
  )
}

export function RetryAction({
  canRetry,

  pending,

  error,

  onRetry,
}: {
  canRetry: boolean

  pending: boolean

  error: string

  onRetry: () => void
}) {
  if (!canRetry) return null

  return (
    <div
      className="flex flex-col gap-2 p-3 rounded-corner-md bg-status-expired-bg border border-status-expired/20"
      role="status"
    >
      <p className="text-xs text-status-expired" role="alert">
        {error || "Thao tác trước chưa được xác nhận. Hãy thử lại để tiếp tục."}
      </p>
      <Button
        type="button"
        variant="neutral"
        size="small"
        loading={pending}
        onClick={onRetry}
      >
        Thử lại thao tác đang chờ
      </Button>
    </div>
  )
}

export function ModalActions({
  start,

  end,
}: {
  start?: ReactNode

  end: ReactNode
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <div>{start}</div>
      <div className="flex items-center gap-2">{end}</div>
    </div>
  )
}

export default Modal
