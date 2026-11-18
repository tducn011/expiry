import { useState, type ReactNode } from "react"

export interface SwitchFieldProps {
  label: string

  description?: string

  icon?: ReactNode

  defaultSelected?: boolean

  selected?: boolean

  onChange?: (checked: boolean) => void

  disabled?: boolean

  className?: string
}

export function SwitchField({
  label,

  description,

  icon,

  defaultSelected = false,

  selected,

  onChange,

  disabled = false,

  className = "",
}: SwitchFieldProps) {
  const [internalChecked, setInternalChecked] = useState(defaultSelected)

  const isChecked = selected !== undefined ? selected : internalChecked

  const handleToggle = () => {
    if (disabled) return

    const next = !isChecked

    if (selected === undefined) setInternalChecked(next)

    onChange?.(next)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleToggle}
      className={`flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {icon && (
        <span aria-hidden="true" className="shrink-0 text-brand-strong">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text-primary">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-text-secondary">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
          isChecked ? "bg-brand-primary" : "bg-border-strong"
        }`}
      >
        <span
          className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
            isChecked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  )
}

export default SwitchField
