import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from "react"

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "prefix"> {
  label?: string

  description?: string

  error?: boolean | string

  prefix?: ReactNode

  suffix?: ReactNode

  onChange?: ((value: string) => void) | ((
    e: ChangeEvent<HTMLInputElement>,
  ) => void)
}

export function InputField({
  label,

  description,

  error,

  prefix,

  suffix,

  value,

  onChange,

  type = "text",

  id: explicitId,

  className = "",

  disabled,

  ...props
}: InputFieldProps) {
  const generatedId = useId()

  const id = explicitId || generatedId

  const isError = Boolean(error)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return

    const fn = onChange as (val: string) => void

    fn(e.target.value)
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-text-primary">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center min-h-11 w-full rounded-corner-md bg-surface-bg px-3 py-2 shadow-xs transition-colors ${
          isError
            ? "border-[1.5px] border-[#b42318] focus-within:border-[#b42318] focus-within:ring-2 focus-within:ring-[#b42318]/20"
            : "border border-border-primary focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20"
        } ${
          disabled ? "opacity-60 bg-bg-subtle cursor-not-allowed" : ""
        } ${className}`}
      >
        {prefix && (
          <span className="mr-2 text-text-tertiary flex items-center shrink-0">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          className="w-full min-w-0 !border-0 !p-0 !min-h-0 !shadow-none !bg-transparent text-sm text-text-primary placeholder:text-text-tertiary !outline-none focus:!outline-none focus:!ring-0"
          {...props}
        />
        {suffix && (
          <span className="ml-2 text-text-tertiary flex items-center shrink-0">
            {suffix}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-text-secondary">{description}</p>
      )}
    </div>
  )
}

export default InputField
