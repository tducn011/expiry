import { useState, useEffect } from "react"

import type { Attention, FoodEntry } from "../domain/types"

import {
  attentionGroups,
  attentionGuidance,
  attentionLabel,
  fmtDate,
  locations,
} from "../lib/format"

import Grid from "../components/layout/Grid"

import PageHeader from "../components/layout/PageHeader"

import Button from "../components/ui/Button"

import EmptyState from "../components/ui/EmptyState"

import Icon from "../components/ui/Icon"

import Select from "../components/ui/Select"

import FoodCard from "./FoodCard"

import type { DetailAction } from "./Detail"

export type InventoryFilters = {
  query: string

  location: string

  lifecycle: "Còn hàng" | "Đã hết" | "Tất cả"

  attentionFilter: Attention | "all"
}

export const defaultFilters: InventoryFilters = {
  query: "",

  location: "Tất cả vị trí",

  lifecycle: "Còn hàng",

  attentionFilter: "all",
}

export default function Inventory({
  mode,

  asOfDate,

  demo = false,

  foods,

  allFoods,

  counts,

  leadDays,

  attention,

  filters,

  setFilters,

  onOpen,

  onAdd,

  onShowAttention,

  onShowInventory,

  onAction,
}: {
  asOfDate: string

  demo?: boolean

  mode: "inventory" | "attention"

  foods: FoodEntry[]

  allFoods: FoodEntry[]

  counts: Record<Attention, number>

  leadDays: number

  attention: (f: FoodEntry) => Attention

  filters: InventoryFilters

  setFilters: (f: InventoryFilters) => void

  onOpen: (f: FoodEntry) => void

  onAdd: () => void

  onShowAttention: () => void

  onShowInventory: () => void

  onAction: (food: FoodEntry, action: DetailAction) => void
}) {
  const isAttention = mode === "attention"

  const activeFoods = allFoods.filter((food) => food.remaining_quantity > 0)

  const dateCounts = {
    exact: activeFoods.filter((food) => food.expiry_date_certainty === "exact")
      .length,

    estimated: activeFoods.filter(
      (food) => food.expiry_date_certainty === "estimated",
    ).length,

    unknown: activeFoods.filter((food) => !food.expiry_date).length,
  }

  const set = <K extends keyof InventoryFilters,>(
    k: K,

    v: InventoryFilters[K],
  ) => setFilters({ ...filters, [k]: v })

  const toggleAttentionFilter = (key: Attention) => {
    if (counts[key] === 0) return

    set("attentionFilter", filters.attentionFilter === key ? "all" : key)
  }

  const list = (items: FoodEntry[]) =>
    items.map((f) => (
      <FoodCard
        key={f.id}
        food={f}
        asOfDate={asOfDate}
        attention={attention(f)}
        onOpen={() => onOpen(f)}
        onAction={(action) => onAction(f, action)}
      />
    ))

  const urgentTotal = counts.past + counts.today + counts.soon

  const [searchInput, setSearchInput] = useState(filters.query)

  useEffect(() => {
    setSearchInput(filters.query)
  }, [filters.query])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.query) {
        set("query", searchInput)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, filters.query, set])

  const isFilteredByAttention = filters.attentionFilter !== "all"

  const filterKeys: Attention[] = isAttention
    ? ["past", "today", "soon", "unknown"]
    : ["past", "today", "soon", "unknown", "later"]

  const hasFilters =
    filters.query !== "" ||
    filters.location !== defaultFilters.location ||
    filters.attentionFilter !== "all" ||
    (!isAttention && filters.lifecycle !== defaultFilters.lifecycle)

  return (
    <Grid className="page">
      <PageHeader
        eyebrow={fmtDate(asOfDate)}
        title={isAttention ? "Cần chú ý" : "Kho thực phẩm"}
        description={
          isAttention ? undefined : "Xem lại kho trước khi mua thêm."
        }
        action={
          <Button variant="cta" onClick={onAdd} icon="plus">
            Thêm thực phẩm
          </Button>
        }
      />

      {/* View Tabs: Tất cả / Cần chú ý / Đã dùng hết */}
      <div className="col-span-full">
        <nav
          className="inventory-view-tabs"
          role="tablist"
          aria-label="Chế độ xem kho"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isAttention && filters.lifecycle !== "Đã hết"}
            className={`inventory-view-tab ${
              !isAttention && filters.lifecycle !== "Đã hết" ? "is-active" : ""
            }`}
            onClick={() => {
              if (isAttention) onShowInventory()

              set("lifecycle", "Còn hàng")

              set("attentionFilter", "all")
            }}
          >
            Tất cả
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isAttention}
            className={`inventory-view-tab ${isAttention ? "is-active" : ""}`}
            onClick={() => {
              if (!isAttention) onShowAttention()
            }}
          >
            Cần chú ý
            {urgentTotal > 0 && (
              <span className="tab-badge">{urgentTotal}</span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isAttention && filters.lifecycle === "Đã hết"}
            className={`inventory-view-tab ${
              !isAttention && filters.lifecycle === "Đã hết" ? "is-active" : ""
            }`}
            onClick={() => {
              if (isAttention) onShowInventory()

              set("lifecycle", "Đã hết")

              set("attentionFilter", "all")
            }}
          >
            Đã dùng hết
          </button>
        </nav>
      </div>

      {/* Urgency strip — interactive filters: logically grouped right above the list */}
      <div className="col-span-full">
        <div
          className="urgency-strip"
          role="toolbar"
          aria-label="Lọc theo mức độ ưu tiên"
        >
          {filterKeys.map((key) => {
            const isActive = filters.attentionFilter === key

            const isZero = counts[key] === 0

            return (
              <button
                type="button"
                key={key}
                disabled={isZero}
                aria-pressed={isActive}
                className={`urgency-chip ${key}${isZero ? " zero" : ""}${
                  isActive ? " is-active" : ""
                }`}
                onClick={() => toggleAttentionFilter(key)}
                title={
                  isZero
                    ? "Không có món nào"
                    : `Bấm để lọc món ${attentionLabel[key]}`
                }
              >
                <span>{attentionLabel[key]}</span>
                <strong>{counts[key]}</strong>
              </button>
            )
          })}
          {!isAttention && urgentTotal > 0 && (
            <button
              className="text-link"
              style={{ marginLeft: "auto" }}
              onClick={onShowAttention}
              type="button"
            >
              Xem ưu tiên →
            </button>
          )}
        </div>
      </div>

      {/* Active filter notification banner */}
      {isFilteredByAttention && (
        <div className="col-span-full active-filter-bar">
          <span>
            Đang lọc:{" "}
            <strong>
              {attentionLabel[(filters.attentionFilter as Attention)]}
            </strong>{" "}
            ({foods.length} món)
          </span>
          <button
            type="button"
            className="text-link"
            onClick={() => set("attentionFilter", "all")}
          >
            Hiện tất cả
          </button>
        </div>
      )}

      {/* Filter bar — flex row: search primary with quick clear, dropdowns secondary */}
      <section className="filters col-span-full">
        <label className="search">
          <Icon name="search" />
          <input
            aria-label="Tìm theo tên"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm tên thực phẩm"
          />
          {searchInput && (
            <button
              type="button"
              className="clear-search"
              aria-label="Xóa tìm kiếm"
              onClick={() => {
                setSearchInput("")

                set("query", "")
              }}
            >
              ×
            </button>
          )}
        </label>
        <Select
          aria-label="Lọc vị trí"
          value={filters.location}
          options={[defaultFilters.location, ...locations].map((value) => ({
            value,

            label: value,
          }))}
          onChange={(value) => set("location", value)}
        />
        {isAttention ? (
          <Select
            aria-label="Lọc trạng thái chú ý"
            value={filters.attentionFilter}
            options={[
              { value: "all", label: "Mọi trạng thái" },

              ...filterKeys.map((value) => ({
                value,

                label: attentionLabel[value],
              })),
            ]}
            onChange={(value) =>
              set("attentionFilter", value as Attention | "all")
            }
          />
        ) : (
          <Select
            aria-label="Lọc tình trạng kho"
            value={filters.lifecycle}
            options={["Còn hàng", "Đã hết", "Tất cả"].map((value) => ({
              value,

              label: value,
            }))}
            onChange={(value) =>
              set("lifecycle", value as InventoryFilters["lifecycle"])
            }
          />
        )}
      </section>

      {/* Food list — clean vertical hierarchy and alignment */}
      <div
        className={`col-span-full inventory-workspace ${
          isAttention ? "with-guide" : ""
        }`}
      >
        <div className="list-column">
          <div className="list-head">
            <span>{foods.length} món</span>
          </div>
          {!foods.length ? (
            !allFoods.length ? (
              <EmptyState
                eyebrow="KHO TRỐNG"
                title="Chưa có thực phẩm nào"
                body="Thêm thực phẩm đầu tiên để bắt đầu theo dõi hạn sử dụng."
                action={
                  <Button variant="cta" icon="plus" onClick={onAdd}>
                    Thêm thực phẩm
                  </Button>
                }
              />
            ) : filters.query &&
              !isFilteredByAttention &&
              filters.location === defaultFilters.location ? (
              <EmptyState
                eyebrow="TÌM KIẾM"
                title={`Không tìm thấy "${filters.query}"`}
                body="Kiểm tra lại chính tả hoặc xóa từ khóa tìm kiếm."
                action={
                  <Button variant="outline" onClick={() => set("query", "")}>
                    Xóa tìm kiếm
                  </Button>
                }
              />
            ) : hasFilters ? (
              <EmptyState
                eyebrow="BỘ LỌC"
                title="Không có món khớp bộ lọc"
                body="Thử đổi hoặc đặt lại bộ lọc để xem các món khác."
                action={
                  <Button
                    variant="outline"
                    onClick={() => setFilters(defaultFilters)}
                  >
                    Đặt lại bộ lọc
                  </Button>
                }
              />
            ) : isAttention ? (
              <EmptyState
                eyebrow="HOÀN TẤT"
                title="Chưa có món cần chú ý"
                body="Tất cả thực phẩm trong kho đều trong hạn hoặc chưa đến ngày theo dõi."
                action={
                  <Button variant="secondary" onClick={onShowInventory}>
                    Xem kho thực phẩm
                  </Button>
                }
              />
            ) : (
              <EmptyState
                eyebrow="KHO TRỐNG"
                title="Thêm thực phẩm đầu tiên"
                body="Tên, lượng và đơn vị là đủ để bắt đầu."
                action={
                  <Button variant="cta" icon="plus" onClick={onAdd}>
                    Thêm thực phẩm đầu tiên
                  </Button>
                }
              />
            )
          ) : isAttention ? (
            attentionGroups.map(([key, title]) => {
              const group = foods.filter((f) => attention(f) === key)

              return group.length ? (
                <section className="attention-group" key={key}>
                  <h2>
                    <Icon
                      name={
                        key === "unknown" || key === "past" ? "alert" : "clock"
                      }
                    />
                    {title}
                    <em>{group.length} món</em>
                  </h2>
                  <p className="attention-group-guide">
                    {attentionGuidance[key].body}
                  </p>
                  <div className="food-list">{list(group)}</div>
                </section>
              ) : null
            })
          ) : (
            <div className="food-list inventory-cards">{list(foods)}</div>
          )}
        </div>
        {isAttention && (
          <aside className="priority-guide card">
            <h2>Cách Expiry ưu tiên</h2>
            <p>
              Mục cần xử lý được xếp theo ngày bạn đã ghi. Nhóm sắp tới tính
              trong {leadDays} ngày.
            </p>
            <div className="safety-note">
              <Icon name="alert" />
              <span>
                Theo ngày bạn đã ghi, không phải đánh giá an toàn. Hãy kiểm tra
                thực phẩm thực tế trước khi dùng.
              </span>
            </div>
            <div>
              <span className="section-label">Ngày trong kho còn hàng</span>
              <dl className="date-confidence">
                <div>
                  <dt>Ngày chính xác</dt>
                  <dd>{dateCounts.exact} món</dd>
                </div>
                <div>
                  <dt>Ngày ước tính</dt>
                  <dd>{dateCounts.estimated} món</dd>
                </div>
                <div>
                  <dt>Chưa có ngày</dt>
                  <dd>{dateCounts.unknown} món</dd>
                </div>
              </dl>
            </div>
          </aside>
        )}
      </div>
    </Grid>
  )
}
