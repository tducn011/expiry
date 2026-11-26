import type { ReactNode } from "react"

import { ArrowLeft, ChevronRight } from "lucide-react"

import IconButton from "./IconButton"

export interface PageBreadcrumbItem {
  label: string

  onClick?: () => void
}

export interface PageHeaderProps {
  title: string

  subtitle?: string

  description?: string

  eyebrow?: string

  breadcrumbs?: readonly PageBreadcrumbItem[]

  onBack?: () => void

  backLabel?: string

  backClassName?: string

  actions?: ReactNode

  action?: ReactNode

  className?: string
}

export function PageHeader({
  title,

  subtitle,

  description,

  eyebrow,

  breadcrumbs,

  onBack,

  backLabel = "Quay lại",

  backClassName = "",

  actions,

  action,

  className = "",
}: PageHeaderProps) {
  const sub = subtitle || description

  const act = actions || action

  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 1)

  return (
    <header
      className={`flex flex-col gap-1.5 py-1 md:py-2 w-full ${className}`}
    >
      {hasBreadcrumbs && breadcrumbs && (
        <nav aria-label="Đường dẫn" className="hidden md:block">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <li
                  key={`${index}:${crumb.label}`}
                  className="inline-flex min-w-0 items-center gap-1.5"
                >
                  {index > 0 && (
                    <ChevronRight
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 text-text-tertiary"
                    />
                  )}
                  {crumb.onClick && !isLast ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="max-w-48 truncate rounded-corner-xs py-0.5 font-medium text-text-secondary transition-colors hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-brand-primary cursor-pointer"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className={`max-w-60 truncate ${
                        isLast
                          ? "font-semibold text-text-heading"
                          : "font-medium text-text-secondary"
                      }`}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}
      <div className="flex items-center gap-3 w-full">
        {onBack && (
          <IconButton
            variant="subtle"
            aria-label={backLabel}
            icon={<ArrowLeft size={20} />}
            onClick={onBack}
            className={backClassName}
          />
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <span className="block text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              {eyebrow}
            </span>
          )}
          <h1 className="text-xl md:text-2xl font-semibold text-text-heading tracking-normal break-words">
            {title}
          </h1>
          {sub && (
            <p className="mt-0.5 text-xs md:text-sm text-text-secondary font-normal leading-relaxed break-words">
              {sub}
            </p>
          )}
        </div>
        {act && <div className="shrink-0 flex items-center gap-2">{act}</div>}
      </div>
    </header>
  )
}

export default PageHeader
