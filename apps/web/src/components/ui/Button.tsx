import { ReactNode } from "react"
import Icon from "./Icon"

export type ButtonVariant = "cta" | "primary" | "secondary" | "outline" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export default function Button({
  children,
  variant = "outline",
  size = "md",
  icon,
  iconRight,
  onClick,
  type = "button",
  disabled,
  loading,
  block,
  ariaLabel,
  className = "",
}: {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconRight?: string
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  loading?: boolean
  block?: boolean
  ariaLabel?: string
  className?: string
}) {
  return (
    <button
      type={type}
      className={`button ${variant} ${size !== "md" ? size : ""} ${block ? "block" : ""} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      aria-label={ariaLabel}
    >
      {loading ? (
        <span className="button-spinner" aria-hidden="true" />
      ) : (
        icon && <Icon name={icon} />
      )}
      <span>{children}</span>
      {!loading && iconRight && <Icon name={iconRight} />}
    </button>
  )
}
