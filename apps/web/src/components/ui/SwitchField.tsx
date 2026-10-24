import { useState } from "react"

export interface SwitchFieldProps {
  label: string
  description?: string
  defaultSelected?: boolean
  selected?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function SwitchField({
  label,
  description,
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
    <label
      className={`flex items-center justify-between gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {description && (
          <span className="text-xs text-text-secondary">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed ${
          isChecked ? "bg-brand-primary" : "bg-border-primary"
        }`}
      >
        <span
          className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-md transform ring-0 transition duration-200 ease-in-out ${
            isChecked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  )
}

export default SwitchField
