import { useMemo, useState } from "react"
import type { Food, State } from "../store/appStore"
import { active, formatDate, statusOf, today } from "../store/appStore"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import EmptyState from "../components/ui/EmptyState"
import FilterChips, { type StatusFilter } from "../components/ui/FilterChips"
import {
  Bell,
  CircleAlert,
  Clock,
  PackageOpen,
  Plus,
  Search,
  SearchX,
  X,
} from "../components/ui/Icon"
import IconButton from "../components/ui/IconButton"
import InputField from "../components/ui/InputField"
import PageHeader from "../components/ui/PageHeader"
import StatusBadge from "../components/ui/StatusBadge"
import FoodCard, { getFoodIcon } from "./FoodCard"

export type InventoryFilters = {
  query: string
  location: string
  lifecycle: "Còn hàng" | "Đã hết" | "Tất cả"
  attentionFilter: import("../domain/types").Attention | "all"
}

export const defaultFilters: InventoryFilters = {
  query: "",
  location: "Tất cả vị trí",
  lifecycle: "Còn hàng",
  attentionFilter: "all",
}

export interface InventoryProps {
  state: State
  onOpenDetail: (id: string) => void
  onAdd: () => void
  onNavigateAttention: () => void
  onOpenNotifications?: () => void
  unreadNotificationsCount?: number
}

function AttentionSummary({
  expired,
  soon,
  reviewDue,
  onOpen,
}: {
  expired: number
  soon: number
  reviewDue: number
  onOpen: () => void
}) {
  const total = expired + soon + reviewDue
  if (total === 0) return null

  return (
    <Card
      role="region"
      aria-label="Tóm tắt món cần chú ý"
      onClick={onOpen}
      className="flex cursor-pointer flex-col gap-2 border-brand-primary/20 bg-brand-tertiary/70 transition-all hover:bg-brand-tertiary shadow-xs"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-brand-primary font-semibold text-sm">
          <CircleAlert size={18} aria-hidden="true" />
          <span>Cần chú ý ({total} món)</span>
        </div>
        <span className="text-xs font-semibold text-brand-primary hover:underline">
          Xem tất cả →
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        {expired > 0 && (
          <span className="inline-flex items-center gap-1 rounded-corner-full bg-status-expired-bg px-2.5 py-0.5 font-semibold text-status-expired border border-status-expired/20">
            <CircleAlert size={12} aria-hidden="true" />
            {expired} quá hạn
          </span>
        )}
        {soon > 0 && (
          <span className="inline-flex items-center gap-1 rounded-corner-full bg-status-soon-bg px-2.5 py-0.5 font-semibold text-status-soon border border-status-soon/20">
            <Clock size={12} aria-hidden="true" />
            {soon} sắp hết hạn
          </span>
        )}
        {reviewDue > 0 && (
          <span className="inline-flex items-center gap-1 rounded-corner-full bg-surface-bg px-2.5 py-0.5 font-semibold text-brand-primary border border-brand-primary/20">
            {reviewDue} đến hẹn kiểm tra
          </span>
        )}
      </div>
    </Card>
  )
}

