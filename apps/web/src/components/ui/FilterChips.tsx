import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown } from "./Icon"

export type StatusFilter = "all" | "soon" | "expired" | "unknown"

export interface FilterChipItem {
  v: "soon" | "expired" | "unknown" | string
  label: string
  color?: string
}

export interface FilterDropdownOption<T extends string = string> {
  v: T
  label: string
  color?: string
  icon?: ReactNode
}

export const defaultHsdOptions: FilterDropdownOption<StatusFilter>[] = [
  { v: "soon", label: "Sắp HSD", color: "bg-status-soon" },
  { v: "expired", label: "Quá HSD", color: "bg-status-expired" },
  { v: "unknown", label: "Chưa rõ HSD", color: "bg-text-tertiary" },
]

export const defaultFilterChips = defaultHsdOptions

export interface FilterDropdownProps<T extends string = string> {
  label: string
  value: T | "all"
  onChange: (v: T | "all") => void
  options: FilterDropdownOption<T>[]
  className?: string
  ariaLabel?: string
}

export function FilterDropdown<T extends string = string>({
  label,
  value,
  onChange,
  options,
  className = "",
  ariaLabel,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const activeOption = options.find((c) => c.v === value)
  const isFiltered = value !== "all" && Boolean(activeOption)

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
        <span>{isFiltered ? `${label}: ${activeOption?.label}` : label}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel || `Lọc theo ${label}`}
          className="absolute left-0 top-full mt-1.5 z-40 min-w-44 max-h-64 overflow-y-auto rounded-corner-md border border-border-primary/60 bg-surface-bg p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100 scrollbar-thin"
        >
          {options.map((c) => {
            const isSelected = value === c.v

            return (
              <button
                key={c.v}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(isSelected ? ("all" as T | "all") : c.v)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-corner-sm px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-text-primary hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full shrink-0 ${c.color || "bg-brand-primary/50"}`}
                    aria-hidden="true"
                  />
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
                  onChange("all" as T | "all")
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-corner-sm px-3 py-1.5 text-xs text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer text-left"
              >
                <span>✕ Bỏ lọc {label}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
  const hsdList = (options || chips || defaultHsdOptions) as FilterDropdownOption<StatusFilter>[]
  return (
    <FilterDropdown<StatusFilter>
      label="Danh mục"
      value={value}
      onChange={onChange}
      options={hsdList}
      className={className}
    />
  )
}

export default FilterDropdown
