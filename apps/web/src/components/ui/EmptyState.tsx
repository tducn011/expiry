import { ReactNode } from "react"

export default function EmptyState({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <section className="empty card">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
      {action}
    </section>
  )
}
