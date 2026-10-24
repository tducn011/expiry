import type { ReactNode } from "react"
import { ArrowLeft } from "./Icon"
import IconButton from "./IconButton"

export interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  eyebrow?: string
  onBack?: () => void
  actions?: ReactNode
  action?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  description,
  eyebrow,
  onBack,
  actions,
  action,
  className = "",
}: PageHeaderProps) {
  const sub = subtitle || description
  const act = actions || action

  return (
    <header
      className={`flex items-center gap-3 py-1 md:py-2 w-full ${className}`}
    >
      {onBack && (
        <IconButton
          variant="subtle"
          aria-label="Quay lại"
          icon={<ArrowLeft size={22} />}
          onClick={onBack}
        />
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {eyebrow}
          </span>
        )}
        <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight break-words">
          {title}
        </h1>
        {sub && (
          <p className="mt-0.5 text-xs md:text-sm text-text-secondary leading-relaxed break-words">
            {sub}
          </p>
        )}
      </div>
      {act && <div className="shrink-0 flex items-center gap-2">{act}</div>}
    </header>
  )
}

export default PageHeader
