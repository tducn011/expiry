import { ReactNode } from "react"

/** Surface primitive: every white panel in the app is a Card with an optional titled header. */
export default function Card({
  title,
  action,
  children,
  tone = "default",
  className = "",
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  tone?: "default" | "muted"
  className?: string
}) {
  return (
    <section className={`card ${tone} ${className}`}>
      {title && (
        <header className="card-header">
          <h2>{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
