import Icon from "../ui/Icon"

export type BreadcrumbItem = {
  label: string
  onNavigate: () => void
}

export default function Breadcrumb({
  items,
  className = "",
}: {
  items: readonly BreadcrumbItem[]
  className?: string
}) {
  if (items.length === 0) return null

  // ponytail: controlled local-state navigation; URL/link ownership stays with the app.
  // Current nesting has one parent. Do not add a hidden-level menu without deeper routes.
  return (
    <nav aria-label="Đường dẫn" className={`breadcrumb ${className}`}>
      <ol>
        {items.map((item, index) => (
          <li key={`${index}:${item.label}`}>
            {index > 0 && (
              <span className="breadcrumb-separator">
                <Icon name="chevron-right" />
              </span>
            )}
            <button type="button" onClick={item.onNavigate} title={item.label}>
              <span className="breadcrumb-mobile-back">
                <Icon name="chevron-left" />
              </span>
              <span className="breadcrumb-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
