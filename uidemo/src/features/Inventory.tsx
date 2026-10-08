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
};
export const defaultFilters: InventoryFilters = {
  query: "",
  location: "Tất cả vị trí",
  lifecycle: "Còn hàng",
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

  const list = (items: FoodEntry[]) =>
    items.map((f) => (
      <FoodCard key={f.id} food={f} attention={attention(f)} onOpen={() => onOpen(f)} />
    ));

  const urgentTotal = counts.past + counts.today + counts.soon;

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

      {/* Urgency strip — physically next to the list it describes */}
      <div className="col-span-full">
        <div className="urgency-strip">
          {(["past", "today", "soon", "unknown", "later"] as Attention[]).map((key) => (
            <span
              key={key}
              className={`urgency-chip ${key}${counts[key] === 0 ? " zero" : ""}`}
            >
              <strong>{counts[key]}</strong>
              {attentionLabel[key]}
            </span>
          ))}
          {!isAttention && urgentTotal > 0 && (
            <button
              className="text-link"
              style={{ marginLeft: "auto" }}
              onClick={onShowAttention}
            >
              Xem cần chú ý →
            </button>
          )}
        </div>
      </div>

      {/* Filter bar — flex row: search primary, dropdowns secondary */}
      <section className="filters col-span-full">
        <label className="search">
          <Icon name="search" />
          <input
            aria-label="Tìm theo tên"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Tìm món..."
          />
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

      {/* Food list — full width now, no sidebar */}
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
              <Button variant="secondary" onClick={() => setFilters(defaultFilters)}>
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
