import { useMemo, useState } from "react"
import type { HistoryEvent, State, Category } from "../store/appStore"
import { CATEGORIES, CATEGORY_LABELS, formatDate } from "../store/appStore"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import EmptyState from "../components/ui/EmptyState"
import {
  BarChart3,
  CircleAlert,
  CircleCheck,
  Clock,
  History,
  Package,
  TrendingUp,
} from "../components/ui/Icon"
import PageHeader from "../components/ui/PageHeader"

export interface InsightViewProps {
  state: State
  onOpenDetail?: (id: string) => void
}

type TimeRange = "7d" | "30d" | "all"

interface CategoryStat {
  consume: number
  discard: number
}

export default function InsightView({ state, onOpenDetail }: InsightViewProps) {
  const [range, setRange] = useState<TimeRange>("30d")
  const [showRawHistory, setShowRawHistory] = useState(false)

  // Filter history events by time range
  const filteredEvents = useMemo(() => {
    if (range === "all") return state.history
    const now = Date.now()
    const daysLimit = range === "7d" ? 7 : 30
    const cutoff = now - daysLimit * 24 * 3600_000
    return state.history.filter((e) => new Date(e.at).getTime() >= cutoff)
  }, [state.history, range])

  // Map foodId to Food entity for category lookup
  const foodCategoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    for (const f of state.foods) {
      if (f.category) map.set(f.id, f.category)
    }
    return map
  }, [state.foods])

  // Calculate consumption and waste metrics
  const stats = useMemo(() => {
    let consumeCount = 0
    let discardCount = 0
    let adjustCount = 0

    // Breakdown by category
    const catStats: Record<string, CategoryStat> = {}
    for (const c of CATEGORIES) {
      catStats[c.value] = { consume: 0, discard: 0 }
    }
    catStats["other"] = { consume: 0, discard: 0 }

    for (const e of filteredEvents) {
      const cat = foodCategoryMap.get(e.foodId) || "other"
      if (!catStats[cat]) catStats[cat] = { consume: 0, discard: 0 }

      if (e.kind === "consume") {
        consumeCount++
        catStats[cat].consume++
      } else if (e.kind === "discard") {
        discardCount++
        catStats[cat].discard++
      } else if (e.kind === "adjust") {
        adjustCount++
      }
    }

    const totalDecided = consumeCount + discardCount
    const consumptionRate =
      totalDecided > 0 ? Math.round((consumeCount / totalDecided) * 100) : 100
    const wasteRate = totalDecided > 0 ? 100 - consumptionRate : 0

    // Find most wasted category
    let worstCat: Category | null = null
    let worstWasteCount = 0
    for (const [c, s] of Object.entries(catStats)) {
      if (s.discard > worstWasteCount) {
        worstWasteCount = s.discard
        worstCat = (c as Category)
      }
    }

    return {
      consumeCount,
      discardCount,
      adjustCount,
      totalDecided,
      consumptionRate,
      wasteRate,
      catStats,
      worstCat,
      worstWasteCount,
    }
  }, [filteredEvents, foodCategoryMap])

  const activeFoodCount = state.foods.filter(
    (f) => !f.deletedAt && !f.finishedAt,
  ).length

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Insight & Hiệu quả tiêu dùng"
        subtitle="Đo lường giá trị chống lãng phí và phân tích thói quen mua sắm"
        actions={
          <div className="flex rounded-corner-md border border-border-primary bg-surface-bg p-0.5 text-xs font-semibold">
            {([
              ["7d", "7 ngày"],
              ["30d", "30 ngày"],
              ["all", "Toàn bộ"],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => setRange(v)}
                className={`px-3 py-1.5 rounded-corner-sm transition-all cursor-pointer ${
                  range === v
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="flex flex-col justify-between p-4 bg-brand-primary/5 border-brand-primary/30">
          <div className="flex items-center justify-between text-brand-primary mb-2">
            <span className="text-xs font-semibold">Tỷ lệ dùng hết</span>
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-primary">
              {stats.consumptionRate}%
            </p>
            <p className="text-[11px] text-text-secondary mt-1">
              Mục tiêu: &gt;85%
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-4 bg-status-ok-bg/30 border-status-ok/30">
          <div className="flex items-center justify-between text-status-ok mb-2">
            <span className="text-xs font-semibold">Đã tiêu thụ</span>
            <CircleCheck size={18} />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              {stats.consumeCount}
            </p>
            <p className="text-[11px] text-text-secondary mt-1">
              Lượt dùng trọn vẹn
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-4 bg-danger-subtle/40 border-danger/30">
          <div className="flex items-center justify-between text-danger mb-2">
            <span className="text-xs font-semibold">Đã vứt bỏ</span>
            <CircleAlert size={18} />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-danger">
              {stats.discardCount}
            </p>
            <p className="text-[11px] text-text-secondary mt-1">
              Lãng phí do hỏng/quên
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-4 bg-surface-bg border-border-primary">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-semibold">Đang bảo quản</span>
            <Package size={18} />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-text-primary">
              {activeFoodCount}
            </p>
            <p className="text-[11px] text-text-secondary mt-1">
              Món trong tủ lúc này
            </p>
          </div>
        </Card>
      </div>

      {/* Consumption vs Waste Visual Ratio Bar */}
      <Card className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-text-primary">
            Cân bằng: Đã dùng ({stats.consumptionRate}%) vs Đã bỏ (
            {stats.wasteRate}%)
          </span>
          <span className="text-xs text-text-secondary">
            Tổng cộng: {stats.totalDecided} món đã xử lý
          </span>
        </div>

        <div className="h-4 w-full rounded-full bg-danger/20 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${stats.consumptionRate}%` }}
            className="h-full bg-brand-primary transition-all duration-500 flex items-center justify-end pr-2"
          >
            {stats.consumptionRate > 15 && (
              <span className="text-[10px] font-bold text-white leading-none">
                {stats.consumptionRate}%
              </span>
            )}
          </div>
          {stats.wasteRate > 15 && (
            <div className="h-full flex items-center pl-2">
              <span className="text-[10px] font-bold text-danger leading-none">
                {stats.wasteRate}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-brand-primary inline-block" />
            Đã tiêu thụ thành công
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-danger inline-block" />
            Đã vứt bỏ do hỏng / quá hạn
          </span>
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-primary" />
            <span>Phân tích theo danh mục</span>
          </h3>
          <span className="text-xs text-text-secondary">
            Hiệu suất từng nhóm
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORIES.map((c) => {
            const data = stats.catStats[c.value] || { consume: 0, discard: 0 }
            const total = data.consume + data.discard
            const catRate =
              total > 0 ? Math.round((data.consume / total) * 100) : 100

            return (
              <div key={c.value} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-primary">
                    {c.label}
                  </span>
                  <span className="text-text-secondary">
                    {data.consume} dùng · {data.discard} bỏ (
                    {total > 0 ? `${catRate}% dùng` : "Chưa có dữ liệu"})
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-border-primary/50 overflow-hidden flex">
                  {total === 0 ? (
                    <div className="h-full w-full bg-border-primary/30" />
                  ) : (
                    <>
                      <div
                        style={{ width: `${catRate}%` }}
                        className="h-full bg-brand-primary"
                      />
                      <div
                        style={{ width: `${100 - catRate}%` }}
                        className="h-full bg-danger"
                      />
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Smart Advice Box */}
      <div className="rounded-corner-md border border-brand-primary/30 bg-brand-primary/5 p-4 text-xs md:text-sm text-text-primary shadow-xs flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div className="flex-1 leading-relaxed">
          <p className="font-bold text-brand-primary mb-1">
            Gợi ý tối ưu thực đơn & bảo quản:
          </p>
          {stats.worstCat && stats.worstWasteCount > 0 ? (
            <p>
              Nhóm{" "}
              <strong className="underline">
                {CATEGORY_LABELS[stats.worstCat] || stats.worstCat}
              </strong>{" "}
              đang có tỷ lệ bị vứt bỏ cao nhất ({stats.worstWasteCount} lần).
              Hãy ưu tiên chế biến nhóm này trước vào các bữa ăn giữa tuần hoặc
              chia nhỏ đông lạnh ngay khi mua về!
            </p>
          ) : (
            <p>
              Tuyệt vời! Bạn đang duy trì tỷ lệ sử dụng thực phẩm rất tốt. Tiếp
              tục kiểm tra tab <strong>Lưu trữ</strong> thường xuyên để giữ thói
              quen sử dụng thông minh nhé!
            </p>
          )}
        </div>
      </div>

      {/* Detailed History Log (Collapsible) */}
      <Card className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowRawHistory((v) => !v)}
            className="flex items-center gap-2 text-sm font-bold text-text-primary hover:text-brand-primary cursor-pointer text-left"
          >
            <History size={18} className="text-text-secondary" />
            <span>
              Nhật ký thao tác chi tiết ({filteredEvents.length} bản ghi)
            </span>
            <span className="text-xs text-brand-primary font-normal">
              {showRawHistory ? "▲ Thu gọn" : "▼ Xem chi tiết"}
            </span>
          </button>
        </div>

        {showRawHistory && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border-primary/50">
            {filteredEvents.length === 0 ? (
              <p className="text-xs text-text-secondary py-3 text-center">
                Không có sự kiện nào trong khoảng thời gian này.
              </p>
            ) : (
              filteredEvents.map((ev) => {
                const isConsume = ev.kind === "consume"
                const isDiscard = ev.kind === "discard"
                return (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-2.5 rounded-corner-sm bg-surface-bg border border-border-primary/50 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`size-2 rounded-full shrink-0 ${
                          isConsume
                            ? "bg-status-ok"
                            : isDiscard
                              ? "bg-danger"
                              : "bg-warning"
                        }`}
                      />
                      <span
                        className="font-semibold text-text-primary truncate cursor-pointer hover:underline"
                        onClick={() => onOpenDetail && onOpenDetail(ev.foodId)}
                      >
                        {ev.foodName}
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        {isConsume
                          ? `Đã dùng ${ev.amount || ""} ${ev.unit || ""}`
                          : isDiscard
                            ? `Đã bỏ ${ev.amount || ""} ${ev.unit || ""}`
                            : `Điều chỉnh số lượng`}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-secondary shrink-0 ml-2">
                      {formatDate(ev.at.slice(0, 10))}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
