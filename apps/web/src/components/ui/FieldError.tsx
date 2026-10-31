import { CircleAlert } from "./Icon"

export interface FieldErrorProps {
  id?: string

  msg?: string
}

export function FieldError({ id, msg }: FieldErrorProps) {
  if (!msg) return null

  return (
    <p
      id={id}
      role="alert"
      className="mt-1 flex items-center gap-1.5 text-xs text-status-expired font-medium animate-in fade-in"
    >
      <CircleAlert size={14} aria-hidden className="shrink-0" />
      <span>{msg}</span>
    </p>
  )
}

export default FieldError
