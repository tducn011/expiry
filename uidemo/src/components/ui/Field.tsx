import { ReactNode } from "react"

/** Label + control + one message line: the error replaces the hint, so height never jumps. */
export default function Field({
  label,
  children,
  hint,
  error,
  as = "label",
}: {
  label: string
  children: ReactNode
  hint?: string
  error?: string
  as?: "label" | "fieldset"
}) {
  const labelContent = label.endsWith(" *") ? (
    <>
      {label.slice(0, -2)} <span className="required-marker">*</span>
    </>
  ) : (
    label
  )
  const message = error ? (
    <span className="field-error" role="alert">
      {error}
    </span>
  ) : (
    <span className="field-hint">{hint ?? " "}</span>
  )
  if (as === "fieldset")
    return (
      <fieldset className={`field ${error ? "invalid" : ""}`}>
        <legend className="field-label">{labelContent}</legend>
        {children}
        {message}
      </fieldset>
    )
  return (
    <label className={`field ${error ? "invalid" : ""}`}>
      <span className="field-label">{labelContent}</span>
      {children}
      {message}
    </label>
  )
}
