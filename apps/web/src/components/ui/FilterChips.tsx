import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "./Icon"

export type StatusFilter = "all" | "soon" | "expired" | "unknown"

export interface FilterChipItem {
  v: "soon" | "expired" | "unknown"
  label: string
}

export const defaultHsdOptions: FilterChipItem[] = [
  { v: "soon", label: "Sắp HSD" },
  { v: "expired", label: "Quá HSD" },
  { v: "unknown", label: "Chưa rõ HSD" },
]

// Keep alias for backwards compatibility
export const defaultFilterChips = defaultHsdOptions

export interface FilterChipsProps {
  value: StatusFilter
  onChange: (v: StatusFilter) => void
  options?: FilterChipItem[]
  chips?: FilterChipItem[]
  className?: string
}

export function FilterChips({
  value,
  onChange,
  options,
  chips,
  className = "",
}: FilterChipsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const hsdList = options || chips || defaultHsdOptions

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const activeOption = hsdList.find((c) => c.v === value)
  const isFiltered = Boolean(activeOption)

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 min-h-8 shrink-0 rounded-corner-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer select-none outline-none focus-visible:outline-2 focus-visible:outline-brand-primary ${
          isFiltered
            ? "bg-brand-primary text-white shadow-xs hover:bg-brand-primary/90"
            : "bg-surface-bg border border-border-primary text-text-primary hover:bg-surface-hover hover:border-brand-primary/40"
        }`}
      >
        <span>{isFiltered ? `HSD: ${activeOption?.label}` : "HSD"}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Lọc theo trạng thái HSD"
          className="absolute left-0 top-full mt-1.5 z-40 min-w-44 overflow-hidden rounded-corner-md border border-border-primary/60 bg-surface-bg p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
        >
          {hsdList.map((c) => {
            const isSelected = value === c.v

            return (
              <button
                key={c.v}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(isSelected ? "all" : c.v)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-corner-sm px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-text-primary hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-2">
                  {c.v === "expired" && (
                    <span className="size-2 rounded-full bg-status-expired shrink-0" aria-hidden="true" />
                  )}
                  {c.v === "soon" && (
                    <span className="size-2 rounded-full bg-status-soon shrink-0" aria-hidden="true" />
                  )}
                  {c.v === "unknown" && (
                    <span className="size-2 rounded-full bg-text-tertiary shrink-0" aria-hidden="true" />
                  )}
                  <span>{c.label}</span>
                </div>
                {isSelected && (
                  <svg
                    className="size-3.5 text-brand-primary shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )
          })}

          {isFiltered && (
            <div className="mt-1 pt-1 border-t border-border-primary/40">
              <button
                type="button"
                onClick={() => {
                  onChange("all")
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-corner-sm px-3 py-1.5 text-xs text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer text-left"
              >
                <span>✕ Bỏ lọc HSD</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterChips
