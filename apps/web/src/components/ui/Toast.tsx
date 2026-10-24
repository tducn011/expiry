import { CircleCheck, CircleAlert, X } from "./Icon"

export interface ToastProps {
  message: string
  variant?: "success" | "danger" | "warning" | "neutral"
  onDismiss?: () => void
}

export function Toast({ message, variant = "success", onDismiss }: ToastProps) {
  const isDanger = variant === "danger"
  const isWarning = variant === "warning"

  return (
    <div
      role="status"
      className={`flex items-center gap-3 px-4 py-3 rounded-corner-lg shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-bottom-2 ${
        isDanger
          ? "bg-status-expired-bg border-status-expired/30 text-status-expired"
          : isWarning
            ? "bg-status-soon-bg border-status-soon/30 text-status-soon"
            : "bg-surface-bg border-border-primary text-text-primary"
      }`}
    >
      <span className="shrink-0">
        {isDanger ? (
          <CircleAlert size={18} className="text-status-expired" aria-hidden />
        ) : isWarning ? (
          <CircleAlert size={18} className="text-status-soon" aria-hidden />
        ) : (
          <CircleCheck size={18} className="text-brand-primary" aria-hidden />
        )}
      </span>
      <span className="flex-1 truncate">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Đóng thông báo"
          className="p-1 rounded-corner-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <X size={16} aria-hidden />
        </button>
      )}
    </div>
  )
}

export default Toast
