import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import Button from "./Button"
import Icon from "./Icon"

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
    if (foregroundModalCount === 0)
      document.body.style.overflow = previousBodyOverflow
  }
}

/** Shared dialog with fixed chrome, contained scrolling, and focus restoration. */
export default function Modal({
  eyebrow,
  title,
  description,
  onClose,
  footer,
  children,
  size = "regular",
  layout = "flow",
  dismissible = true,
  active = true,
}: {
  eyebrow?: string
  title: string
  description?: string
  onClose: () => void
  footer?: ReactNode
  children?: ReactNode
  size?: "compact" | "regular" | "wide"
  layout?: "flow" | "form" | "list"
  dismissible?: boolean
  active?: boolean
}) {
  const dialogRef = useRef<HTMLElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active
  // Capture before child autoFocus runs during the commit.
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  )
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!active) return
    const dialog = dialogRef.current
    if (!dialog) return
    const releaseScrollLock = acquireModalScrollLock()
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [href], [tabindex="0"]',
        ),
      ).filter((element) => element.getClientRects().length > 0)
    if (!dialog.contains(document.activeElement))
      (focusable()[0] ?? dialog).focus({ preventScroll: true })

    const handleKey = (event: KeyboardEvent) => {
      if (!activeRef.current) return
      // Portaled controls consume Escape and manage their own keyboard navigation.
      if (
        event.defaultPrevented ||
        document.querySelector('[data-ui-popover="true"]')
      )
        return
      if (event.key === "Escape" && dismissible) {
        event.preventDefault()
        closeRef.current()
      }
      if (event.key !== "Tab") return
      const controls = focusable()
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!first || !last) {
        event.preventDefault()
        dialog.focus()
      } else if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("keydown", handleKey)
      releaseScrollLock()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [active, dismissible, opener])

  return (
    <div
      className={`modal-backdrop ${active ? "active" : "suspended"}`}
      role="presentation"
      aria-hidden={active ? undefined : true}
      inert={active ? undefined : true}
      onMouseDown={active && dismissible ? () => closeRef.current() : undefined}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        className={`modal ${size} layout-${layout}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {dismissible && (
            <button
              type="button"
              className="icon-button"
              aria-label="Đóng"
              onClick={onClose}
            >
              <Icon name="close" />
            </button>
          )}
        </header>
        {children}
        {footer && <footer className="modal-footer">{footer}</footer>}
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
    <div className="stack" role="status">
      <p className="note-box" role="alert">
        {error || "Thao tác trước chưa được xác nhận. Hãy thử lại để tiếp tục."}
      </p>
      <Button
        type="button"
        variant="secondary"
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
    <>
      {start}
      <span className="footer-spacer" />
      {end}
    </>
  )
}
