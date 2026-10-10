import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { createPortal } from "react-dom"
import Icon from "./Icon"

type CalendarView = "days" | "months" | "years"

type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
  placeholder?: string
  clearable?: boolean
  clearLabel?: string
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean | "true" | "false"
}

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
const fullDateFormat = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

function dateAt(year: number, month: number, day = 1) {
  const date = new Date(0)
  date.setHours(12, 0, 0, 0)
  date.setFullYear(year, month, day)
  return date
}

function toISO(date: Date) {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function fromISO(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = dateAt(year, month, day)
  return year > 0 && toISO(date) === value ? date : null
}

function inMonth(date: Date, year: number, month: number) {
  const lastDay = dateAt(year, month + 1, 0).getDate()
  return dateAt(year, month, Math.min(date.getDate(), lastDay))
}

function offsetDate(date: Date, days: number) {
  return dateAt(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function sameDate(left: Date, right: Date) {
  return toISO(left) === toISO(right)
}

/** Date-only input. Selection stays in local calendar dates and emits the existing ISO contract. */
export default function DatePicker({
  value,
  onChange,
  disabled = false,
  id,
  className = "",
  placeholder = "Chọn ngày",
  clearable = true,
  clearLabel = "Xoá ngày",
  "aria-label": ariaLabel = "Chọn ngày",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const generatedId = useId()
  const popoverId = `${generatedId}-calendar`
  const today = useRef(
    dateAt(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
    ),
  ).current
  const selected = fromISO(value)
  const initialDate = selected ?? today
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<CalendarView>("days")
  const [shownMonth, setShownMonth] = useState(() =>
    dateAt(initialDate.getFullYear(), initialDate.getMonth()),
  )
  const [focusedDate, setFocusedDate] = useState(initialDate)
  const [focusedMonth, setFocusedMonth] = useState(initialDate.getMonth())
  const [focusedYear, setFocusedYear] = useState(initialDate.getFullYear())
  const [yearStart, setYearStart] = useState(
    Math.max(1, initialDate.getFullYear() - 6),
  )
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const close = (restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  const openCalendar = () => {
    if (disabled) return
    const date = fromISO(value) ?? today
    setShownMonth(dateAt(date.getFullYear(), date.getMonth()))
    setFocusedDate(date)
    setFocusedMonth(date.getMonth())
    setFocusedYear(date.getFullYear())
    setYearStart(Math.max(1, Math.min(9988, date.getFullYear() - 6)))
    setView("days")
    setOpen(true)
  }

  const showDate = (date: Date) => {
    if (date.getFullYear() < 1 || date.getFullYear() > 9999) return
    setFocusedDate(date)
    setShownMonth(dateAt(date.getFullYear(), date.getMonth()))
  }

  const navigate = (direction: -1 | 1) => {
    if (view === "days") {
      showDate(
        inMonth(
          focusedDate,
          shownMonth.getFullYear(),
          shownMonth.getMonth() + direction,
        ),
      )
    } else if (view === "months") {
      const year = shownMonth.getFullYear() + direction
      if (year >= 1 && year <= 9999)
        setShownMonth(dateAt(year, shownMonth.getMonth()))
    } else {
      const start = Math.max(1, Math.min(9988, yearStart + direction * 12))
      setYearStart(start)
      setFocusedYear(
        Math.max(start, Math.min(start + 11, focusedYear + direction * 12)),
      )
    }
  }

  const selectDate = (date: Date) => {
    onChange(toISO(date))
    close()
  }

  useEffect(() => {
    if (!open) return
    const isWithin = (target: EventTarget | null) =>
      target instanceof Node &&
      (triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target))
    const dismissOutside = (event: PointerEvent) => {
      if (!isWithin(event.target)) setOpen(false)
    }
    const dismissOnFocus = (event: FocusEvent) => {
      if (!isWithin(event.target)) setOpen(false)
    }
    const dismissOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener("pointerdown", dismissOutside, true)
    document.addEventListener("focusin", dismissOnFocus)
    document.addEventListener("keydown", dismissOnEscape, true)
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true)
      document.removeEventListener("focusin", dismissOnFocus)
      document.removeEventListener("keydown", dismissOnEscape, true)
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    const popover = popoverRef.current
    const trigger = triggerRef.current
    if (!popover || !trigger) return
    let positioning = false
    let scrollBuffer: {
      element: HTMLElement
      paddingBottom: string
      basePadding: number
      scrollTop: number
      extra: number
    } | null = null
    const scrollContainer = () => {
      let ancestor = trigger.parentElement
      while (ancestor) {
        if (/(auto|scroll|overlay)/.test(getComputedStyle(ancestor).overflowY))
          return ancestor
        ancestor = ancestor.parentElement
      }
      return document.scrollingElement instanceof HTMLElement
        ? document.scrollingElement
        : null
    }
    const position = () => {
      if (positioning) return
      positioning = true
      const padding = 12
      const gap = 8
      const viewport = window.visualViewport
      const viewportTop = viewport?.offsetTop ?? 0
      const viewportLeft = viewport?.offsetLeft ?? 0
      const viewportHeight = viewport?.height ?? window.innerHeight
      const viewportWidth = viewport?.width ?? window.innerWidth
      popover.style.maxWidth = `${Math.max(0, viewportWidth - padding * 2)}px`
      let triggerRect = trigger.getBoundingClientRect()
      const popoverRect = popover.getBoundingClientRect()
      let below =
        viewportTop + viewportHeight - triggerRect.bottom - gap - padding
      let above = triggerRect.top - viewportTop - gap - padding
      if (Math.max(below, above) < popoverRect.height) {
        trigger.scrollIntoView({ block: "start", inline: "nearest" })
        triggerRect = trigger.getBoundingClientRect()
        below =
          viewportTop + viewportHeight - triggerRect.bottom - gap - padding
        above = triggerRect.top - viewportTop - gap - padding
        // A short form can run out of scroll range before its trigger leaves
        // enough room for the calendar. Reserve only the missing space while
        // open, then restore the form's original padding and position.
        if (Math.max(below, above) < popoverRect.height) {
          const container = scrollBuffer?.element ?? scrollContainer()
          if (container) {
            const containerTop =
              container === document.scrollingElement
                ? viewportTop
                : container.getBoundingClientRect().top
            const availableShift = Math.max(
              0,
              triggerRect.top - Math.max(viewportTop, containerTop) - padding,
            )
            const shift = Math.ceil(
              Math.min(popoverRect.height - below, availableShift),
            )
            if (shift > 0) {
              if (!scrollBuffer)
                scrollBuffer = {
                  element: container,
                  paddingBottom: container.style.paddingBottom,
                  basePadding:
                    parseFloat(getComputedStyle(container).paddingBottom) || 0,
                  scrollTop: container.scrollTop,
                  extra: 0,
                }
              scrollBuffer.extra += shift
              container.style.paddingBottom = `${scrollBuffer.basePadding + scrollBuffer.extra}px`
              container.scrollTop += shift
              triggerRect = trigger.getBoundingClientRect()
              below =
                viewportTop +
                viewportHeight -
                triggerRect.bottom -
                gap -
                padding
              above = triggerRect.top - viewportTop - gap - padding
            }
          }
        }
      }
      const openAbove = below < popoverRect.height && above > below
      const top = openAbove
        ? triggerRect.top - popoverRect.height - gap
        : triggerRect.bottom + gap
      const left = Math.max(
        viewportLeft + padding,
        Math.min(
          triggerRect.left,
          viewportLeft + viewportWidth - popoverRect.width - padding,
        ),
      )
      popover.style.left = `${left}px`
      popover.style.top = `${top}px`
      popover.style.visibility = "visible"
      popover.dataset.side = openAbove ? "top" : "bottom"
      positioning = false
    }
    position()
    const resizeObserver = new ResizeObserver(position)
    resizeObserver.observe(popover)
    window.addEventListener("resize", position)
    window.addEventListener("scroll", position, true)
    window.visualViewport?.addEventListener("resize", position)
    window.visualViewport?.addEventListener("scroll", position)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", position)
      window.removeEventListener("scroll", position, true)
      window.visualViewport?.removeEventListener("resize", position)
      window.visualViewport?.removeEventListener("scroll", position)
      if (scrollBuffer) {
        scrollBuffer.element.style.paddingBottom = scrollBuffer.paddingBottom
        scrollBuffer.element.scrollTop = scrollBuffer.scrollTop
      }
    }
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    const selector =
      view === "days"
        ? `[data-date="${toISO(focusedDate)}"]`
        : view === "months"
          ? `[data-month="${focusedMonth}"]`
          : `[data-year="${focusedYear}"]`
    popoverRef.current
      ?.querySelector<HTMLButtonElement>(selector)
      ?.focus({ preventScroll: true })
  }, [
    open,
    view,
    focusedDate,
    focusedMonth,
    focusedYear,
    shownMonth,
    yearStart,
  ])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  const handleDayKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    date: Date,
  ) => {
    let next: Date | null = null
    if (event.key === "ArrowLeft") next = offsetDate(date, -1)
    if (event.key === "ArrowRight") next = offsetDate(date, 1)
    if (event.key === "ArrowUp") next = offsetDate(date, -7)
    if (event.key === "ArrowDown") next = offsetDate(date, 7)
    if (event.key === "Home")
      next = offsetDate(date, -((date.getDay() + 6) % 7))
    if (event.key === "End")
      next = offsetDate(date, 6 - ((date.getDay() + 6) % 7))
    if (event.key === "PageUp")
      next = inMonth(
        date,
        date.getFullYear() - (event.shiftKey ? 1 : 0),
        date.getMonth() - (event.shiftKey ? 0 : 1),
      )
    if (event.key === "PageDown")
      next = inMonth(
        date,
        date.getFullYear() + (event.shiftKey ? 1 : 0),
        date.getMonth() + (event.shiftKey ? 0 : 1),
      )
    if (!next) return
    event.preventDefault()
    showDate(next)
  }

  const containTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return
    const controls = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      ),
    ).filter(
      (button) =>
        button.tabIndex >= 0 &&
        button.getClientRects().length > 0 &&
        getComputedStyle(button).visibility !== "hidden",
    )
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus({ preventScroll: true })
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus({ preventScroll: true })
    }
  }

  const handlePeriodKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    period: number,
  ) => {
    let next = period
    if (event.key === "ArrowLeft") next -= 1
    else if (event.key === "ArrowRight") next += 1
    else if (event.key === "ArrowUp") next -= 4
    else if (event.key === "ArrowDown") next += 4
    else if (event.key === "Home") next = view === "months" ? 0 : yearStart
    else if (event.key === "End") next = view === "months" ? 11 : yearStart + 11
    else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault()
      navigate(event.key === "PageUp" ? -1 : 1)
      return
    } else return
    event.preventDefault()
    if (view === "months") {
      if (next < 0 || next > 11) {
        const year = shownMonth.getFullYear() + (next < 0 ? -1 : 1)
        if (year < 1 || year > 9999) return
        setShownMonth(dateAt(year, shownMonth.getMonth()))
      }
      setFocusedMonth((next + 12) % 12)
    } else {
      if (next < 1 || next > 9999) return
      if (next < yearStart) setYearStart(Math.max(1, yearStart - 12))
      if (next > yearStart + 11) setYearStart(Math.min(9988, yearStart + 12))
      setFocusedYear(next)
    }
  }

  const monthYear = `Tháng ${shownMonth.getMonth() + 1}, ${shownMonth.getFullYear()}`
  const first = dateAt(shownMonth.getFullYear(), shownMonth.getMonth())
  const gridStart = offsetDate(first, -((first.getDay() + 6) % 7))
  const days = Array.from({ length: 42 }, (_, index) =>
    offsetDate(gridStart, index),
  )
  const displayValue = selected
    ? `${String(selected.getDate()).padStart(2, "0")}/${String(selected.getMonth() + 1).padStart(2, "0")}/${selected.getFullYear()}`
    : placeholder

  return (
    <span className={`date-picker ${className}`.trim()}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="date-picker-trigger"
        disabled={disabled}
        aria-label={value ? `${ariaLabel}: ${displayValue}` : ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => (open ? close() : openCalendar())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault()
            openCalendar()
          }
        }}
      >
        <span className={`date-picker-value${selected ? "" : " placeholder"}`}>
          {displayValue}
        </span>
        <Icon name="calendar" />
      </button>
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            id={popoverId}
            className="date-picker-popover"
            role="dialog"
            aria-label={ariaLabel}
            data-ui-popover="true"
            style={{ position: "fixed", visibility: "hidden" }}
            onKeyDown={containTab}
          >
            <div className="date-picker-header">
              <button
                type="button"
                className="date-picker-title"
                onClick={() => {
                  if (view === "days") {
                    setFocusedMonth(shownMonth.getMonth())
                    setView("months")
                  } else if (view === "months") {
                    setYearStart(
                      Math.max(1, Math.min(9988, shownMonth.getFullYear() - 6)),
                    )
                    setFocusedYear(shownMonth.getFullYear())
                    setView("years")
                  } else setView("days")
                }}
                aria-label={
                  view === "days"
                    ? "Chọn tháng và năm"
                    : view === "months"
                      ? "Chọn năm"
                      : "Trở lại lịch tháng"
                }
              >
                <span>
                  {view === "days"
                    ? monthYear
                    : view === "months"
                      ? shownMonth.getFullYear()
                      : `${yearStart}–${yearStart + 11}`}
                </span>
                <Icon name="chevron-down" />
              </button>
              <div className="date-picker-navigation">
                <button
                  type="button"
                  className="icon-button"
                  aria-label={
                    view === "days"
                      ? "Tháng trước"
                      : view === "months"
                        ? "Năm trước"
                        : "12 năm trước"
                  }
                  onClick={() => navigate(-1)}
                >
                  <Icon name="chevron-left" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={
                    view === "days"
                      ? "Tháng sau"
                      : view === "months"
                        ? "Năm sau"
                        : "12 năm sau"
                  }
                  onClick={() => navigate(1)}
                >
                  <Icon name="chevron-right" />
                </button>
              </div>
            </div>
            <div className="date-picker-body">
              <div
                className="date-picker-days"
                aria-hidden={view !== "days"}
                style={view === "days" ? undefined : { visibility: "hidden" }}
              >
                <div className="date-picker-weekdays" aria-hidden="true">
                  {weekDays.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div
                  className="date-picker-grid"
                  role="group"
                  aria-label={monthYear}
                >
                  {days.map((date) => {
                    const iso = toISO(date)
                    const isSelected =
                      selected !== null && sameDate(date, selected)
                    const isToday = sameDate(date, today)
                    const isOutOfRange =
                      date.getFullYear() < 1 || date.getFullYear() > 9999
                    return (
                      <button
                        key={iso}
                        type="button"
                        className={`date-picker-day${
                          date.getMonth() !== shownMonth.getMonth()
                            ? " outside-month"
                            : ""
                        }${isSelected ? " selected" : ""}${
                          isToday ? " today" : ""
                        }`}
                        data-date={iso}
                        aria-label={fullDateFormat.format(date)}
                        aria-pressed={isSelected}
                        aria-current={isToday ? "date" : undefined}
                        tabIndex={
                          view === "days" && sameDate(date, focusedDate)
                            ? 0
                            : -1
                        }
                        disabled={isOutOfRange}
                        onKeyDown={(event) => handleDayKey(event, date)}
                        onClick={() => selectDate(date)}
                      >
                        {date.getDate()}
                        {isToday && (
                          <span
                            className="date-picker-today-dot"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              {view === "months" && (
                <div
                  className="date-picker-layer date-picker-month-grid"
                  role="group"
                  aria-label={`Tháng trong năm ${shownMonth.getFullYear()}`}
                >
                  {Array.from({ length: 12 }, (_, month) => (
                    <button
                      key={month}
                      type="button"
                      className={`date-picker-period${
                        month === shownMonth.getMonth() ? " selected" : ""
                      }${
                        month === today.getMonth() &&
                        shownMonth.getFullYear() === today.getFullYear()
                          ? " today"
                          : ""
                      }`}
                      data-month={month}
                      aria-label={`Tháng ${month + 1}, ${shownMonth.getFullYear()}`}
                      aria-pressed={month === shownMonth.getMonth()}
                      tabIndex={month === focusedMonth ? 0 : -1}
                      onKeyDown={(event) => handlePeriodKey(event, month)}
                      onClick={() => {
                        showDate(
                          inMonth(focusedDate, shownMonth.getFullYear(), month),
                        )
                        setView("days")
                      }}
                    >
                      Th{month + 1}
                      {month === today.getMonth() &&
                        shownMonth.getFullYear() === today.getFullYear() && (
                          <span
                            className="date-picker-today-dot"
                            aria-hidden="true"
                          />
                        )}
                    </button>
                  ))}
                </div>
              )}
              {view === "years" && (
                <div
                  className="date-picker-layer date-picker-year-grid"
                  role="group"
                  aria-label={`Năm ${yearStart} đến ${yearStart + 11}`}
                >
                  {Array.from(
                    { length: 12 },
                    (_, index) => yearStart + index,
                  ).map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={`date-picker-period${
                        year === shownMonth.getFullYear() ? " selected" : ""
                      }${year === today.getFullYear() ? " today" : ""}`}
                      data-year={year}
                      aria-pressed={year === shownMonth.getFullYear()}
                      tabIndex={year === focusedYear ? 0 : -1}
                      onKeyDown={(event) => handlePeriodKey(event, year)}
                      onClick={() => {
                        showDate(
                          inMonth(focusedDate, year, shownMonth.getMonth()),
                        )
                        setView("days")
                      }}
                    >
                      {year}
                      {year === today.getFullYear() && (
                        <span
                          className="date-picker-today-dot"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {clearable && selected && (
              <div className="date-picker-footer">
                <button
                  type="button"
                  className="date-picker-clear"
                  onClick={() => {
                    onChange("")
                    close()
                  }}
                >
                  <Icon name="calendar-x" />
                  <span>{clearLabel}</span>
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </span>
  )
}
