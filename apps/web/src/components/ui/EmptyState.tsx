import type { ReactNode } from "react"
import Card from "./Card"

export interface EmptyStateProps {
  icon?: ReactNode
  eyebrow?: string
  title: string
  text?: string
  body?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  eyebrow,
  title,
  text,
  body,
  action,
  className = "",
}: EmptyStateProps) {
  const description = text || body

  return (
    <Card
      className={`flex flex-col items-center justify-center gap-4 py-12 px-6 text-center ${className}`}
    >
      {icon && (
        <div className="flex size-14 items-center justify-center rounded-corner-full bg-brand-accent/60 text-brand-primary shadow-xs">
          {icon}
        </div>
      )}
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      {description && (
        <p className="max-w-md text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  )
}

export default EmptyState
