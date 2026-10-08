import type { Attention, FoodEntry } from "../mockApi";
import { attentionGroups, locations } from "../lib/format";
import Grid from "../components/layout/Grid";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
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

  return (
    <Grid className="page">
      <PageHeader
        eyebrow={isAttention ? "ƯU TIÊN XỬ LÝ" : "TỔNG KHO BẾP"}
        title={isAttention ? "Cần chú ý" : "Kho thực phẩm"}
        description={
          isAttention
            ? "Món sắp hoặc đã quá hạn cần dùng trước."
            : "Toàn bộ đồ dùng và thực phẩm trong nhà."
        }
        action={
          <Button onClick={onAdd} icon="plus">
            Thêm thực phẩm
          </Button>
        }
      />

      <section className="filters col-span-full lg:col-span-8">
        <label className="search">
          <Icon name="search" />
          <input
            aria-label="Tìm theo tên"
            value={filters.query}
            onChange={(e) => set("query", e.target.value)}
            placeholder="Tìm theo tên món..."
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

      <div className="col-span-full lg:col-span-8 list-column">
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

      <aside className="rail col-span-full lg:col-span-4 lg:row-start-2 lg:col-start-9 lg:row-span-2">
        <Card
          title="Tình trạng hạn dùng"
          action={
            !isAttention ? (
              <button className="text-link" onClick={onShowAttention}>
                Xem
              </button>
            ) : undefined
          }
        >
          <dl className="stat-grid">
            {attentionGroups.map(([key, title]) => (
              <div key={key} className={`stat ${key}`}>
                <dt>{title}</dt>
                <dd>{counts[key]}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </aside>
    </Grid>
  );
}
