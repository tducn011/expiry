import type { ButtonHTMLAttributes, ReactNode } from "react"
import Icon from "./Icon"

export type ButtonVariant = "primary" | "neutral" | "subtle" | "danger" | "cta" | "outline" | "ghost" | "secondary"
export type ButtonSize = "small" | "sm" | "md" | "lg"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconRight?: string
  iconStart?: ReactNode
  iconEnd?: ReactNode
  loading?: boolean
  block?: boolean
  ariaLabel?: string
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-dark shadow-xs border-transparent",
  neutral:
    "bg-surface-bg border-border-primary text-text-primary hover:bg-surface-hover active:bg-bg-subtle shadow-xs",
  secondary:
    "bg-surface-bg border-border-primary text-text-primary hover:bg-surface-hover active:bg-bg-subtle shadow-xs",
  outline:
    "bg-surface-bg border-border-primary text-text-primary hover:bg-surface-hover active:bg-bg-subtle shadow-xs",
  subtle:
    "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover active:bg-bg-subtle",
  ghost:
    "bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover active:bg-bg-subtle",
  danger:
    "bg-status-expired-bg border-transparent text-status-expired hover:bg-red-100 active:bg-red-200",
  cta: "bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-dark shadow-sm border-transparent",
}

const sizeStyles: Record<string, string> = {
  small: "min-h-8 px-3 py-1 text-xs gap-1.5 rounded-corner-md font-medium",
  sm: "min-h-8 px-3 py-1 text-xs gap-1.5 rounded-corner-md font-medium",
  md: "min-h-11 px-4 py-2 text-sm gap-2 rounded-corner-md font-semibold",
  lg: "min-h-12 px-6 py-2.5 text-base gap-2.5 rounded-corner-lg font-semibold",
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  iconStart,
  iconEnd,
  onClick,
  type = "button",
  disabled,
  loading,
  block,
  ariaLabel,
  className = "",
  ...props
}: ButtonProps) {
  const normSize =
    size === "small"
      ? "small"
      : size === "sm"
        ? "sm"
        : size === "lg"
          ? "lg"
          : "md"
  const sizeCls = sizeStyles[normSize] || sizeStyles.md
  const varCls = variantStyles[variant] || variantStyles.primary

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center border transition-all cursor-pointer select-none text-center outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-50 disabled:cursor-not-allowed ${sizeCls} ${varCls} ${
        block ? "w-full" : ""
      } ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      aria-label={ariaLabel || props["aria-label"] as string}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block size-4 border-2 border-current border-r-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : iconStart ? (
        <span className="shrink-0 flex items-center justify-center">
          {iconStart}
        </span>
      ) : icon ? (
        <Icon name={icon} />
      ) : null}

      {children && (
        <span className="inline-block max-w-full leading-tight">
          {children}
        </span>
      )}

      {!loading &&
        (iconEnd ? (
          <span className="shrink-0 flex items-center justify-center">
            {iconEnd}
          </span>
        ) : iconRight ? (
          <Icon name={iconRight} />
        ) : null)}
    </button>
  )
}
