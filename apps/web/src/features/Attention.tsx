import { useState } from "react"

import type { Food, State } from "../store/appStore"

import {
  attention,
  daysLeft,
  formatDate,
  statusOf,
  today,
} from "../store/appStore"

import Button from "../components/ui/Button"

import EmptyState from "../components/ui/EmptyState"

import {
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Plus,
} from "../components/ui/Icon"

import PageHeader from "../components/ui/PageHeader"

import { getFoodIcon } from "./FoodCard"

export type AttentionReason = "expired" | "soon" | "review"

export function AttentionFoodRow({
  food,

  reason,

  onOpen,
}: {
  food: Food

  reason: AttentionReason

  onOpen: () => void
}) {
  const IconComponent = getFoodIcon(food.name)

  const d = daysLeft(food)

  let reasonText: string

  let reasonClass: string

  if (reason === "expired") {
    const overdue = d !== null ? Math.abs(d) : 1

    reasonText = `Quá hạn ${overdue} ngày`

    reasonClass = "text-status-expired font-medium"
  } else if (reason === "soon") {
    reasonText = d === 0 ? "Hết hạn hôm nay" : `Còn ${d} ngày`

    reasonClass = "text-status-soon font-medium"
  } else {
    reasonText = "Đến hẹn kiểm tra"

    reasonClass = "text-brand-primary font-medium"
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())
      }
      className="group flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover active:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary"
    >
      <div
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-corner-md bg-brand-tertiary text-brand-primary transition-transform group-hover:scale-105 shadow-xs"
      >
        <IconComponent size={22} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm md:text-base font-semibold text-text-primary">
          {food.name}
        </p>
        <p className="truncate text-xs text-text-secondary">
          {food.quantity} {food.unit}
          {food.location ? ` · ${food.location}` : ""}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs">
          <span className={reasonClass}>{reasonText}</span>
          {food.expDate && (
            <span className="whitespace-nowrap text-text-secondary">
              · HSD {formatDate(food.expDate)}
            </span>
          )}
          {reason === "review" && food.reviewAt && !food.expDate && (
            <span className="whitespace-nowrap text-text-secondary">
              · Hẹn {formatDate(food.reviewAt)}
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center text-text-tertiary">
        <ChevronRight
          size={18}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </div>
  )
}

export function Attention({
  state,

  onOpenDetail,

  onNavigateInventory,

  onAdd,
}: {
  state: State

  onOpenDetail: (id: string) => void

  onNavigateInventory: () => void

  onAdd: () => void
}) {
  const list = attention(state)

  const rd = state.settings.remindDays

  const t = today()

  const expired = list.filter((f) => statusOf(f, rd) === "expired")

  const soon = list.filter((f) => statusOf(f, rd) === "soon")

  const reviewDue = list.filter(
    (f) =>
      statusOf(f, rd) !== "expired" &&
      statusOf(f, rd) !== "soon" &&
      f.reviewAt !== undefined &&
      f.reviewAt <= t,
  )

  const totalCount = expired.length + soon.length + reviewDue.length

  const summaryParts: string[] = []

  if (expired.length) summaryParts.push(`${expired.length} quá hạn`)

  if (soon.length) summaryParts.push(`${soon.length} sắp hết hạn`)

  if (reviewDue.length)
    summaryParts.push(`${reviewDue.length} đến hẹn kiểm tra`)

  const subtitle =
    totalCount > 0 ? summaryParts.join(" · ") : "Chưa có món nào cần xử lý"

  const sections: {
    id: string

    title: string

    items: Food[]

    reason: AttentionReason
  }[] = ([
    {
      id: "expired",

      title: "Quá hạn",

      items: expired,

      reason: "expired" as const,
    },

    { id: "soon", title: "Sắp hết hạn", items: soon, reason: "soon" as const },

    {
      id: "review",

      title: "Đến hẹn kiểm tra",

      items: reviewDue,

      reason: "review" as const,
    },
  ] as const).filter((s) => s.items.length > 0)

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const allCollapsed =
    sections.length > 0 && sections.every((s) => collapsed[s.id])

  const toggleAll = () => {
    const nextState = !allCollapsed

    const next: Record<string, boolean> = {}

    for (const s of sections) {
      next[s.id] = nextState
    }

    setCollapsed(next)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader title="Cần chú ý" subtitle={subtitle} />
        {sections.length > 1 && (
          <Button
            size="small"
            variant="neutral"
            onClick={toggleAll}
            className="self-start sm:self-auto"
          >
            {allCollapsed ? "Mở rộng tất cả" : "Thu gọn tất cả"}
          </Button>
        )}
      </div>

      {totalCount === 0 ? (
        <EmptyState
          icon={<CircleCheck size={36} className="text-status-ok" />}
          title="Không có món nào cần chú ý"
          text="Tất cả thực phẩm trong kho của bạn đều đang còn hạn tốt hoặc chưa đến lịch hẹn kiểm tra."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="neutral" onClick={onNavigateInventory}>
                Xem danh sách thực phẩm
              </Button>
              <Button
                variant="primary"
                iconStart={<Plus size={18} />}
                onClick={onAdd}
              >
                Thêm thực phẩm
              </Button>
            </div>
          }
        />
      ) : (
        sections.map((sec) => {
          const isCollapsed = collapsed[sec.id]

          return (
            <section
              key={sec.id}
              aria-labelledby={`sec-${sec.id}`}
              className="flex flex-col gap-2 transition-all"
            >
              <button
                type="button"
                id={`sec-${sec.id}`}
                onClick={() => toggleCollapse(sec.id)}
                aria-expanded={!isCollapsed}
                className="flex items-center justify-between px-2 py-1.5 text-sm md:text-base font-semibold text-text-primary uppercase tracking-wide cursor-pointer hover:text-brand-primary transition-colors group select-none"
              >
                <span className="flex items-center gap-2">
                  <span>{sec.title}</span>
                  <span className="rounded-corner-full bg-surface-hover px-2.5 py-0.5 text-xs font-semibold text-text-secondary border border-border-primary/40">
                    {sec.items.length} món
                  </span>
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-text-tertiary group-hover:text-text-primary">
                  <span>{isCollapsed ? "Phóng ra" : "Thu lại"}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </span>
              </button>

              {!isCollapsed && (
                <div className="flex flex-col divide-y divide-border-primary/40 overflow-hidden rounded-corner-lg border border-border-primary/50 bg-surface-bg shadow-xs transition-all">
                  {sec.items.map((f) => (
                    <AttentionFoodRow
                      key={f.id}
                      food={f}
                      reason={sec.reason}
                      onOpen={() => onOpenDetail(f.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )
        })
      )}
    </div>
  )
}

export default Attention
