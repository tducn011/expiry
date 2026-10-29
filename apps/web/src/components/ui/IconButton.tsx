import type { ButtonHTMLAttributes, ReactNode } from "react"

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode

  "aria-label": string

  variant?: "primary" | "neutral" | "subtle" | "danger"

  size?: "small" | "md" | "lg"

  className?: string
}

export function IconButton({
  icon,

  variant = "subtle",

  size = "md",

  className = "",

  disabled,

  ...props
}: IconButtonProps) {
  const sizeClass =
    size === "small" ? "size-8" : size === "lg" ? "size-12" : "size-10"

  const variantClass =
    variant === "primary"
      ? "bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-dark"
      : variant === "neutral"
        ? "bg-surface-bg border border-border-primary text-text-primary hover:bg-surface-hover active:bg-bg-subtle shadow-xs"
        : variant === "danger"
          ? "bg-status-expired-bg text-status-expired hover:bg-red-100"
          : "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover active:bg-bg-subtle"

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-corner-md transition-colors cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass} ${variantClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  )
}

export default IconButton
