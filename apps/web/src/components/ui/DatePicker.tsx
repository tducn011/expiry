import { useRef } from "react"
import Icon from "./Icon"

type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
  placeholder?: string
  clearable?: boolean
  clearLabel?: string
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean | "true" | "false"
}

function formatDisplayDate(iso: string) {
  if (!iso) return ""
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`
}

// ponytail: use native HTML5 date input and showPicker() instead of custom 700-line calendar engine
export default function DatePicker({
  value,
  onChange,
  disabled = false,
  id,
  className = "",
  placeholder = "DD/MM/YYYY",
  clearable = false,
  clearLabel = "Xóa ngày",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = () => {
    if (disabled) return
    try {
      inputRef.current?.showPicker?.()
    } catch {
      inputRef.current?.focus()
    }
  }

  return (
    <div className={`date-picker ${className}`}>
      <button
        type="button"
        id={id}
        className="date-picker-trigger"
        onClick={openPicker}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      >
        <span
          className={`date-picker-value${
            value ? "" : " placeholder date-picker-placeholder"
          }`}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <span className="icon" aria-hidden="true">
          <Icon name="calendar" />
        </span>
      </button>

      <input
        ref={inputRef}
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          width: 0,
          height: 0,
          border: 0,
          margin: 0,
          padding: 0,
        }}
      />

      {clearable && value && !disabled && (
        <button
          type="button"
          className="date-picker-clear"
          onClick={() => onChange("")}
          aria-label={clearLabel}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  )
}