export function Inventory({
  state,
  onOpenDetail,
  onAdd,
  onNavigateAttention,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}: InventoryProps) {
  const [q, setQ] = useState("")
  const [filter, setFilter] = useState<StatusFilter>("all")

  const remind = state.settings.remindDays
  const items = active(state)
  const t = today()

  const expired = items.filter((f) => statusOf(f, remind) === "expired").length
  const soon = items.filter((f) => statusOf(f, remind) === "soon").length
  const reviewDue = items.filter(
    (f) =>
      statusOf(f, remind) !== "expired" &&
      statusOf(f, remind) !== "soon" &&
      f.reviewAt !== undefined &&
      f.reviewAt <= t,
  ).length

  const list = useMemo(() => {
    const query = q.trim().toLowerCase()
    return items
      .filter((f) => !query || f.name.toLowerCase().includes(query))
      .filter((f) => filter === "all" || statusOf(f, remind) === filter)
      .sort((a, b) => (a.expDate ?? "9999").localeCompare(b.expDate ?? "9999"))
  }, [items, q, filter, remind])

  const clear = () => {
    setQ("")
    setFilter("all")
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Mobile App Header */}
      <div className="flex items-center justify-between gap-3 pt-0 pb-1 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-corner-md bg-brand-primary text-white shadow-xs font-bold text-sm">
            Ex
          </div>
          <span className="text-lg font-bold text-brand-primary">Expiry</span>
        </div>
        {onOpenNotifications && (
          <div className="relative">
            <IconButton
              variant="subtle"
              aria-label={
                unreadNotificationsCount
                  ? `Thông báo, ${unreadNotificationsCount} chưa đọc`
                  : "Thông báo"
              }
              icon={<Bell size={22} />}
              onClick={onOpenNotifications}
            />
            {unreadNotificationsCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-xs"
              >
                {unreadNotificationsCount}
              </span>
            )}
          </div>
        )}
      </div>

      <PageHeader
        title="Thực phẩm"
        subtitle={
          items.length
            ? `${items.length} món đang lưu trữ`
            : "Những thực phẩm bạn đang lưu trữ"
        }
        actions={
          items.length > 0 ? (
            <div className="hidden md:block">
              <Button
                variant="primary"
                iconStart={<Plus size={18} />}
                onClick={onAdd}
              >
                Thêm thực phẩm
              </Button>
            </div>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<PackageOpen size={32} />}
          title="Chưa có thực phẩm nào"
          text="Thêm thực phẩm đầu tiên để bắt đầu theo dõi hạn sử dụng và chống lãng phí."
          action={
            <Button
              variant="primary"
              iconStart={<Plus size={18} />}
              onClick={onAdd}
            >
              Thêm thực phẩm
            </Button>
          }
        />
      ) : (
        <>
          <AttentionSummary
            expired={expired}
            soon={soon}
            reviewDue={reviewDue}
            onOpen={onNavigateAttention}
          />

          <div className="flex flex-col gap-3">
            <InputField
              aria-label="Tìm thực phẩm"
              type="search"
              value={q}
              onChange={setQ}
              placeholder="Tìm thực phẩm theo tên..."
              prefix={<Search size={18} aria-hidden="true" />}
              suffix={
                q ? (
                  <IconButton
                    size="small"
                    variant="subtle"
                    aria-label="Xóa tìm kiếm"
                    icon={<X size={16} />}
                    onClick={() => setQ("")}
                  />
                ) : undefined
              }
            />

            <FilterChips value={filter} onChange={setFilter} />
          </div>

          <section
            aria-labelledby="inv-heading"
            className="flex flex-col gap-3"
          >
            <div className="flex min-h-8 items-center justify-between gap-4">
              <h2
                id="inv-heading"
                className="text-sm font-semibold text-text-primary uppercase tracking-wide"
              >
                Danh sách ({list.length})
              </h2>
              {(q || filter !== "all") && (
                <Button size="small" variant="subtle" onClick={clear}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {list.length === 0 ? (
              <EmptyState
                icon={<SearchX size={32} />}
                title="Không tìm thấy thực phẩm"
                text="Thử từ khóa hoặc bộ lọc khác để tìm kiếm."
                action={
                  <Button variant="neutral" onClick={clear}>
                    Xóa bộ lọc
                  </Button>
                }
              />
            ) : (
              <div>
                {/* Mobile & Tablet: Card list */}
                <div className="flex flex-col divide-y divide-border-primary/40 overflow-hidden rounded-corner-lg border border-border-primary/50 bg-surface-bg shadow-xs lg:hidden">
                  {list.map((f) => (
                    <FoodCard
                      key={f.id}
                      food={f}
                      remindDays={remind}
                      onOpen={() => onOpenDetail(f.id)}
                    />
                  ))}
                </div>

                {/* Desktop: Data Table */}
                <div className="hidden lg:block overflow-x-auto rounded-corner-lg border border-border-primary/50 bg-surface-bg shadow-xs">
                  <table className="w-full border-separate border-spacing-0 text-left text-sm">
                    <thead className="bg-bg-subtle/80 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      <tr>
                        <th scope="col" className="px-5 py-3.5">
                          Thực phẩm
                        </th>
                        <th scope="col" className="px-5 py-3.5">
                          Số lượng
                        </th>
                        <th scope="col" className="px-5 py-3.5">
                          Nơi bảo quản
                        </th>
                        <th scope="col" className="px-5 py-3.5">
                          Hạn sử dụng
                        </th>
                        <th scope="col" className="px-5 py-3.5 text-right">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary/40">
                      {list.map((f) => {
                        const IconComp = getFoodIcon(f.name)
                        return (
                          <tr
                            key={f.id}
                            onClick={() => onOpenDetail(f.id)}
                            className="cursor-pointer transition-colors hover:bg-surface-hover"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <span
                                  aria-hidden="true"
                                  className="flex size-8 shrink-0 items-center justify-center rounded-corner-md bg-brand-tertiary text-brand-primary"
                                >
                                  <IconComp size={18} />
                                </span>
                                <span className="font-semibold text-text-primary hover:text-brand-primary transition-colors">
                                  {f.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-medium text-text-primary">
                              {f.quantity} {f.unit}
                            </td>
                            <td className="px-5 py-3.5 text-text-secondary">
                              {f.location || "—"}
                            </td>
                            <td className="px-5 py-3.5 text-text-primary font-medium">
                              {f.expDate
                                ? formatDate(f.expDate)
                                : "Chưa rõ HSD"}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <StatusBadge food={f} remindDays={remind} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default Inventory
