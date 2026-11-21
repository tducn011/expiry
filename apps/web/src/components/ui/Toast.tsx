import { useRef } from "react"

import { CircleCheck, CircleAlert, X } from "lucide-react"

import { DUR, EASE, gsap, reducedMotion, useGSAP } from "../../lib/motion"

export interface ToastProps {
  message: string

  variant?: "success" | "danger" | "warning" | "neutral"

  onDismiss?: () => void

  // While false the toast animates out, then calls onExited so the owner can unmount it.
  open?: boolean

  onExited?: () => void
}

export function Toast({
  message,
  variant = "success",
  onDismiss,
  open = true,
  onExited,
}: ToastProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onExitedRef = useRef(onExited)
  onExitedRef.current = onExited
  const shown = useRef(false)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (open) {
        shown.current = true
        if (reducedMotion()) return
        gsap.fromTo(el, { opacity: 0, y: 8 }, {
          opacity: 1,
          y: 0,
          duration: DUR.normal,
          ease: EASE.enter,
          overwrite: true,
          clearProps: "opacity,transform",
        })
        return
      }
      if (!shown.current) return
      if (reducedMotion()) {
        onExitedRef.current?.()
        return
      }
      gsap.to(el, {
        opacity: 0,
        y: 8,
        duration: DUR.normal,
        ease: EASE.exit,
        overwrite: true,
        onComplete: () => onExitedRef.current?.(),
      })
    },
    { scope: ref, dependencies: [open] },
  )

  const isDanger = variant === "danger"

  const isWarning = variant === "warning"

  return (
    <div
      ref={ref}
      role="status"
      inert={!open}
      className={`flex items-center gap-3 px-4 py-3 rounded-corner-lg shadow-lg border text-sm font-medium ${
        isDanger
          ? "bg-status-expired-bg border-status-expired/30 text-status-expired"
          : isWarning
            ? "bg-status-soon-bg border-status-soon/30 text-status-soon"
            : "bg-surface-bg border-border-primary text-text-primary"
      }`}
    >
      <span className="shrink-0">
        {isDanger ? (
          <CircleAlert size={16} className="text-status-expired" aria-hidden />
        ) : isWarning ? (
          <CircleAlert size={16} className="text-status-soon" aria-hidden />
        ) : (
          <CircleCheck size={16} className="text-status-ok" aria-hidden />
        )}
      </span>
      <span className="flex-1 truncate">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Đóng thông báo"
          className="p-3.5 -m-3 md:p-1 md:m-0 rounded-corner-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  )
}

export default Toast
