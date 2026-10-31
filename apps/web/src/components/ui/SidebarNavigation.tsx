import type { ReactNode } from "react"

import { ChevronsLeft, ChevronsRight, Leaf } from "./Icon"

export function SidebarButton({
  icon,

  "aria-label": ariaLabel,

  title,

  label,

  active = false,

  badge,

  isExpanded = false,

  onClick,
}: {
  icon: ReactNode

  "aria-label"?: string

  title?: string

  label?: string

  active?: boolean

  badge?: number

  isExpanded?: boolean

  onClick?: () => void
}) {
  const displayLabel = label || title || ariaLabel

  return (
    <button
      type="button"
      title={title || label}
      aria-label={ariaLabel || title || label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`group relative flex items-center rounded-corner-md transition-all cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary ${
        isExpanded
          ? "w-full gap-3 px-3 py-2.5 justify-start text-left"
          : "size-12 justify-center"
      } ${
        active
          ? "bg-brand-primary text-white shadow-xs"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover active:bg-bg-subtle"
      }`}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">
        {icon}
      </span>

      {isExpanded && (
        <span className="flex-1 truncate text-sm font-medium">
          {displayLabel}
        </span>
      )}

      {badge !== undefined && badge > 0 && (
        <span
          aria-hidden="true"
          className={`${
            isExpanded
              ? "ml-auto flex min-w-5 h-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white shadow-xs"
              : "absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-xs"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

export function SidebarNavigation({
  children,

  footer,

  isExpanded = false,

  onToggleExpanded,
}: {
  children: ReactNode

  footer?: ReactNode

  isExpanded?: boolean

  onToggleExpanded?: () => void
}) {
  return (
    <aside
      aria-label="Điều hướng chính"
      className={`flex flex-col justify-between h-dvh shrink-0 py-5 border-r border-border-primary/60 bg-surface-bg shadow-xs transition-all duration-200 ease-in-out ${
        isExpanded ? "w-60 px-3 items-stretch" : "w-[72px] px-2 items-center"
      }`}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Brand Header & Toggle */}
        <div
          className={`flex items-center w-full ${
            isExpanded
              ? "justify-between px-1"
              : "flex-col gap-2 justify-center"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-corner-md bg-brand-primary text-white shadow-xs">
              <Leaf size={22} aria-hidden />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex flex-col">
                <span className="font-bold text-base tracking-tight text-text-primary leading-tight">
                  Expiry
                </span>
                <span className="text-[11px] text-text-tertiary truncate">
                  Quản lý kho bếp
                </span>
              </div>
            )}
          </div>

          {onToggleExpanded && (
            <button
              type="button"
              onClick={onToggleExpanded}
              title={
                isExpanded
                  ? "Thu gọn thanh điều hướng (Phím [)"
                  : "Mở rộng thanh điều hướng (Phím [)"
              }
              aria-label={
                isExpanded
                  ? "Thu gọn thanh điều hướng"
                  : "Mở rộng thanh điều hướng"
              }
              className="flex size-8 shrink-0 items-center justify-center rounded-corner-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronsLeft size={18} />
              ) : (
                <ChevronsRight size={18} />
              )}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex flex-col gap-1.5 w-full ${
            isExpanded ? "items-stretch" : "items-center"
          }`}
        >
          {children}
        </nav>
      </div>

      {/* Footer Area (Login/Logout/Profile) */}
      {footer && (
        <div
          className={`w-full ${
            isExpanded ? "items-stretch" : "items-center flex flex-col"
          }`}
        >
          {footer}
        </div>
      )}
    </aside>
  )
}

export default SidebarNavigation
