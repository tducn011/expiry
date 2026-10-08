import { ReactNode } from "react";

/** Label + control + one message line: the error replaces the hint, so height never jumps. */
export default function Field({ label, children, hint, error, as = "label" }: { label: string; children: ReactNode; hint?: string; error?: string; as?: "label" | "fieldset" }) {
  const message = error ? <span className="field-error" role="alert">{error}</span> : <span className="field-hint">{hint ?? " "}</span>;
  if (as === "fieldset") return <fieldset className={`field ${error ? "invalid" : ""}`}><legend className="field-label">{label}</legend>{children}{message}</fieldset>;
  return <label className={`field ${error ? "invalid" : ""}`}><span className="field-label">{label}</span>{children}{message}</label>;
}
