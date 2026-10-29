import type { ReactNode } from "react"

export interface CardProps {
  children: ReactNode

  className?: string

  role?: string

  title?: string

  action?: ReactNode

  muted?: boolean

  onClick?: () => void
}

export function Card({
  children,

  className = "",

  role,

  title,

  action,

  muted = false,

  onClick,
}: CardProps) {
  return (
    <section
      role={role}
      onClick={onClick}
      className={`rounded-corner-lg border border-border-primary/60 p-5 shadow-xs transition-colors ${
        muted ? "bg-bg-subtle" : "bg-surface-bg"
      } ${onClick ? "cursor-pointer hover:bg-surface-hover" : ""} ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-4">
          {title && (
            <h2 className="text-base font-semibold text-text-primary">
              {title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export default Card
