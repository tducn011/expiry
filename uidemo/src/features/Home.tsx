import type { Attention, FoodEntry, QuantityMovement, Unit } from "../mockApi";
import { fmtDate, fmtQty, fmtTime, movementLabel, unitLabel, locations } from "../lib/format";
import Grid from "../components/layout/Grid";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import FoodCard from "./FoodCard";

export default function Home({
  displayName,
  foods,
  counts,
  attention,
  onOpen,
  onAdd,
  onNavigate,
  onStartReview,
  recentActivities,
  onQuickConsume,
  onQuickFreeze,
}: {
  displayName: string;
  foods: FoodEntry[];
  counts: Record<Attention, number>;
  attention: (f: FoodEntry) => Attention;
  onOpen: (f: FoodEntry) => void;
  onAdd: () => void;
  onNavigate: (view: "inventory" | "attention" | "reviews" | "trash" | "settings", locationFilter?: string) => void;
  onStartReview: (tab?: "triage" | "zones" | "insights") => void;
  recentActivities: { movement: QuantityMovement; food: FoodEntry }[];
  onQuickConsume?: (f: FoodEntry) => void;
  onQuickFreeze?: (f: FoodEntry) => void;
}) {
  const activeFoods = foods.filter((f) => f.remaining_quantity > 0);
  const urgentFoods = activeFoods
    .filter((f) => {
      const att = attention(f);
      return att === "past" || att === "today" || att === "soon";
    })
    .sort((a, b) => {
      // Prioritize past > today > soon
      const score = (f: FoodEntry) => {
        const att = attention(f);
        return att === "past" ? 3 : att === "today" ? 2 : 1;
      };
      return score(b) - score(a);
    });

  const locationCounts = locations.map((loc) => {
    const inLoc = activeFoods.filter((f) => f.storage_location === loc);
    return { name: loc, count: inLoc.length };
  });

  const totalUrgent = counts.past + counts.today + counts.soon;

  return (
    <Grid className="page home-page">
      <PageHeader
        eyebrow="TỔNG QUAN HÔM NAY · 08/10/2026"
        title={`Chào bạn, ${displayName}`}
        description={`Kho bếp đang có ${activeFoods.length} món thực phẩm. ${
          totalUrgent > 0
            ? `Có ${totalUrgent} món cần bạn rà soát và xử lý sớm.`
            : "Tất cả thực phẩm đều trong trạng thái an toàn."
        }`}
        action={
          <div className="home-header-actions">
            <Button variant="secondary" icon="review" onClick={() => onStartReview("triage")}>
              Kiểm kê nhanh
            </Button>
            <Button icon="plus" onClick={onAdd}>
              Thêm thực phẩm
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="col-span-full stat-summary-grid">
        <StatCard
          title="Tổng trong kho"
          value={activeFoods.length}
          unit="món"
          subtext="Đang được quản lý"
          icon="box"
          onClick={() => onNavigate("inventory")}
        />
        <StatCard
          title="Cần xử lý ngay"
          value={counts.past + counts.today}
          unit="món"
          subtext={counts.past > 0 ? `${counts.past} món đã quá hạn` : "Hôm nay cần dùng"}
          icon="alert"
          tone={counts.past + counts.today > 0 ? "past" : "neutral"}
          onClick={() => onNavigate("attention")}
        />
        <StatCard
          title="Sắp tới hạn"
          value={counts.soon}
          unit="món"
          subtext="Trong 2 ngày tới"
          icon="clock"
          tone={counts.soon > 0 ? "soon" : "neutral"}
          onClick={() => onNavigate("attention")}
        />
        <StatCard
          title="Thời hạn còn xa"
          value={counts.later}
          unit="món"
          subtext="An tâm sử dụng"
          icon="check"
          tone="success"
          onClick={() => onNavigate("inventory")}
        />
      </div>

      {/* Main Column */}
      <div className="col-span-full lg:col-span-8 stack">
        {/* Featured Review Banner */}
        <div className="hero-review-card">
          <div className="hero-review-glow" />
          <div className="hero-review-content">
            <div className="hero-review-header">
              <span className="hero-pill">
                <Icon name="sparkles" /> Tính năng mới: Kiểm kê & Rà soát
              </span>
              <span className="hero-time">Chỉ 30 giây</span>
            </div>
            <h3>Đồng bộ kho thực phẩm thực tế với app</h3>
            <p>
              Giải quyết nhanh tình trạng “bếp đã hết nhưng app vẫn báo”, hoặc cấp đông nhanh các món
              sắp hết hạn để kéo dài thời hạn bảo quản.
            </p>
            <div className="hero-review-actions">
              <Button onClick={() => onStartReview("triage")} icon="zap">
                Rà soát {totalUrgent} món cần chú ý
              </Button>
              <Button variant="secondary" onClick={() => onStartReview("zones")} icon="review">
                Kiểm kê theo khu vực tủ
              </Button>
            </div>
          </div>
        </div>

        {/* Urgent Items List */}
        <Card
          title="Cần giải quyết hôm nay"
          action={
            urgentFoods.length > 0 && (
              <button
                type="button"
                className="text-link"
                onClick={() => onNavigate("attention")}
              >
                Xem tất cả ({urgentFoods.length})
              </button>
            )
          }
        >
          {urgentFoods.length === 0 ? (
            <div className="empty-subtle">
              <Icon name="check" />
              <span>Tuyệt vời! Không có món nào bị quá hạn hoặc cần xử lý gấp hôm nay.</span>
            </div>
          ) : (
            <div className="home-urgent-list">
              {urgentFoods.slice(0, 4).map((f) => (
                <div key={f.id} className="home-urgent-item">
                  <div className="home-urgent-card-wrap" onClick={() => onOpen(f)}>
                    <FoodCard food={f} attention={attention(f)} onOpen={() => onOpen(f)} />
                  </div>
                  <div className="home-urgent-quick-actions">
                    {onQuickConsume && (
                      <button
                        type="button"
                        className="quick-action-btn consume"
                        title="Đã dùng hết món này"
                        onClick={() => onQuickConsume(f)}
                      >
                        <Icon name="check" />
                        <span>Đã dùng</span>
                      </button>
                    )}
                    {onQuickFreeze && f.storage_location !== "Ngăn đông" && (
                      <button
                        type="button"
                        className="quick-action-btn freeze"
                        title="Cấp đông chuyển sang Ngăn đông"
                        onClick={() => onQuickFreeze(f)}
                      >
                        <Icon name="snowflake" />
                        <span>Cấp đông</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Review Navigation Cards */}
        <div className="review-shortcuts-grid">
          <div
            className="review-shortcut-item"
            onClick={() => onStartReview("triage")}
          >
            <div className="shortcut-icon tone-urgent">
              <Icon name="zap" />
            </div>
            <div>
              <strong>1. Kiểm tra khẩn cấp</strong>
              <p>Rà soát 1 chạm: Đã dùng, Cấp đông, Bỏ, hoặc Giữ lại</p>
            </div>
            <Icon name="arrow" />
          </div>

          <div
            className="review-shortcut-item"
            onClick={() => onStartReview("zones")}
          >
            <div className="shortcut-icon tone-zone">
              <Icon name="review" />
            </div>
            <div>
              <strong>2. Kiểm kê theo khu vực</strong>
              <p>Duyệt checklist Ngăn mát, Ngăn đông, Tủ bếp nhanh chóng</p>
            </div>
            <Icon name="arrow" />
          </div>

          <div
            className="review-shortcut-item"
            onClick={() => onStartReview("insights")}
          >
            <div className="shortcut-icon tone-insight">
              <Icon name="trend" />
            </div>
            <div>
              <strong>3. Đánh giá & Lãng phí</strong>
              <p>Phân tích tỉ lệ tiêu dùng, giảm hao phí & gợi ý nấu ăn</p>
            </div>
            <Icon name="arrow" />
          </div>
        </div>
      </div>

      {/* Right Rail Column */}
      <aside className="col-span-full lg:col-span-4 stack">
        {/* Storage Breakdown Card */}
        <Card title="Phân bố vị trí kho">
          <div className="storage-list">
            {locationCounts.map((loc) => (
              <button
                key={loc.name}
                type="button"
                className="storage-item-row"
                onClick={() => onNavigate("inventory", loc.name)}
              >
                <div className="storage-item-info">
                  <span className="storage-dot" />
                  <strong>{loc.name}</strong>
                </div>
                <span className="storage-item-count">
                  {loc.count} món
                  <Icon name="arrow" />
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Activity Timeline */}
        <Card
          title="Hoạt động gần đây"
          action={
            <button
              type="button"
              className="text-link"
              onClick={() => onNavigate("inventory")}
            >
              Xem kho
            </button>
          }
        >
          {recentActivities.length === 0 ? (
            <p className="rail-copy">Chưa có lịch sử thay đổi.</p>
          ) : (
            <div className="recent-activity-list">
              {recentActivities.slice(0, 5).map(({ movement: m, food }) => {
                const delta = +(m.quantity_after - m.quantity_before).toFixed(3);
                const unit = unitLabel[food.unit];
                return (
                  <div key={m.id} className="recent-activity-item" onClick={() => onOpen(food)}>
                    <div className={`activity-icon-bullet ${m.kind}`}>
                      <Icon
                        name={
                          m.kind === "consume"
                            ? "check"
                            : m.kind === "discard"
                            ? "trash"
                            : m.kind === "recount"
                            ? "edit"
                            : "plus"
                        }
                      />
                    </div>
                    <div className="activity-info">
                      <div className="activity-head">
                        <strong>{food.name}</strong>
                        <span className="activity-time">{fmtTime(m.recorded_at)}</span>
                      </div>
                      <p className="activity-desc">
                        <span>{movementLabel[m.kind]}</span>
                        {m.reason ? ` · ${m.reason}` : ""}
                      </p>
                      <span className="activity-qty">
                        {fmtQty(m.quantity_before)} → {fmtQty(m.quantity_after)} {unit}
                        <small>{delta > 0 ? ` (+${fmtQty(delta)})` : ` (${fmtQty(delta)})`}</small>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Pro-tip Card */}
        <Card tone="muted">
          <div className="rail-tip">
            <Icon name="sparkles" />
            <div>
              <strong>Mẹo chống lãng phí</strong>
              <p>
                Rau củ và cá tươi nên được sơ chế hoặc cấp đông nếu chưa kịp nấu trong vòng 24 giờ tới.
              </p>
            </div>
          </div>
        </Card>
      </aside>
    </Grid>
  );
}
