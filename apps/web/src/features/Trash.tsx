import { useMemo, useState } from "react"

import type { FoodEntry } from "../domain/types"

import { fmtQty, fmtTime, locations, unitLabel } from "../lib/format"

import Grid from "../components/layout/Grid"

import PageHeader from "../components/layout/PageHeader"

import Button from "../components/ui/Button"

import Card from "../components/ui/Card"

import EmptyState from "../components/ui/EmptyState"

import Icon from "../components/ui/Icon"

import Select from "../components/ui/Select"

export default function Trash({
  timezone = "Asia/Ho_Chi_Minh",

  foods,

  onRestore,
}: {
  timezone?: string

  foods: FoodEntry[]

  onRestore: (f: FoodEntry) => void
}) {
  const [query, setQuery] = useState("")

  const [location, setLocation] = useState("Tất cả vị trí")

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase()

    return foods.filter((f) => {
      const matchQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.note && f.note.toLowerCase().includes(q))

      const matchLocation =
        location === "Tất cả vị trí" || f.storage_location === location

      return matchQuery && matchLocation
    })
  }, [foods, query, location])

  const isFiltered = query.trim() !== "" || location !== "Tất cả vị trí"

  return (
    <Grid className="page">
      <PageHeader
        eyebrow="ĐÃ XÓA"
        title="Thùng rác"
        description="Có thể khôi phục lại món đã xóa về kho."
      />

      {foods.length > 0 && (
        <section
          className="filters col-span-full lg:col-span-8"
          style={{ marginBottom: "1rem" }}
        >
          <label className="search">
            <Icon name="search" />
            <input
              aria-label="Tìm trong thùng rác"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên món đã xóa"
            />
            {query && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setQuery("")}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <Icon name="close" />
              </button>
            )}
          </label>
          <Select
            aria-label="Lọc theo vị trí"
            value={location}
            onChange={setLocation}
            options={[
              { value: "Tất cả vị trí", label: "Tất cả vị trí" },

              ...locations.map((loc) => ({ value: loc, label: loc })),
            ]}
          />
        </section>
      )}

      <div className="col-span-full lg:col-span-8">
        {filteredFoods.length ? (
          <Card
            title={
              isFiltered
                ? `Kết quả lọc (${filteredFoods.length}/${foods.length})`
                : `Danh sách đã xóa (${foods.length})`
            }
          >
            <div className="row-list">
              {filteredFoods.map((f) => (
                <div className="trash-row" key={f.id}>
                  <div>
                    <strong>{f.name}</strong>
                    <span>
                      {fmtQty(f.remaining_quantity)} {unitLabel[f.unit]}
                      {f.storage_location && ` · ${f.storage_location}`}
                      {f.deleted_at &&
                        ` · Xóa lúc ${fmtTime(f.deleted_at, timezone)}`}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="check"
                    onClick={() => onRestore(f)}
                  >
                    Khôi phục
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ) : foods.length ? (
          <EmptyState
            eyebrow="KHÔNG TÌM THẤY"
            title="Không có kết quả phù hợp"
            body="Không tìm thấy món đã xóa nào khớp với từ khóa tìm kiếm hoặc vị trí đã chọn."
          />
        ) : (
          <EmptyState
            eyebrow="TRỐNG"
            title="Thùng rác trống"
            body="Chưa có món nào bị xóa."
          />
        )}
      </div>
    </Grid>
  )
}
