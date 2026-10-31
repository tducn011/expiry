import { type ChangeEvent, type SelectHTMLAttributes, useId } from "react"

import { ChevronDown } from "./Icon"

export interface SelectOption {
  value: string

  label: string
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string

  options: SelectOption[]

  description?: string

  onChange?: (value: string) => void
}

export function SelectField({
  label,

  options,

  description,

  value,

  onChange,

  id: explicitId,

  className = "",

  disabled,

  ...props
}: SelectFieldProps) {
  const generatedId = useId()

  const id = explicitId || generatedId

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center min-h-11 w-full rounded-corner-md border border-border-primary bg-surface-bg shadow-xs transition-colors focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 ${
          disabled ? "opacity-60 bg-bg-subtle cursor-not-allowed" : ""
        } ${className}`}
      >
        <select
          id={id}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          className="w-full min-w-0 appearance-none !border-0 !bg-transparent px-3 py-2 pr-9 text-sm text-text-primary !outline-none focus:!outline-none focus:!ring-0 cursor-pointer disabled:cursor-not-allowed"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 flex items-center text-text-tertiary">
          <ChevronDown size={18} aria-hidden />
        </span>
      </div>
      {description && (
        <p className="text-xs text-text-secondary">{description}</p>
      )}
    </div>
  )
}

export default SelectField
