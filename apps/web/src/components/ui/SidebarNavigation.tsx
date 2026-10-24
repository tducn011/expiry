import type { ReactNode } from "react"
import { Leaf } from "./Icon"

export function SidebarButton({
  icon,
  "aria-label": ariaLabel,
  title,
  active = false,
  badge,
  onClick,
}: {
  icon: ReactNode
  "aria-label"?: string
  title?: string
  active?: boolean
  badge?: number
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel || title}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`relative flex size-12 items-center justify-center rounded-corner-md transition-all cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-brand-primary ${
        active
          ? "bg-brand-primary text-white shadow-xs"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover active:bg-bg-subtle"
      }`}
    >
      <span className="flex items-center justify-center">{icon}</span>
      {badge !== undefined && badge > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-xs"
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
}: {
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <aside
      aria-label="Điều hướng chính"
      className="flex flex-col items-center justify-between h-dvh w-[72px] shrink-0 py-5 border-r border-border-primary/60 bg-surface-bg shadow-xs"
    >
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand Icon */}
        <div className="flex size-10 items-center justify-center rounded-corner-md bg-brand-primary text-white shadow-xs">
          <Leaf size={22} aria-hidden />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {children}
        </nav>
      </div>

      {/* Footer Area (Login/Logout/Profile) */}
      {footer && (
        <div className="flex flex-col items-center px-2">{footer}</div>
      )}
    </aside>
  )
}

export default SidebarNavigation
