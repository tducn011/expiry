import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import Icon from "./Icon"

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
}) {
  const dialogRef = useRef<HTMLElement>(null)
  // Capture before child autoFocus runs during the commit.
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  )
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [href], [tabindex="0"]',
        ),
      ).filter((element) => element.getClientRects().length > 0)
    if (!dialog.contains(document.activeElement))
      (focusable()[0] ?? dialog).focus({ preventScroll: true })

    const handleKey = (event: KeyboardEvent) => {
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
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [dismissible, opener])

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={dismissible ? () => closeRef.current() : undefined}
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
