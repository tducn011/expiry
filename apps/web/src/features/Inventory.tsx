import { useMemo, useState } from "react"

import type { Food, State } from "../store/appStore"

import {
  CATEGORIES,
  active,
  formatDate,
  statusOf,
  today,
} from "../store/appStore"

import Button from "../components/ui/Button"

import EmptyState from "../components/ui/EmptyState"

import {
  FilterDropdown,
  defaultHsdOptions,
  type StatusFilter,
} from "../components/ui/FilterChips"

import {
  ChevronDown,
  ChevronRight,
  PackageOpen,
  Plus,
  Search,
  SearchX,
  X,
} from "lucide-react"

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

const inventoryHsdOptions = defaultHsdOptions

export type HomeFilters = {
  query: string
  status: StatusFilter
  category: string
  location: string
}

const initialHomeFilters: HomeFilters = {
  query: "",
  status: "all",
  category: "all",
  location: "all",
}

export interface InventoryProps {
  state: State
  filters?: HomeFilters
  onFiltersChange: (filters: HomeFilters) => void

  onOpenDetail: (id: string) => void

  onAdd: () => void

  onNavigateAttention: () => void
}

function AttentionSummary({
  expiredFoods,
  soonFoods,
  reviewDue,
  defaultExpanded,
  remindDays,
  onOpenDetail,
  onReview,
}: {
  expiredFoods: Food[]
  soonFoods: Food[]
  reviewDue: number
  defaultExpanded: State["settings"]["homeAttentionExpanded"]
  remindDays: number
  onOpenDetail: (id: string) => void
  onReview: () => void
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const expired = expiredFoods.length
  const soon = soonFoods.length
  const total = expired + soon + reviewDue
  if (!total) return null

  const renderGroup = (
    key: "expired" | "soon",
    label: string,
    foods: Food[],
    tone: string,
  ) => {
    if (!foods.length) return null
    const expandedId = `home-attention-${key}-foods`
    const isExpanded = expanded[key]

    return (
      <section className="home-attention-group" key={key}>
        <h3 className="m-0">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={expandedId}
            onClick={() =>
              setExpanded((current) => ({ ...current, [key]: !current[key] }))
            }
            className={`home-attention-group-toggle ${tone}`}
          >
            <span>
              {label} <span className="font-normal">· {foods.length} món</span>
            </span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`shrink-0 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </h3>
        <div
          id={expandedId}
          role="region"
          aria-label={`${label} (${foods.length} món)`}
          hidden={!isExpanded}
          className="home-attention-foods"
        >
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              variant="grouped"
              remindDays={remindDays}
              onOpen={() => onOpenDetail(food.id)}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="home-attention-heading"
      className="home-attention"
    >
      <h2
        id="home-attention-heading"
        className="text-sm font-semibold text-text-heading"
      >
        Cần xử lý{" "}
        <span className="ml-1 font-normal text-text-secondary">
          {total} món
        </span>
      </h2>
      <div className="home-attention-groups">
        {renderGroup("expired", "Quá hạn", expiredFoods, "text-status-expired")}
        {renderGroup("soon", "Sắp hết hạn", soonFoods, "text-status-soon")}
        {reviewDue > 0 && (
          <button
            type="button"
            aria-label={`Kiểm tra ${reviewDue} món đến hẹn`}
            onClick={onReview}
            className="home-attention-action home-attention-review text-brand-primary"
          >
            Kiểm tra {reviewDue} món đến hẹn
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}

export function Inventory({
  state,
  filters = initialHomeFilters,
  onFiltersChange,

  onOpenDetail,

  onAdd,

  onNavigateAttention,
}: InventoryProps) {
  const {
    query: q,
    status: filterHsd,
    category: selectedCategory,
    location: selectedLocation,
  } = filters

  const categoryOptions = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        v: c.value,

        label: c.label,
      })),

    [],
  )

  const locationOptions = useMemo(() => {
    const locs = state.locations.map((loc) => ({
      v: loc,

      label: loc,
    }))

    locs.push({ v: "Khác", label: "Khác" })

    return locs
  }, [state.locations])

  const remind = state.settings.remindDays

  const activeItems = active(state)

  const items = activeItems

  const t = today()

  const todayLabel = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${t}T12:00:00+07:00`))

  const expired = activeItems
    .filter((f) => statusOf(f, remind) === "expired")
    .sort((a, b) => (a.expDate || "").localeCompare(b.expDate || ""))

  const soon = activeItems
    .filter((f) => statusOf(f, remind) === "soon")
    .sort((a, b) => (a.expDate || "").localeCompare(b.expDate || ""))

  const reviewDue = activeItems.filter(
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

      .filter((f) => filterHsd === "all" || statusOf(f, remind) === filterHsd)

      .filter((f) => {
        if (selectedCategory === "all") return true

        return f.category === selectedCategory
      })

      .filter((f) => {
        if (selectedLocation === "all") return true

        if (selectedLocation === "Khác") {
          return !f.location || !state.locations.includes(f.location)
        }

        return f.location === selectedLocation
      })

      .sort((a, b) => {
        const priority = (food: Food) => {
          const status = statusOf(food, remind)
          return status === "expired"
            ? 0
            : status === "soon"
              ? 1
              : status === "ok"
                ? 2
                : 3
        }

        return (
          priority(a) - priority(b) ||
          (a.expDate ?? "9999").localeCompare(b.expDate ?? "9999")
        )
      })
  }, [
    items,
    q,
    filterHsd,
    selectedCategory,
    selectedLocation,
    remind,
    state.locations,
  ])

  const clear = () => onFiltersChange(initialHomeFilters)

  return (
    <div className="home-dashboard flex flex-col gap-4 w-full">
      {/* Page Header matching Figma node 312:50 (414:110) */}
      <div className="flex items-start justify-between gap-3 min-h-11 w-full">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-[24px] leading-8 font-semibold text-text-heading tracking-normal">
            Hôm nay
          </h1>
          <time
            dateTime={t}
            className="text-[13px] leading-[18px] font-normal text-text-secondary"
          >
            {todayLabel}
          </time>
        </div>
      </div>

      {activeItems.length === 0 ? (
        <EmptyState
          icon={<PackageOpen size={32} />}
          title="Chưa có thực phẩm nào"
          action={
            <Button
              variant="primary"
              iconStart={<Plus size={16} />}
              onClick={onAdd}
            >
              Thêm thực phẩm
            </Button>
          }
        />
      ) : (
        <>
          <AttentionSummary
            expiredFoods={expired}
            soonFoods={soon}
            reviewDue={reviewDue}
            defaultExpanded={state.settings.homeAttentionExpanded}
            remindDays={remind}
            onOpenDetail={onOpenDetail}
            onReview={onNavigateAttention}
          />

          {/* Section 2: Search and Filters (414:127) */}
          <div className="home-toolbar flex flex-col gap-3">
            <div className="relative flex items-center w-full">
              <div className="pointer-events-none absolute left-3 flex items-center text-text-tertiary">
                <Search size={20} strokeWidth={2} aria-hidden="true" />
              </div>
              <input
                type="search"
                aria-label="Tìm thực phẩm theo tên"
                value={q}
                onChange={(e) =>
                  onFiltersChange({ ...filters, query: e.target.value })
                }
                placeholder="Tìm thực phẩm theo tên..."
                className="h-12 w-full rounded-[12px] border border-border-control bg-surface-bg pl-10 pr-10 text-[14px] leading-[22px] text-text-primary placeholder:text-text-placeholder outline-none transition-[border-color,box-shadow] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
              {q && (
                <button
                  type="button"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => onFiltersChange({ ...filters, query: "" })}
                  className="absolute right-3 flex size-6 items-center justify-center rounded-full text-text-tertiary hover:text-text-primary cursor-pointer"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-[auto_auto_auto] items-center gap-2 sm:flex sm:flex-wrap">
              <FilterDropdown<StatusFilter>
                label="Hạn sử dụng"
                className="min-w-0 sm:w-auto"
                value={filterHsd}
                onChange={(status) => onFiltersChange({ ...filters, status })}
                options={inventoryHsdOptions}
              />
              <FilterDropdown
                label="Danh mục"
                className="min-w-0 sm:w-auto"
                value={selectedCategory}
                onChange={(category) =>
                  onFiltersChange({ ...filters, category })
                }
                options={categoryOptions}
              />
              <FilterDropdown
                label="Lưu trữ"
                className="min-w-0 sm:w-auto"
                value={selectedLocation}
                onChange={(location) =>
                  onFiltersChange({ ...filters, location })
                }
                options={locationOptions}
              />
            </div>
          </div>

          {/* Section 3: Inventory List (414:149) */}
          <section
            aria-labelledby="inv-heading"
            className="flex flex-col gap-2"
          >
            <div className="flex min-h-8 items-center justify-between gap-4">
              <h2
                id="inv-heading"
                aria-live="polite"
                className="text-[18px] leading-[26px] font-semibold text-text-heading tracking-normal"
              >
                Thực phẩm trong kho ({list.length})
              </h2>
              {(q ||
                filterHsd !== "all" ||
                selectedCategory !== "all" ||
                selectedLocation !== "all") && (
                <Button size="small" variant="subtle" onClick={clear}>
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {list.length === 0 ? (
              <EmptyState
                icon={<SearchX size={32} />}
                title="Không tìm thấy thực phẩm"
                action={
                  <Button variant="neutral" onClick={clear}>
                    Xóa bộ lọc
                  </Button>
                }
              />
            ) : (
              <div id="inventory-list">
                {/* Grouped Rows Card Container matching node 312:50 (414:156) */}
                <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-[16px] border border-border-primary bg-surface-bg shadow-none lg:hidden">
                  {list.map((f) => (
                    <FoodCard
                      key={f.id}
                      food={f}
                      variant="grouped"
                      remindDays={remind}
                      onOpen={() => onOpenDetail(f.id)}
                    />
                  ))}
                </div>

                {/* Desktop: Data Table */}
                <div className="hidden lg:block overflow-x-auto rounded-[16px] border border-border-primary bg-surface-bg shadow-none">
                  <table className="w-full border-separate border-spacing-0 text-left text-sm">
                    <thead className="bg-bg-subtle/80 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      <tr>
                        <th scope="col" className="px-5 py-2">
                          Thực phẩm
                        </th>
                        <th scope="col" className="px-5 py-2">
                          Số lượng
                        </th>
                        <th scope="col" className="px-5 py-2">
                          Nơi bảo quản
                        </th>
                        <th scope="col" className="px-5 py-2">
                          Hạn sử dụng
                        </th>
                        <th scope="col" className="px-5 py-2 text-right">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {list.map((f) => {
                        const IconComp = getFoodIcon(f.name)

                        return (
                          <tr
                            key={f.id}
                            onClick={() => onOpenDetail(f.id)}
                            className="cursor-pointer transition-colors hover:bg-surface-hover"
                          >
                            <td className="px-5 py-2">
                              <div className="flex items-center gap-3">
                                <span
                                  aria-hidden="true"
                                  className="flex size-9 shrink-0 items-center justify-center rounded-[12px] border border-border-primary bg-surface-subtle text-text-primary"
                                >
                                  <IconComp size={16} strokeWidth={2} />
                                </span>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    onOpenDetail(f.id)
                                  }}
                                  className="min-h-11 text-left font-semibold text-text-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-brand-primary"
                                >
                                  {f.name}
                                </button>
                              </div>
                            </td>
                            <td className="px-5 py-2 font-medium text-text-primary">
                              {f.quantity} {f.unit}
                            </td>
                            <td className="px-5 py-2 text-text-secondary">
                              {f.location || "—"}
                            </td>
                            <td className="px-5 py-2 text-text-primary font-medium">
                              {f.expDate
                                ? formatDate(f.expDate)
                                : "Chưa rõ HSD"}
                            </td>
                            <td className="px-5 py-2 text-right">
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
