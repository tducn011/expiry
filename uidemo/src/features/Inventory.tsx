import type { Attention, FoodEntry } from "../mockApi";
import { attentionGroups, locations } from "../lib/format";
import Grid from "../components/layout/Grid";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Icon from "../components/ui/Icon";
import FoodCard from "./FoodCard";

export type InventoryFilters = {
  query: string;
  location: string;
  lifecycle: "Còn hàng" | "Đã hết" | "Tất cả";
  attentionFilter: Attention | "all";
};

export const defaultFilters: InventoryFilters = {
  query: "",
  location: "Tất cả vị trí",
  lifecycle: "Còn hàng",
  attentionFilter: "all",
};

const attentionLabel: Record<Attention, string> = {
  past: "Hết hạn",
  today: "Hôm nay",
  soon: "Sắp hết",
  unknown: "Chưa có HSD",
  later: "Còn lâu",
};

export default function Inventory({
  mode,
  foods,
  counts,
  attention,
  filters,
  setFilters,
  onOpen,
  onAdd,
  onShowAttention,
}: {
  mode: "inventory" | "attention";
  foods: FoodEntry[];
  counts: Record<Attention, number>;
  leadDays: number;
  attention: (f: FoodEntry) => Attention;
  filters: InventoryFilters;
  setFilters: (f: InventoryFilters) => void;
  onOpen: (f: FoodEntry) => void;
  onAdd: () => void;
  onShowAttention: () => void;
}) {
  const isAttention = mode === "attention";
  const set = <K extends keyof InventoryFilters>(k: K, v: InventoryFilters[K]) =>
    setFilters({ ...filters, [k]: v });

  const toggleAttentionFilter = (key: Attention) => {
    if (counts[key] === 0) return;
    set("attentionFilter", filters.attentionFilter === key ? "all" : key);
  };

  const list = (items: FoodEntry[]) =>
    items.map((f) => (
      <FoodCard key={f.id} food={f} attention={attention(f)} onOpen={() => onOpen(f)} />
    ));

  const urgentTotal = counts.past + counts.today + counts.soon;
  const isFilteredByAttention =
    !isAttention && filters.attentionFilter && filters.attentionFilter !== "all";

  return (
    <Grid className="page">
      <PageHeader
        eyebrow={isAttention ? "ƯU TIÊN" : "KHO"}
        title={isAttention ? "Cần chú ý" : "Kho thực phẩm"}
        action={
          <Button onClick={onAdd} icon="plus">
            Thêm
          </Button>
        }
      />

      {/* Urgency strip — interactive filters: logically grouped right above the list */}
      <div className="col-span-full">
        <div className="urgency-strip" role="toolbar" aria-label="Lọc theo mức độ ưu tiên">
          {(["past", "today", "soon", "unknown", "later"] as Attention[]).map((key) => {
            const isActive = !isAttention && filters.attentionFilter === key;
            const isZero = counts[key] === 0;
            return (
              <button
                type="button"
                key={key}
                disabled={isZero}
                className={`urgency-chip ${key}${isZero ? " zero" : ""}${isActive ? " is-active" : ""}`}
                onClick={() => toggleAttentionFilter(key)}
                title={isZero ? "Không có món nào" : `Bấm để lọc món ${attentionLabel[key]}`}
              >
                <strong>{counts[key]}</strong>
                {attentionLabel[key]}
              </button>
            );
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
            Đang lọc: <strong>{attentionLabel[filters.attentionFilter as Attention]}</strong> ({foods.length} món)
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
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Tìm món trong kho..."
          />
          {filters.query && (
            <button
              type="button"
              className="clear-search"
              aria-label="Xóa tìm kiếm"
              onClick={() => set("query", "")}
            >
              ×
            </button>
          )}
        </label>
        <select
          aria-label="Lọc vị trí"
          value={filters.location}
          onChange={(e) => set("location", e.target.value)}
        >
          <option>Tất cả vị trí</option>
          {locations.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        {!isAttention && (
          <select
            aria-label="Lọc tình trạng"
            value={filters.lifecycle}
            onChange={(e) => set("lifecycle", e.target.value as InventoryFilters["lifecycle"])}
          >
            <option>Còn hàng</option>
            <option>Đã hết</option>
            <option>Tất cả</option>
          </select>
        )}
      </section>

      {/* Food list — clean vertical hierarchy and alignment */}
      <div className="col-span-full list-column">
        <div className="list-head">
          <span>{foods.length} món</span>
        </div>
        {!foods.length ? (
          <EmptyState
            eyebrow="KHÔNG CÓ KẾT QUẢ"
            title={isAttention ? "Không có món cần chú ý" : "Chưa có món phù hợp"}
            body="Thử đổi bộ lọc hoặc thêm món mới."
            action={
              <Button
                variant="secondary"
                onClick={() => setFilters(defaultFilters)}
              >
                Đặt lại bộ lọc
              </Button>
            }
          />
        ) : isAttention ? (
          attentionGroups.map(([key, title]) => {
            const group = foods.filter((f) => attention(f) === key);
            return group.length ? (
              <section className="attention-group" key={key}>
                <h2>
                  <Icon name={key === "unknown" || key === "past" ? "alert" : "clock"} />
                  {title}
                  <em>{group.length}</em>
                </h2>
                <div className="food-list">{list(group)}</div>
              </section>
            ) : null;
          })
        ) : (
          <div className="food-list">{list(foods)}</div>
        )}
      </div>
    </Grid>
  );
}
