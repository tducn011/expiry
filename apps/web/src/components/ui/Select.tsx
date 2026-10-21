import Icon from "./Icon"

export type SelectOption<T extends string = string,> = {
  value: T

  label: string

  disabled?: boolean
}

type SelectProps<T extends string,> = {
  value: T

  options: readonly SelectOption<T>[]

  onChange: (value: T) => void

  disabled?: boolean

  placeholder?: string

  searchPlaceholder?: string

  className?: string

  id?: string

  name?: string

  "aria-label"?: string

  "aria-labelledby"?: string

  "aria-describedby"?: string

  "aria-invalid"?: boolean
}

// ponytail: lean native select replacing 365-line portal combobox (YAGNI / native platform)

export default function Select<T extends string>({
  value,

  options,

  onChange,

  disabled = false,

  className = "",

  id,

  name,

  "aria-label": ariaLabel,

  "aria-labelledby": ariaLabelledBy,

  "aria-describedby": ariaDescribedBy,

  "aria-invalid": ariaInvalid,
}: SelectProps<T>) {
  return (
    <div className={`select-control ${className}`}>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        onChange={(e) => onChange(e.target.value as T)}
        className="select-native"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <span className="select-chevron" aria-hidden="true">
        <Icon name="chevron-down" />
      </span>
    </div>
  )
}
