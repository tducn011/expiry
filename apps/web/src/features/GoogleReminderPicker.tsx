import { useEffect, useRef, useState } from "react"

import {
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "../components/ui/Icon"

import { addDays, today } from "../store/appStore"

export interface GoogleReminderPickerProps {
  value?: string // ISO date string YYYY-MM-DD

  onChange: (date: string) => void

  onClear?: () => void
}

export function formatGoogleDate(isoDate: string): string {
  if (!isoDate) return "Chọn ngày nhắc"

  const dt = new Date(isoDate + "T00:00:00")

  if (isNaN(dt.getTime())) return isoDate

  const weekdays = [
    "Chủ nhật",

    "Thứ hai",

    "Thứ ba",

    "Thứ tư",

    "Thứ năm",

    "Thứ sáu",

    "Thứ bảy",
  ]

  const weekday = weekdays[dt.getDay()]

  const day = dt.getDate()

  const month = dt.getMonth() + 1

  return `${weekday}, ${day} tháng ${month}`
}

function formatTime12(time24: string): string {
  if (!time24) return "8:00AM"

  const [hStr, mStr] = time24.split(":")

  let h = parseInt(hStr, 10)

  const ampm = h >= 12 ? "PM" : "AM"

  h = h % 12 || 12

  return `${h}:${mStr}${ampm}`
}

const COMMON_TIMES = [
  "07:00",

  "08:00",

  "09:00",

  "10:00",

  "11:00",

  "12:00",

  "13:00",

  "14:00",

  "15:00",

  "16:00",

  "17:00",

  "18:00",

  "19:00",

  "20:00",
]

export function GoogleReminderPicker({
  value,

  onChange,

  onClear,
}: GoogleReminderPickerProps) {
  const selectedDate = value || today()

  const [startTime, setStartTime] = useState("08:00")

  const [endTime, setEndTime] = useState("09:00")

  const [repeat, setRepeat] = useState("none")

  // Calendar popover state

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false)

  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false)

  // Current calendar view month/year

  const initialDate = value ? new Date(value + "T00:00:00") : new Date()

  const [viewYear, setViewYear] = useState(initialDate.getFullYear())

  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()) // 0-indexed

  const containerRef = useRef<HTMLDivElement>(null)

  // Close popovers on click outside

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsCalendarOpen(false)

        setIsStartTimeOpen(false)

        setIsEndTimeOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sync view year/month when value changes externally

  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00")

      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear())

        setViewMonth(d.getMonth())
      }
    }
  }, [value])

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (viewMonth === 0) {
      setViewMonth(11)

      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (viewMonth === 11) {
      setViewMonth(0)

      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleSelectDay = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0")

    const dd = String(day).padStart(2, "0")

    const iso = `${year}-${mm}-${dd}`

    onChange(iso)

    setIsCalendarOpen(false)
  }

  // Generate calendar matrix (Sunday=0 to Saturday=6)

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

  const calendarDays: Array<{
    year: number

    month: number

    day: number

    isCurrent: boolean

    iso: string
  }> = []

  // Preceding month days

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i

    const m = viewMonth === 0 ? 11 : viewMonth - 1

    const y = viewMonth === 0 ? viewYear - 1 : viewYear

    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`

    calendarDays.push({ year: y, month: m, day: d, isCurrent: false, iso })
  }

  // Current month days

  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`

    calendarDays.push({
      year: viewYear,

      month: viewMonth,

      day: d,

      isCurrent: true,

      iso,
    })
  }

  // Trailing next month days (up to 35 or 42)

  const totalSlots = calendarDays.length <= 35 ? 35 : 42

  const remaining = totalSlots - calendarDays.length

  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1

    const y = viewMonth === 11 ? viewYear + 1 : viewYear

    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`

    calendarDays.push({ year: y, month: m, day: d, isCurrent: false, iso })
  }

  const monthNamesVi = [
    "Tháng 1",

    "Tháng 2",

    "Tháng 3",

    "Tháng 4",

    "Tháng 5",

    "Tháng 6",

    "Tháng 7",

    "Tháng 8",

    "Tháng 9",

    "Tháng 10",

    "Tháng 11",

    "Tháng 12",
  ]

  const dtSelected = new Date(selectedDate + "T00:00:00")

  const weekdaysFull = [
    "Chủ nhật",

    "thứ Hai",

    "thứ Ba",

    "thứ Tư",

    "thứ Năm",

    "thứ Sáu",

    "thứ Bảy",
  ]

  const currentWeekday = !isNaN(dtSelected.getTime())
    ? weekdaysFull[dtSelected.getDay()]
    : "thứ Hai"

  const handleRepeatChange = (opt: string) => {
    setRepeat(opt)

    if (opt === "daily") {
      onChange(addDays(today(), 1))
    } else if (opt === "2days") {
      onChange(addDays(today(), 2))
    } else if (opt === "3days") {
      onChange(addDays(today(), 3))
    } else if (opt === "weekly") {
      onChange(addDays(today(), 7))
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-start gap-4 p-4 rounded-xl border border-border-primary/80 bg-surface-bg/70 hover:border-border-primary transition-all shadow-xs"
    >
      {/* Clock Icon on the left */}
      <div className="pt-1.5 text-text-secondary shrink-0">
        <Clock size={20} aria-hidden="true" />
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Row 1: Date & Time range pills */}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {/* Date pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsCalendarOpen(!isCalendarOpen)

                setIsStartTimeOpen(false)

                setIsEndTimeOpen(false)
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer text-text-primary ${
                isCalendarOpen
                  ? "bg-brand-primary/15 text-brand-primary ring-2 ring-brand-primary"
                  : "bg-surface-secondary hover:bg-surface-tertiary border border-border-primary/60"
              }`}
            >
              {formatGoogleDate(selectedDate)}
            </button>

            {/* Google Calendar Popup Dropdown */}
            {isCalendarOpen && (
              <div className="absolute top-full left-0 z-50 mt-1.5 w-72 rounded-2xl bg-surface-bg border border-border-primary shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-semibold text-sm text-text-primary">
                    {monthNamesVi[viewMonth]}, {viewYear}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                      title="Tháng trước"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                      title="Tháng sau"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Weekday headers: Cn T2 T3 T4 T5 T6 T7 */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-text-secondary mb-2">
                  <span>Cn</span>
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span>T7</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {calendarDays.map((item, idx) => {
                    const isSelected = item.iso === selectedDate

                    const isToday = item.iso === today()

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          handleSelectDay(item.year, item.month, item.day)
                        }
                        className={`size-8 mx-auto flex items-center justify-center rounded-full transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#0b57d0] text-white font-bold shadow-sm"
                            : item.isCurrent
                              ? isToday
                                ? "border border-[#0b57d0] text-brand-primary font-semibold hover:bg-surface-secondary"
                                : "text-text-primary hover:bg-surface-secondary font-medium"
                              : "text-text-secondary/40 hover:bg-surface-secondary"
                        }`}
                      >
                        {item.day}
                      </button>
                    )
                  })}
                </div>

                {/* Quick actions inside calendar popover */}
                <div className="mt-3 pt-3 border-t border-border-primary/60 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(today())

                      setIsCalendarOpen(false)
                    }}
                    className="text-brand-primary font-semibold hover:underline cursor-pointer"
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(addDays(today(), 1))

                      setIsCalendarOpen(false)
                    }}
                    className="text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    Ngày mai
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(addDays(today(), 3))

                      setIsCalendarOpen(false)
                    }}
                    className="text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    +3 ngày
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Time range pills */}
          <div className="flex items-center gap-1.5">
            {/* Start Time Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsStartTimeOpen(!isStartTimeOpen)

                  setIsEndTimeOpen(false)

                  setIsCalendarOpen(false)
                }}
                className="px-2.5 py-1.5 rounded-md font-medium text-text-primary bg-surface-secondary hover:bg-surface-tertiary border border-border-primary/60 transition-colors cursor-pointer"
              >
                {formatTime12(startTime)}
              </button>
              {isStartTimeOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-28 max-h-48 overflow-y-auto rounded-lg bg-surface-bg border border-border-primary shadow-xl p-1 text-xs">
                  {COMMON_TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setStartTime(t)

                        setIsStartTimeOpen(false)
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded transition-colors cursor-pointer ${
                        startTime === t
                          ? "bg-brand-primary text-white font-medium"
                          : "hover:bg-surface-secondary text-text-primary"
                      }`}
                    >
                      {formatTime12(t)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-text-secondary font-medium">–</span>

            {/* End Time Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsEndTimeOpen(!isEndTimeOpen)

                  setIsStartTimeOpen(false)

                  setIsCalendarOpen(false)
                }}
                className="px-2.5 py-1.5 rounded-md font-medium text-text-primary bg-surface-secondary hover:bg-surface-tertiary border border-border-primary/60 transition-colors cursor-pointer"
              >
                {formatTime12(endTime)}
              </button>
              {isEndTimeOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-28 max-h-48 overflow-y-auto rounded-lg bg-surface-bg border border-border-primary shadow-xl p-1 text-xs">
                  {COMMON_TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setEndTime(t)

                        setIsEndTimeOpen(false)
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded transition-colors cursor-pointer ${
                        endTime === t
                          ? "bg-brand-primary text-white font-medium"
                          : "hover:bg-surface-secondary text-text-primary"
                      }`}
                    >
                      {formatTime12(t)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Repeat dropdown & Clear */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="relative inline-block">
            <select
              value={repeat}
              onChange={(e) => handleRepeatChange(e.target.value)}
              className="appearance-none bg-surface-secondary hover:bg-surface-tertiary border border-border-primary/60 text-text-primary font-medium text-xs sm:text-sm rounded-md pl-3 pr-8 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
            >
              <option value="none">Không lặp lại</option>
              <option value="daily">Hằng ngày</option>
              <option value="2days">Sau 2 ngày nữa</option>
              <option value="3days">Sau 3 ngày nữa</option>
              <option value="weekly">Mỗi tuần vào {currentWeekday}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
              <ChevronDown size={14} />
            </div>
          </div>

          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-text-secondary hover:text-danger underline transition-colors cursor-pointer"
            >
              Hủy lịch hẹn
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoogleReminderPicker
