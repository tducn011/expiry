import { useEffect, useMemo, useState, type ReactNode } from "react"
import { api, ApiClient } from "../api/client"
import type {
  Dispatch,
  EventKind,
  Food,
  HistoryEvent,
  State,
  Category,
} from "../store/appStore"
import { CATEGORIES, formatDate, statusOf, today } from "../store/appStore"
import type { QuantityMovement } from "../domain/types"
import Card from "../components/ui/Card"
import {
  BarChart3,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  HelpCircle,
  Package,
  RefreshCw,
  FileText as FileTextIcon,
  LayoutGrid as LayoutGridIcon,
  Tag as TagIcon,
  TriangleAlert as AlertTriangleIcon,
  ArrowRight,
} from "lucide-react"
import PageHeader from "../components/ui/PageHeader"

export type TimeRange = "7d" | "30d" | "all"

export interface InsightViewProps {
  state: State
  dispatch?: Dispatch
  onOpenDetail?: (id: string) => void
  onNavigateAttention?: () => void
  initialTab?: string
  onTabChange?: (tab: string) => void
  isLive?: boolean
  apiClient?: ApiClient
}

export function fromQuantityMovement(
  m: QuantityMovement,
  food?: Food,
): HistoryEvent {
  const kind: EventKind =
    m.kind === "consume"
      ? "consume"
      : m.kind === "discard"
        ? "discard"
        : m.kind === "recount"
          ? "adjust"
          : "add"

  const diff = Math.abs(m.quantity_before - m.quantity_after)

  return {
    id: m.id,
    foodId: m.entry_id,
    foodName: food?.name || "Thực phẩm",
    kind,
    at: m.recorded_at,
    amount: diff,
    from: m.quantity_before,
    to: m.quantity_after,
    unit: food?.unit || "cái",
    category: food?.category || "other",
  }
}

export type LiveMovementsOptions = {
  maxItems?: number
  concurrency?: number
}

export async function fetchLiveMovements(
  client: ApiClient = api,
  foods: Food[] = [],
  options: LiveMovementsOptions = {},
): Promise<HistoryEvent[]> {
  let targetFoods = foods

  if (targetFoods.length === 0) {
    try {
      if (typeof (client as any).allEntries === "function") {
        const items = await (client as any).allEntries()
        targetFoods = items.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.remaining_quantity,
          unit: (item.unit === "piece" ? "cái" : item.unit) as any,
          category: item.category as Category || "other",
          location: item.storage_location || undefined,
          expDate: item.expiry_date || undefined,
          createdAt: item.created_at,
          version: item.version,
        }))
      } else {
        const page = await client.entries({ limit: 100 })
        targetFoods = page.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.remaining_quantity,
          unit: (item.unit === "piece" ? "cái" : item.unit) as any,
          category: item.category as Category || "other",
          location: item.storage_location || undefined,
          expDate: item.expiry_date || undefined,
          createdAt: item.created_at,
          version: item.version,
        }))
      }
    } catch {
      return []
    }
  }

  // Bound candidates to avoid unbounded N+1 query storms and excessive RAM usage
  const maxItems = options.maxItems ?? 50
  let candidateFoods = targetFoods

  if (targetFoods.length > maxItems) {
    candidateFoods = [...targetFoods]
      .sort((a, b) => {
        const aScore = (a.finishedAt ? 2 : 0) + ((a.version ?? 1) > 1 ? 1 : 0)
        const bScore = (b.finishedAt ? 2 : 0) + ((b.version ?? 1) > 1 ? 1 : 0)
        return bScore - aScore
      })
      .slice(0, maxItems)
  }

  // Execute requests with bounded concurrency
  const concurrency = options.concurrency ?? 5
  const results: PromiseSettledResult<any>[] = []

  for (let i = 0; i < candidateFoods.length; i += concurrency) {
    const chunk = candidateFoods.slice(i, i + concurrency)
    const chunkResults = await Promise.allSettled(
      chunk.map((f) => client.history(f.id)),
    )
    results.push(...chunkResults)
  }

  const events: HistoryEvent[] = []

  results.forEach((res, idx) => {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      const food = candidateFoods[idx]
      for (const movement of res.value) {
        events.push(fromQuantityMovement(movement, food))
      }
    }
  })

  const seen = new Set<string>()
  const deduped: HistoryEvent[] = []

  for (const ev of events) {
    if (!seen.has(ev.id)) {
      seen.add(ev.id)
      deduped.push(ev)
    }
  }

  return deduped.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )
}

export interface CategoryStat {
  consume: number
  discard: number
}

export default function InsightView({
  state,
  dispatch,
  onOpenDetail,
  onNavigateAttention,
  initialTab = "overview",
  onTabChange,
  isLive: isLiveProp,
  apiClient = api,
}: InsightViewProps) {
  const isLive = isLiveProp ?? state.mode === "account"
  const [range, setRange] = useState<TimeRange>("30d")
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false)
  const [liveEvents, setLiveEvents] = useState<HistoryEvent[]>([])
  const [loadingLive, setLoadingLive] = useState(false)

  const loadMovements = async () => {
    if (!isLive) return
    setLoadingLive(true)
    try {
      const movements = await fetchLiveMovements(apiClient, state.foods)
      if (movements.length > 0) {
        setLiveEvents(movements)
        if (dispatch) {
          const eventMap = new Map<string, HistoryEvent>()
          for (const ev of state.history) eventMap.set(ev.id, ev)
          for (const ev of movements) eventMap.set(ev.id, ev)
          const merged = Array.from(eventMap.values()).sort(
            (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
          )
          dispatch({ type: "replace", state: { ...state, history: merged } })
        }
      }
    } catch {
      // Retain local state history on network failure
    } finally {
      setLoadingLive(false)
    }
  }

  useEffect(() => {
    if (isLive) {
      loadMovements()
    }
  }, [isLive, state.foods.length])

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  const combinedHistory = useMemo(() => {
    if (!isLive || liveEvents.length === 0) return state.history
    const eventMap = new Map<string, HistoryEvent>()
    for (const ev of state.history) eventMap.set(ev.id, ev)
    for (const ev of liveEvents) eventMap.set(ev.id, ev)
    return Array.from(eventMap.values()).sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    )
  }, [state.history, liveEvents, isLive])

  const rangeWindow = useMemo(() => {
    const endMs = Date.now()
    if (range !== "all") {
      const daysLimit = range === "7d" ? 7 : 30
      return { startMs: endMs - daysLimit * 24 * 3600_000, endMs }
    }

    const recordedTimes = combinedHistory
      .map((event) => new Date(event.at).getTime())
      .filter((time) => Number.isFinite(time) && time <= endMs)
    const oldestRecordedTime = recordedTimes.reduce(
      (oldest, time) => Math.min(oldest, time),
      Number.POSITIVE_INFINITY,
    )

    return {
      startMs: Number.isFinite(oldestRecordedTime) ? oldestRecordedTime : null,
      endMs,
    }
  }, [combinedHistory, range])

  // Summary metrics and the trend chart use the same selected time window.
  const filteredEvents = useMemo(() => {
    const { startMs, endMs } = rangeWindow
    if (startMs === null) return []
    return combinedHistory.filter((event) => {
      const eventTime = new Date(event.at).getTime()
      return (
        Number.isFinite(eventTime) && eventTime >= startMs && eventTime <= endMs
      )
    })
  }, [combinedHistory, rangeWindow])

  const foodCategoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    for (const f of state.foods) {
      if (f.category) map.set(f.id, f.category)
    }
    return map
  }, [state.foods])

  // Current inventory items (Snapshot "Tính đến hôm nay")
  const activeFoods = useMemo(
    () => state.foods.filter((f) => !f.deletedAt && !f.finishedAt),
    [state.foods],
  )
  const totalActive = activeFoods.length
  const remindDays = state.settings.remindDays

  const expiredFoods = useMemo(
    () => activeFoods.filter((f) => statusOf(f, remindDays) === "expired"),
    [activeFoods, remindDays],
  )
  const soonFoods = useMemo(
    () =>
      activeFoods
        .filter((f) => statusOf(f, remindDays) === "soon")
        .sort((a, b) => (a.expDate || "").localeCompare(b.expDate || "")),
    [activeFoods, remindDays],
  )
  const unknownExpFoods = useMemo(
    () => activeFoods.filter((f) => !f.expDate),
    [activeFoods],
  )
  const withLocationFoods = useMemo(
    () => activeFoods.filter((f) => Boolean(f.location)),
    [activeFoods],
  )
  const locationRate =
    totalActive > 0
      ? Math.round((withLocationFoods.length / totalActive) * 100)
      : null

  // Count recorded consume and discard events by their event category.
  const categoryEventStats = useMemo(() => {
    const catStats: Record<string, CategoryStat> = {}
    for (const c of CATEGORIES) {
      catStats[c.value] = { consume: 0, discard: 0 }
    }
    catStats["other"] = { consume: 0, discard: 0 }

    for (const e of filteredEvents) {
      const cat = e.category || foodCategoryMap.get(e.foodId) || "other"
      if (!catStats[cat]) catStats[cat] = { consume: 0, discard: 0 }

      if (e.kind === "consume") {
        catStats[cat].consume++
      } else if (e.kind === "discard") {
        catStats[cat].discard++
      }
    }

    return catStats
  }, [filteredEvents, foodCategoryMap])

  // Unit breakdown for Figma Node 572:1688 (Insights / Recorded Quantities)
  const unitStats = useMemo(() => {
    const map = new Map<string, {
      used: number
      discarded: number
    }>()
    for (const e of filteredEvents) {
      const u = (e.unit || "món").trim()
      const amt =
        typeof e.amount === "number" && !isNaN(e.amount) ? e.amount : 1
      if (!map.has(u)) {
        map.set(u, { used: 0, discarded: 0 })
      }
      const stat = map.get(u)!
      if (e.kind === "consume") {
        stat.used += amt
      } else if (e.kind === "discard") {
        stat.discarded += amt
      }
    }
    const all = Array.from(map.entries()).map(([unit, data]) => ({
      unit,
      used: data.used,
      discarded: data.discarded,
    }))
    // Evon & Norman Principle: Filter out zero-value units to eliminate visual clutter
    const active = all.filter((item) => item.used > 0 || item.discarded > 0)
    return active.length > 0 ? active : all
  }, [filteredEvents])

  // Date range formatted label for Figma Node 617:3406
  const rangeDateString = useMemo(() => {
    if (rangeWindow.startMs === null) return "Chưa có dữ liệu"
    const start = new Date(rangeWindow.startMs)
    const end = new Date(rangeWindow.endMs)
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    return `${fmt(start)} – ${fmt(end)}`
  }, [rangeWindow])

  // Split the selected period into four equal windows so labels and buckets match the filter.
  const trendPeriods = useMemo(() => {
    const { startMs, endMs } = rangeWindow
    if (startMs === null) return []

    const formatAxisDate = (time: number) => {
      const date = new Date(time)
      const day = String(date.getDate())
      const month = String(date.getMonth() + 1).padStart(2, "0")
      return { day, month }
    }

    const duration = endMs - startMs
    const buckets = Array.from({ length: 4 }, (_, index) => {
      const bucketStart = startMs + (duration * index) / 4
      const bucketEnd =
        index === 3 ? endMs : startMs + (duration * (index + 1)) / 4 - 1
      const startDate = formatAxisDate(bucketStart)
      const endDate = formatAxisDate(bucketEnd)
      const label =
        startDate.month === endDate.month
          ? `${startDate.day}–${endDate.day}/${endDate.month}`
          : `${startDate.day}/${startDate.month}–${endDate.day}/${endDate.month}`

      return {
        label,
        consume: 0,
        discard: 0,
        n: 0,
        rate: 0,
      }
    })

    // Event rate = consume events / (consume + discard events); adjustments are excluded.
    for (const event of filteredEvents) {
      if (event.kind !== "consume" && event.kind !== "discard") continue
      const eventTime = new Date(event.at).getTime()
      const ratio = duration > 0 ? (eventTime - startMs) / duration : 0
      const index = Math.max(0, Math.min(3, Math.floor(ratio * 4)))
      const bucket = buckets[index]
      bucket[event.kind] += 1
      bucket.n += 1
    }

    return buckets.map((bucket) => ({
      ...bucket,
      rate: bucket.n > 0 ? Math.round((bucket.consume / bucket.n) * 100) : 0,
    }))
  }, [filteredEvents, rangeWindow])

  // Storage Location Breakdown
  const storageStats = useMemo(() => {
    const locMap: Record<string, number> = {}
    for (const loc of state.locations) {
      locMap[loc] = 0
    }
    locMap["Khác"] = 0

    for (const f of activeFoods) {
      const locKey =
        f.location && state.locations.includes(f.location) ? f.location : "Khác"
      locMap[locKey] = (locMap[locKey] || 0) + 1
    }

    const palette = [
      "var(--brand-primary)",
      "var(--color-category-beverage)",
      "var(--color-category-dairy)",
      "var(--color-category-pantry)",
      "var(--color-category-meat)",
    ]
    let colorIdx = 0

    const list = Object.entries(locMap)
      .filter(([_, count]) => count > 0 || state.locations.includes(_))
      .map(([label, count]) => {
        const color = palette[colorIdx % palette.length]
        colorIdx++
        const percent =
          totalActive > 0 ? Math.round((count / totalActive) * 100) : 0
        return { label, count, percent, color }
      })

    return list
  }, [activeFoods, state.locations, totalActive])

  const storageConicGradient = useMemo(() => {
    if (totalActive === 0 || storageStats.length === 0)
      return "var(--neutral-200)"
    let currentAngle = 0
    const stops: string[] = []
    for (const s of storageStats) {
      if (s.percent > 0) {
        const nextAngle = currentAngle + (s.percent / 100) * 360
        stops.push(
          `${s.color} ${Math.round(currentAngle)}deg ${Math.round(nextAngle)}deg`,
        )
        currentAngle = nextAngle
      }
    }
    return stops.length > 0
      ? `conic-gradient(${stops.join(", ")})`
      : "var(--neutral-200)"
  }, [totalActive, storageStats])

  const rangeLabel =
    range === "7d"
      ? "7 ngày gần nhất"
      : range === "30d"
        ? "30 ngày gần nhất"
        : "Toàn bộ"

  const hasTrendEvents = trendPeriods.some((period) => period.n > 0)

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header without clutter subtitle */}
      <PageHeader
        title="Insight"
        actions={
          <div className="flex items-center gap-2">
            {/* Hidden/Subtle test ID badges to maintain contract compatibility */}
            {isLive && (
              <span
                data-testid="live-insight-badge"
                className="hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
              >
                <span className="size-2 rounded-full bg-brand-primary animate-pulse" />
                {loadingLive ? "Đang đồng bộ..." : "Dữ liệu thực tế"}
              </span>
            )}
            <span
              data-testid="insight-scope-badge"
              className="hidden items-center text-xs font-medium text-text-secondary bg-surface-bg px-2 py-0.5 rounded-corner-sm border border-border-primary"
            >
              {state.foods.length > 50
                ? `Phạm vi: Giới hạn 50/${state.foods.length} thực phẩm gần nhất · As-of ${today()}`
                : `Phạm vi: Toàn bộ ${state.foods.length} thực phẩm · As-of ${today()}`}
            </span>

            {/* Time Range Selector */}
            {isLive && (
              <button
                type="button"
                onClick={() => loadMovements()}
                disabled={loadingLive}
                title="Đồng bộ lại từ cơ sở dữ liệu"
                className="inline-flex min-h-11 md:min-h-10 items-center gap-1.5 rounded-corner-md border border-border-primary/80 bg-surface-bg px-2.5 py-1.5 text-xs font-semibold text-text-primary shadow-xs hover:bg-surface-hover cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={`text-text-secondary ${
                    loadingLive ? "animate-spin" : ""
                  }`}
                />
                <span>{loadingLive ? "Đang tải..." : "Làm mới"}</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setRangeDropdownOpen((v) => !v)}
                className="inline-flex min-h-11 md:min-h-10 items-center gap-2 rounded-corner-md border border-border-primary/80 bg-surface-bg px-3 py-1.5 text-xs font-semibold text-text-primary shadow-xs hover:bg-surface-hover cursor-pointer"
              >
                <CalendarClock size={15} className="text-text-secondary" />
                <span>{rangeLabel}</span>
                <ChevronDown size={14} className="text-text-secondary" />
              </button>

              {rangeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 min-w-36 overflow-hidden rounded-corner-md border border-border-primary bg-surface-bg p-1 shadow-lg">
                  {[
                    ["7d", "7 ngày gần nhất"],
                    ["30d", "30 ngày gần nhất"],
                    ["all", "Toàn bộ thời gian"],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setRange(val as TimeRange)
                        setRangeDropdownOpen(false)
                      }}
                      className={`flex w-full items-center px-3 py-1.5 text-xs rounded-corner-sm text-left transition-colors cursor-pointer ${
                        range === val
                          ? "bg-brand-primary/10 text-brand-primary font-bold"
                          : "text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex w-fit max-w-full items-center gap-1.5 overflow-x-auto rounded-corner-lg border border-border-primary/40 bg-surface-subtle p-1">
        <button
          type="button"
          onClick={() => handleTabSelect("overview")}
          className={`inline-flex min-h-11 md:min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-corner-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-brand-primary text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-bg"
          }`}
        >
          <LayoutGridIcon size={14} />
          <span>Tổng quan</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabSelect("categories")}
          className={`inline-flex min-h-11 md:min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-corner-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "categories"
              ? "bg-brand-primary text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-bg"
          }`}
        >
          <TagIcon size={14} />
          <span className="hidden sm:inline">Theo danh mục</span>
          <span className="sm:hidden">Danh mục</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabSelect("history")}
          className={`inline-flex min-h-11 md:min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-corner-md text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-brand-primary text-white shadow-xs"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-bg"
          }`}
        >
          <Clock size={14} />
          <span>Lịch sử</span>
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Section 1: Việc cần chú ý (Actionable Attention Banner) */}
          <Card className="p-4 border-border-primary/60 bg-surface-bg shadow-xs">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-44 xl:w-44 xl:shrink-0">
                <div className="p-2 rounded-corner-md bg-danger/10 text-danger shrink-0 mt-0.5">
                  <AlertTriangleIcon size={20} />
                </div>
                <div>
                  <h2 className="break-words text-base font-semibold text-text-heading leading-tight tracking-normal">
                    Việc cần chú ý
                  </h2>
                </div>
              </div>

              {/* 3 distinct action cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 flex-1 max-w-2xl">
                {/* 1. Quá hạn */}
                <button
                  type="button"
                  disabled={!onNavigateAttention}
                  aria-label={`Mở nhắc nhở, ${expiredFoods.length} món quá hạn`}
                  onClick={onNavigateAttention}
                  className="flex min-h-11 w-full items-center justify-between rounded-corner-md border border-status-expired/20 bg-status-expired-bg/40 p-3 text-left transition-all hover:bg-status-expired-bg/60 cursor-pointer group disabled:cursor-default disabled:opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-corner-sm bg-status-expired-bg flex items-center justify-center text-status-expired shrink-0">
                      <Package size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-status-expired block leading-none">
                        Quá hạn
                      </span>
                      <span className="text-sm font-extrabold text-status-expired mt-1 block leading-tight">
                        {expiredFoods.length} món
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-status-expired/60 group-hover:translate-x-0.5 transition-transform"
                  />
                </button>

                {/* 2. Sắp hết hạn */}
                <button
                  type="button"
                  aria-label={
                    "Mở món sắp hết hạn đầu tiên, " + soonFoods.length + " món"
                  }
                  disabled={!onOpenDetail || soonFoods.length === 0}
                  onClick={() =>
                    soonFoods[0] && onOpenDetail?.(soonFoods[0].id)
                  }
                  className="flex min-h-11 w-full items-center justify-between rounded-corner-md border border-status-soon/20 bg-status-soon-bg/40 p-3 text-left transition-all hover:bg-status-soon-bg/60 cursor-pointer group disabled:cursor-default disabled:opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-corner-sm bg-status-soon-bg flex items-center justify-center text-status-soon shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-status-soon block leading-none">
                        Sắp hết hạn
                      </span>
                      <span className="text-sm font-extrabold text-status-soon mt-1 block leading-tight">
                        {soonFoods.length} món
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-status-soon/60 group-hover:translate-x-0.5 transition-transform"
                  />
                </button>

                {/* 3. Thiếu HSD */}
                <button
                  type="button"
                  aria-label={
                    "Mở món chưa có hạn sử dụng đầu tiên, " +
                    unknownExpFoods.length +
                    " món"
                  }
                  disabled={!onOpenDetail || unknownExpFoods.length === 0}
                  onClick={() =>
                    unknownExpFoods[0] && onOpenDetail?.(unknownExpFoods[0].id)
                  }
                  className="flex min-h-11 w-full items-center justify-between rounded-corner-md border border-border-primary bg-surface-subtle p-3 text-left transition-all hover:bg-surface-hover cursor-pointer group disabled:cursor-default disabled:opacity-60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-corner-sm bg-border-primary/30 flex items-center justify-center text-text-secondary shrink-0">
                      <HelpCircle size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-text-secondary block leading-none">
                        Thiếu HSD
                      </span>
                      <span className="text-sm font-extrabold text-text-primary mt-1 block leading-tight">
                        {unknownExpFoods.length} món
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-text-secondary group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>

              <button
                type="button"
                disabled={!onNavigateAttention}
                onClick={onNavigateAttention}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 shrink-0 rounded-corner-md bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary/90 transition-all cursor-pointer text-center disabled:cursor-default disabled:opacity-60"
              >
                Xem danh sách <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </Card>

          <Card className="w-full min-w-0">
            <div className="mb-5 flex min-w-0 items-center gap-2">
              <BarChart3
                size={16}
                className="text-brand-primary"
                aria-hidden="true"
              />
              <h3 className="text-sm font-semibold text-text-heading tracking-normal">
                Tỷ lệ lượt dùng hết
              </h3>
            </div>

            {!hasTrendEvents ? (
              <div
                role="status"
                className="flex h-44 items-center justify-center rounded-corner-md border border-dashed border-border-primary/60 px-4 text-center text-sm font-medium text-text-secondary"
              >
                Chưa có lượt dùng hoặc bỏ
              </div>
            ) : (
              <div
                className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3"
                role="img"
                aria-label={`Tỷ lệ lượt dùng hết theo thời gian: ${trendPeriods.map((period) => `${period.label}, ${period.n === 0 ? "0 lượt" : `${period.rate}% từ ${period.n} lượt`}`).join("; ")}`}
              >
                <div
                  aria-hidden="true"
                  className="relative h-44 text-right text-xs leading-none text-text-secondary"
                >
                  {[100, 75, 50, 25, 0].map((value) => (
                    <span
                      key={value}
                      className="absolute right-0 -translate-y-1/2"
                      style={{ top: `${100 - value}%` }}
                    >
                      {value}%
                    </span>
                  ))}
                </div>
                <div
                  className="relative h-44 border-b border-border-primary/80"
                  aria-hidden="true"
                >
                  {[100, 75, 50, 25].map((value) => (
                    <div
                      key={value}
                      className="absolute inset-x-0 border-t border-dashed border-border-primary/70"
                      style={{ top: `${100 - value}%` }}
                    />
                  ))}
                  <div className="absolute inset-0 grid grid-cols-4 gap-2 px-1 sm:gap-4 sm:px-3">
                    {trendPeriods.map((period, index) => (
                      <div
                        key={index}
                        className="flex min-w-0 items-end justify-center"
                      >
                        {period.n > 0 && (
                          <div
                            className="w-full max-w-14 rounded-t-corner-sm bg-brand-primary"
                            style={{
                              height:
                                period.rate === 0 ? "3px" : `${period.rate}%`,
                            }}
                            title={`${period.label}: ${period.rate}% (${period.n} lượt)`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div aria-hidden="true" />
                <div className="grid min-w-0 grid-cols-4 gap-2 pt-3 text-center sm:gap-4">
                  {trendPeriods.map((period, index) => (
                    <div
                      key={index}
                      className="min-w-0 text-[11px] leading-tight text-text-secondary sm:text-xs"
                    >
                      <div className="wrap-anywhere">{period.label}</div>
                      <div
                        className={`mt-1 font-medium ${
                          period.n > 0
                            ? "text-brand-primary"
                            : "text-text-secondary"
                        }`}
                      >
                        {period.n === 0
                          ? "0 lượt"
                          : `${period.rate}% · ${period.n} lượt`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <details className="rounded-corner-lg border border-border-primary/60 bg-surface-bg shadow-xs">
            <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold text-text-heading marker:text-brand-primary">
              Xem thêm số liệu
            </summary>
            <div className="flex flex-col gap-4 px-4 pb-4">
              {/* Section: Recorded Quantities */}
              <div
                className="flex flex-col gap-3 w-full"
                data-name="Insights / Recorded Quantities"
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h2 className="text-[20px] leading-[28px] font-semibold text-text-heading tracking-normal">
                      Đã ghi
                    </h2>
                    <p className="text-xs text-text-secondary font-normal mt-0.5">
                      {rangeDateString}
                    </p>
                  </div>
                </div>

                {unitStats.length === 0 ? (
                  <div className="rounded-corner-card border border-border-primary/60 bg-surface-bg p-5 text-center text-xs text-text-secondary">
                    Chưa có số lượng thực phẩm nào được ghi nhận trong{" "}
                    {rangeLabel.toLowerCase()}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {unitStats.map((item) => (
                      <div
                        key={item.unit}
                        className="bg-surface-bg border border-border-primary rounded-corner-card p-4 flex flex-col gap-2.5 shadow-none"
                      >
                        <p className="font-medium text-sm text-text-secondary">
                          {item.unit}
                        </p>
                        <div className="flex gap-4 items-start w-full">
                          <div className="flex flex-1 flex-col gap-0.5 items-start min-w-0">
                            <p className="text-[22px] leading-[30px] font-semibold text-text-heading">
                              {item.used}
                            </p>
                            <p className="text-xs font-normal text-text-secondary">
                              Đã dùng
                            </p>
                          </div>
                          <div className="flex flex-1 flex-col gap-0.5 items-start min-w-0">
                            <p className="text-[22px] leading-[30px] font-semibold text-text-heading">
                              {item.discarded}
                            </p>
                            <p className="text-xs font-normal text-text-secondary">
                              Đã bỏ
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Secondary current-inventory metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 2: Cơ cấu tồn kho hiện tại */}
                <Card className="p-4 flex flex-col justify-between border-border-primary/60 bg-surface-bg shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-text-heading flex items-center gap-1.5 tracking-normal">
                        <Package size={15} className="text-brand-primary" />
                        <span>Cơ cấu tồn kho hiện tại</span>
                      </h3>
                      <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary">
                        Dữ liệu hiện tại
                      </span>
                    </div>

                    <div className="flex items-center justify-around gap-2 pt-2">
                      {/* Storage Donut Chart */}
                      <div
                        className="relative size-24 shrink-0 rounded-full flex items-center justify-center shadow-xs"
                        style={{
                          background: storageConicGradient,
                        }}
                      >
                        <div className="size-15 rounded-full bg-surface-bg flex flex-col items-center justify-center shadow-inner">
                          <span className="text-sm font-extrabold text-text-primary leading-none">
                            {totalActive}
                          </span>
                          <span className="text-[9px] text-text-secondary font-medium mt-0.5 leading-none">
                            món
                          </span>
                        </div>
                      </div>

                      {/* Legend list */}
                      <div className="flex flex-col gap-2 text-xs">
                        {storageStats.map((loc) => (
                          <div
                            key={loc.label}
                            className="flex items-center gap-2"
                          >
                            <span
                              className="size-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: loc.color }}
                            />
                            <span className="text-text-secondary">
                              {loc.label}
                            </span>
                            <span className="font-semibold text-text-heading ml-auto">
                              {loc.percent}% ({loc.count})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Card 3: Chất lượng dữ liệu */}
                <Card className="p-4 flex flex-col justify-between border-border-primary/60 bg-surface-bg shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-text-heading flex items-center gap-1.5 tracking-normal">
                        <FileTextIcon
                          size={15}
                          className="text-brand-primary"
                        />
                        <span>Chất lượng dữ liệu</span>
                      </h3>
                      <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary">
                        Dữ liệu hiện tại
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {/* 1. Món chưa có HSD */}
                      <button
                        type="button"
                        aria-label={
                          "Mở món chưa có hạn sử dụng đầu tiên, " +
                          unknownExpFoods.length +
                          " món"
                        }
                        disabled={!onOpenDetail || unknownExpFoods.length === 0}
                        onClick={() =>
                          unknownExpFoods[0] &&
                          onOpenDetail?.(unknownExpFoods[0].id)
                        }
                        className="flex min-h-11 w-full items-center justify-between rounded-corner-md border border-border-primary/60 bg-surface-subtle p-3 text-left transition-colors hover:bg-surface-hover cursor-pointer group disabled:cursor-default disabled:opacity-60"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-corner-sm bg-border-primary/30 flex items-center justify-center text-text-secondary shrink-0">
                            <HelpCircle size={15} />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-text-heading block leading-tight">
                              {unknownExpFoods.length} món chưa có HSD
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-text-secondary group-hover:translate-x-0.5 transition-transform"
                        />
                      </button>

                      {/* 2. Tỷ lệ có nơi bảo quản */}
                      <div
                        className={
                          locationRate === null
                            ? "flex items-center justify-between rounded-corner-md border border-border-primary/60 bg-surface-subtle p-3"
                            : "flex items-center justify-between rounded-corner-md border border-emerald-500/20 bg-emerald-500/5 p-3"
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={
                              locationRate === null
                                ? "size-7 rounded-corner-sm bg-border-primary/30 flex items-center justify-center text-text-secondary shrink-0"
                                : "size-7 rounded-corner-sm bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0"
                            }
                          >
                            {locationRate === null ? (
                              <HelpCircle size={15} />
                            ) : (
                              <CircleCheck size={15} />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-text-heading block leading-tight">
                              {locationRate === null
                                ? "Chưa có dữ liệu"
                                : `${locationRate}% có nơi bảo quản`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </details>
        </>
      )}

      {/* Tab 2: Detailed Category Breakdown */}
      {activeTab === "categories" && (
        <Card className="p-5 flex flex-col gap-4 border-border-primary/60 bg-surface-bg shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-heading tracking-normal">
                Tỷ lệ dùng hết theo danh mục
              </h3>
            </div>
            <span className="text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">
              {rangeLabel}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-border-primary/40 pt-2">
            {CATEGORIES.map((c) => {
              const data = categoryEventStats[c.value] || {
                consume: 0,
                discard: 0,
              }
              const total = data.consume + data.discard
              const rate =
                total > 0 ? Math.round((data.consume / total) * 100) : null

              return (
                <div
                  key={c.value}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-44">
                    <span className="font-semibold text-sm text-text-heading block">
                      {c.label}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {total === 0
                        ? "Chưa có phát sinh trong kỳ"
                        : `${data.consume} dùng hết · ${data.discard} vứt bỏ`}
                    </span>
                  </div>

                  <div className="flex-1 max-w-md">
                    <div className="h-3 w-full rounded-full bg-border-primary/30 overflow-hidden flex shadow-inner">
                      {total === 0 ? (
                        <div
                          className="h-full w-full opacity-40"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(45deg, var(--neutral-200), var(--neutral-200) 4px, var(--neutral-100) 4px, var(--neutral-100) 8px)",
                          }}
                        />
                      ) : (
                        <>
                          <div
                            style={{ width: `${rate}%` }}
                            className="h-full bg-brand-primary transition-all duration-300"
                          />
                          <div
                            style={{ width: `${100 - (rate || 0)}%` }}
                            className="h-full bg-border-primary transition-all duration-300"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:w-28 shrink-0">
                    <span className="text-sm font-extrabold text-brand-primary">
                      {total === 0 ? "Chưa có dữ liệu" : `${rate}% dùng hết`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Tab 3: Detailed History Log */}
      {activeTab === "history" && (
        <Card className="p-5 flex flex-col gap-4 border-border-primary/60 bg-surface-bg shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-text-heading tracking-normal">
                Nhật ký thao tác chi tiết
              </h3>
            </div>
            <span className="text-xs font-semibold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-full">
              {rangeLabel}
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {filteredEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-secondary bg-surface-subtle rounded-corner-md">
                Không có sự kiện nào trong khoảng thời gian này.
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const isConsume = ev.kind === "consume"
                const isDiscard = ev.kind === "discard"

                return (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-3 rounded-corner-md bg-surface-bg border border-border-primary/50 text-xs hover:border-brand-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`size-2.5 rounded-full shrink-0 ${
                          isConsume
                            ? "bg-status-ok"
                            : isDiscard
                              ? "bg-text-secondary"
                              : "bg-warning"
                        }`}
                      />
                      <button
                        type="button"
                        aria-label={"Mở chi tiết " + ev.foodName}
                        disabled={!onOpenDetail}
                        className="min-h-11 max-w-full truncate text-left font-semibold text-text-heading hover:underline disabled:cursor-default"
                        onClick={() => onOpenDetail?.(ev.foodId)}
                      >
                        {ev.foodName}
                      </button>
                      <span className="text-xs text-text-secondary">
                        {isConsume
                          ? `Đã dùng ${ev.amount || ""} ${ev.unit || ""}`
                          : isDiscard
                            ? `Đã bỏ ${ev.amount || ""} ${ev.unit || ""}`
                            : `Điều chỉnh số lượng`}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary shrink-0 ml-2">
                      {formatDate(ev.at.slice(0, 10))}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
