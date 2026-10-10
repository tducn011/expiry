import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { KeyboardEvent } from "react"
import { createPortal } from "react-dom"
import Icon from "./Icon"

export type SelectOption<T extends string = string,> = {
  value: T
  label: string
  disabled?: boolean
}

type SelectProps<T extends string,> = {
  value: T
  options: readonly SelectOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  id?: string
  name?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean
}

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("vi")

/** Controlled, select-only combobox. The portal keeps options outside scroll containers. */
export default function Select<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "Chọn một mục",
  searchPlaceholder = "Tìm lựa chọn",
  className = "",
  id,
  name,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: SelectProps<T>) {
  const generatedId = useId()
  const triggerId = id ?? `select-${generatedId}`
  const listId = `${triggerId}-listbox`
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const typeahead = useRef({ text: "", at: 0 })
  const openingEdge = useRef<"first" | "last" | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [highlighted, setHighlighted] = useState(-1)
  const searchable = options.length > 8
  const selected = options.find((option) => option.value === value)
  const filtered = useMemo(
    () =>
      options.filter((option) =>
        normalize(option.label).includes(normalize(query)),
      ),
    [options, query],
  )

  const close = (returnFocus = false) => {
    setOpen(false)
    setQuery("")
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true })
  }
  const choose = (option: SelectOption<T>) => {
    if (option.disabled) return
    onChange(option.value)
    close(true)
  }

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  useLayoutEffect(() => {
    if (!open) return
    if (openingEdge.current) {
      const enabled = filtered
        .map((option, index) => (option.disabled ? -1 : index))
        .filter((index) => index >= 0)
      setHighlighted(
        openingEdge.current === "first"
          ? (enabled[0] ?? -1)
          : (enabled[enabled.length - 1] ?? -1),
      )
      openingEdge.current = null
      return
    }
    const current = filtered.findIndex(
      (option) => option.value === value && !option.disabled,
    )
    setHighlighted(
      current >= 0 ? current : filtered.findIndex((option) => !option.disabled),
    )
  }, [open, filtered, value])

  useLayoutEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const popover = popoverRef.current
    const list = listRef.current
    if (!trigger || !popover || !list) return

    const position = () => {
      const rect = trigger.getBoundingClientRect()
      const viewportWidth = document.documentElement.clientWidth
      const viewportHeight = window.innerHeight
      const padding = 8
      const gap = 8
      // Set width before measuring height so wrapped labels cannot distort the first opening.
      popover.style.width = `${Math.min(rect.width, viewportWidth - padding * 2)}px`
      list.style.maxHeight = "332px"
      const naturalHeight = popover.getBoundingClientRect().height
      const below = viewportHeight - rect.bottom - gap - padding
      const above = rect.top - gap - padding
      const flip = naturalHeight > below && above > below
      const available = flip ? above : below
      const extraHeight = naturalHeight - list.getBoundingClientRect().height
      list.style.maxHeight = `${Math.max(40, Math.min(332, available - extraHeight))}px`
      const height = popover.getBoundingClientRect().height
      const left = Math.max(
        padding,
        Math.min(rect.left, viewportWidth - popover.offsetWidth - padding),
      )
      const top = flip ? rect.top - gap - height : rect.bottom + gap
      popover.style.left = `${left}px`
      popover.style.top = `${Math.max(padding, Math.min(top, viewportHeight - height - padding))}px`
      popover.style.visibility = "visible"
    }

    position()
    const observer = new ResizeObserver(position)
    observer.observe(trigger)
    window.addEventListener("resize", position)
    window.addEventListener("scroll", position, true)
    const outside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!trigger.contains(target) && !popover.contains(target)) close()
    }
    document.addEventListener("pointerdown", outside)
    list.classList.add("scrollbar-flash")
    const flashTimer = window.setTimeout(
      () => list.classList.remove("scrollbar-flash"),
      900,
    )
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", position)
      window.removeEventListener("scroll", position, true)
      document.removeEventListener("pointerdown", outside)
      window.clearTimeout(flashTimer)
    }
  }, [open, filtered])

  useEffect(() => {
    if (open && highlighted >= 0) {
      document
        .getElementById(`${listId}-${highlighted}`)
        ?.scrollIntoView({ block: "nearest" })
    }
  }, [open, highlighted, listId])

  const keyDown = (
    event: KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ) => {
    if (event.key === "Escape" && open) {
      event.preventDefault()
      event.stopPropagation()
      close(true)
      return
    }
    if (event.key === "Tab") {
      if (open) close(event.currentTarget !== triggerRef.current)
      return
    }
    if (
      event.key === "Enter" ||
      (event.key === " " && event.currentTarget === triggerRef.current)
    ) {
      event.preventDefault()
      if (!open) setOpen(true)
      else if (highlighted >= 0) choose(filtered[highlighted])
      return
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault()
      if (!open) {
        openingEdge.current =
          event.key === "Home" ? "first" : event.key === "End" ? "last" : null
        setOpen(true)
        return
      }
      const enabled = filtered
        .map((option, index) => (option.disabled ? -1 : index))
        .filter((index) => index >= 0)
      if (!enabled.length) return
      const current = enabled.indexOf(highlighted)
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? enabled.length - 1
            : event.key === "ArrowDown"
              ? (current + 1) % enabled.length
              : (current - 1 + enabled.length) % enabled.length
      setHighlighted(enabled[next])
      return
    }
    if (
      event.currentTarget === triggerRef.current &&
      event.key.length === 1 &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      const now = Date.now()
      typeahead.current = {
        text:
          (now - typeahead.current.at < 600 ? typeahead.current.text : "") +
          event.key,
        at: now,
      }
      const match = filtered.findIndex(
        (option) =>
          !option.disabled &&
          normalize(option.label).startsWith(normalize(typeahead.current.text)),
      )
      if (match >= 0) {
        if (open) setHighlighted(match)
        else onChange(filtered[match].value)
      }
    }
  }

  return (
    <div className={`select-control ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className="select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && highlighted >= 0 ? `${listId}-${highlighted}` : undefined
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={keyDown}
      >
        <span
          className={`select-value${selected ? "" : " select-placeholder"}`}
          title={selected?.label}
        >
          {selected?.label ?? placeholder}
        </span>
        <span className="select-chevron">
          <Icon name="chevron-down" />
        </span>
      </button>
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="select-popover"
            data-ui-popover="true"
            style={{ position: "fixed", visibility: "hidden" }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            {searchable && (
              <div className="select-search">
                <Icon name="search" />
                <input
                  type="search"
                  tabIndex={-1}
                  aria-label={searchPlaceholder}
                  aria-controls={listId}
                  aria-activedescendant={
                    highlighted >= 0 ? `${listId}-${highlighted}` : undefined
                  }
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={keyDown}
                />
              </div>
            )}
            <div
              ref={listRef}
              id={listId}
              className="select-listbox"
              role="listbox"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
            >
              {filtered.length ? (
                filtered.map((option, index) => (
                  <button
                    type="button"
                    tabIndex={-1}
                    role="option"
                    id={`${listId}-${index}`}
                    key={option.value}
                    className="select-option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled || undefined}
                    data-highlighted={highlighted === index || undefined}
                    onPointerMove={() =>
                      !option.disabled && setHighlighted(index)
                    }
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(option)}
                  >
                    <span>{option.label}</span>
                    {option.value === value && <Icon name="check" />}
                  </button>
                ))
              ) : (
                <p className="select-empty">Không tìm thấy lựa chọn nào</p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
