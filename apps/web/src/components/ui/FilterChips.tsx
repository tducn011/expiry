import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"

import { Check, ChevronDown, X } from "lucide-react"

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

  requiredSelection?: boolean

  triggerIcon?: ReactNode
}

export function FilterDropdown<T extends string = string>({
  label,

  value,

  onChange,

  options,

  className = "",

  ariaLabel,
  requiredSelection = false,
  triggerIcon,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const openAtEnd = useRef(false)
  const listId = useId()
  const activeOption = options.find((option) => option.v === value)
  const isFiltered =
    !requiredSelection && value !== "all" && Boolean(activeOption)

  useLayoutEffect(() => {
    const anchor = dropdownRef.current
    const list = listRef.current
    if (!isOpen || !anchor || !list) return

    const position = () => {
      const { left } = anchor.getBoundingClientRect()
      const maxLeft =
        document.documentElement.clientWidth - list.offsetWidth - 8
      const clampedLeft = Math.max(8, Math.min(left, maxLeft))
      list.style.left = `${clampedLeft - left}px`
    }
    position()
    const choices = list.querySelectorAll<HTMLButtonElement>('[role="option"]')
    const selected = list.querySelector<HTMLButtonElement>(
      '[aria-selected="true"]',
    )
    const initial =
      selected ?? choices[openAtEnd.current ? choices.length - 1 : 0]
    initial?.focus({ preventScroll: true })
    window.addEventListener("resize", position)
    return () => window.removeEventListener("resize", position)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const dismissOutside = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("pointerdown", dismissOutside)
    return () => document.removeEventListener("pointerdown", dismissOutside)
  }, [isOpen])

  function closeAndRestoreFocus() {
    setIsOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isOpen && event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      closeAndRestoreFocus()
      return
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    if (!isOpen && (event.key === "Home" || event.key === "End")) return
    event.preventDefault()
    if (!isOpen) {
      openAtEnd.current = event.key === "ArrowUp"
      setIsOpen(true)
      return
    }
    const choices = Array.from(
      listRef.current!.querySelectorAll<HTMLButtonElement>('[role="option"]'),
    )
    if (!choices.length) return
    const current = choices.indexOf(document.activeElement as HTMLButtonElement)
    let next = current
    switch (event.key) {
      case "ArrowDown":
        next = Math.min(current + 1, choices.length - 1)
        break
      case "ArrowUp":
        next = Math.max(current - 1, 0)
        break
      case "Home":
        next = 0
        break
      case "End":
        next = choices.length - 1
        break
    }
    choices[next].focus()
  }

  function select(next: T | "all") {
    onChange(next)
    closeAndRestoreFocus()
  }

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block max-w-full text-left ${className}`}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-controls={isOpen ? listId : undefined}
        aria-expanded={isOpen}
        onClick={() => {
          openAtEnd.current = false
          setIsOpen((prev) => !prev)
        }}
        className={`inline-flex max-w-full items-center justify-between gap-1.5 h-11 min-h-[44px] rounded-[16px] px-3.5 text-sm transition-colors cursor-pointer select-none outline-none focus-visible:outline-2 focus-visible:outline-brand-primary ${
          isFiltered
            ? "bg-surface-soft border-[1.5px] border-brand-primary text-brand-primary font-semibold shadow-xs"
            : "bg-surface-bg border-[1.5px] border-border-control text-text-primary font-medium hover:bg-surface-hover hover:border-brand-primary/60"
        }`}
      >
        {triggerIcon}
        <span className="truncate">
          {requiredSelection
            ? (activeOption?.label ?? label)
            : isFiltered
              ? `${label}: ${activeOption?.label}`
              : label}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel || `Lọc theo ${label}`}
          className="absolute left-0 top-full mt-2 z-40 w-48 max-w-[calc(100vw-1rem)] max-h-64 overflow-y-auto rounded-[12px] border border-border-primary/60 bg-surface-bg p-1.5 shadow-lg scrollbar-thin"
        >
          {options.map((option) => {
            const isSelected = value === option.v
            return (
              <button
                key={option.v}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                onClick={() =>
                  select(isSelected && !requiredSelection ? "all" : option.v)
                }
                className={`flex w-full items-center justify-between gap-3 rounded-corner-sm px-3 py-2 text-xs font-medium cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-brand-primary ${
                  isSelected
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-text-primary hover:bg-surface-hover"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {!requiredSelection && (
                    <span
                      className={`size-2 rounded-full shrink-0 ${option.color || "bg-brand-primary/50"}`}
                      aria-hidden="true"
                    />
                  )}
                  <span className="break-words">{option.label}</span>
                </span>
                {isSelected && (
                  <Check size={14} aria-hidden="true" className="shrink-0" />
                )}
              </button>
            )
          })}
          {isFiltered && !options.some((option) => option.v === "all") && (
            <button
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={false}
              onClick={() => select("all")}
              className="mt-1 flex w-full items-center gap-2 rounded-corner-sm border-t border-border-primary/40 px-3 py-2 text-xs text-text-secondary hover:bg-surface-hover cursor-pointer text-left"
            >
              <X size={14} aria-hidden="true" />
              <span>Bỏ lọc {label}</span>
            </button>
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
  const hsdList = (options ||
    chips ||
    defaultHsdOptions) as FilterDropdownOption<StatusFilter>[]

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
