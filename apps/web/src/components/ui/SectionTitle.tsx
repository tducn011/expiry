import type { ReactNode } from "react"

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h2
      className={`text-base font-semibold text-text-primary tracking-tight ${className}`}
    >
      {children}
    </h2>
  )
}

export default SectionTitle
