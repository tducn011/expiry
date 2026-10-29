export type StatusFilter = "all" | "soon" | "expired" | "unknown"

export interface FilterChipItem {
  v: StatusFilter

  label: string
}

export const defaultFilterChips: FilterChipItem[] = [
  { v: "all", label: "Tất cả" },

  { v: "soon", label: "Sắp HSD" },

  { v: "expired", label: "Quá HSD" },

  { v: "unknown", label: "Chưa rõ HSD" },
]

export interface FilterChipsProps {
  value: StatusFilter

  onChange: (v: StatusFilter) => void

  chips?: FilterChipItem[]
}

export function FilterChips({
  value,

  onChange,

  chips = defaultFilterChips,
}: FilterChipsProps) {
  return (
    <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
      <div
        role="tablist"
        aria-label="Lọc theo trạng thái"
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        {chips.map((c) => {
          const on = value === c.v

          return (
            <button
              key={c.v}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(c.v)}
              className={`min-h-8 shrink-0 rounded-corner-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer select-none outline-none focus-visible:outline-2 focus-visible:outline-brand-primary ${
                on
                  ? "bg-brand-primary text-white shadow-xs"
                  : "bg-surface-bg border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              {c.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FilterChips
