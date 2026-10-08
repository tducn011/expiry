import type { Attention, FoodEntry, QuantityMovement } from "../mockApi";
import { fmtDate, fmtQty, fmtTime, labelTypeLabel, movementLabel, sourceLabel, unitLabel } from "../lib/format";
import Grid from "../components/layout/Grid";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";

export type DetailAction = "consume" | "discard" | "recount" | "history" | "edit" | "delete";

export default function Detail({
  food,
  attention,
  movements,
  onBack,
  onAction,
}: {
  food: FoodEntry;
  attention: Attention;
  movements: QuantityMovement[];
  onBack: () => void;
  onAction: (a: DetailAction) => void;
}) {
  const unit = unitLabel[food.unit];
  const empty = food.remaining_quantity === 0;

  const facts: [string, string, string?][] = [
    ["Vị trí lưu trữ", food.storage_location || "Chưa chọn vị trí"],
    ...(food.opened_on ? [["Ngày mở bao bì", fmtDate(food.opened_on)] as [string, string]] : []),
    ...(food.expiry_date_label_type && food.expiry_date_label_type !== "unknown"
      ? [["Loại nhãn NSX", labelTypeLabel[food.expiry_date_label_type]] as [string, string]]
      : []),
    ...(food.expiry_date_source && food.expiry_date_source !== "package_label"
      ? [["Nguồn ngày", sourceLabel[food.expiry_date_source]] as [string, string]]
      : []),
    ...(food.note ? [["Ghi chú", food.note] as [string, string]] : []),
  ];

  return (
    <Grid className="page">
      <button className="back-link col-span-full" onClick={onBack} type="button">
        <Icon name="back" />
        Quay lại kho
      </button>

      {/* Main Action Card: Logically together => Physically together */}
      <Card className="detail-main col-span-full lg:col-span-7">
        <div className="detail-title">
          <div>
            <span className={`status-pill ${empty ? "is-empty" : "is-active"}`}>
              {empty ? "ĐÃ HẾT HÀNG" : "CÒN HÀNG"}
            </span>
            <h1>{food.name}</h1>
          </div>
          <div className="detail-top-actions">
            <button
              className="action-pill-btn"
              onClick={() => onAction("edit")}
              type="button"
              title="Chỉnh sửa thông tin"
            >
              <Icon name="edit" />
              <span>Sửa</span>
            </button>
            <button
              className="action-pill-btn danger"
              onClick={() => onAction("delete")}
              type="button"
              title="Xóa vào thùng rác"
            >
              <Icon name="trash" />
            </button>
          </div>
        </div>

        {/* Hero Metrics: Quantity + Urgency & Expiry placed side-by-side */}
        <div className="detail-hero-grid">
          <div className="metric-box">
            <span className="metric-label">LƯỢNG HIỆN CÓ</span>
            <div className="metric-val">
              <strong>{fmtQty(food.remaining_quantity)}</strong>
              <small>{unit}</small>
            </div>
            <span className="metric-sub">
              {empty ? "Hết trong kho" : "Sẵn sàng sử dụng"}
            </span>
          </div>

          <div className="metric-box">
            <span className="metric-label">HẠN SỬ DỤNG</span>
            <div className="metric-val">
              <Badge type={attention} />
            </div>
            <div className="metric-sub">
              <strong>{fmtDate(food.expiry_date) || "Chưa có ngày"}</strong>
              {food.expiry_date_certainty === "estimated" && (
                <span className="badge-estimate">Ước tính</span>
              )}
            </div>
          </div>
        </div>

        {/* Action row directly underneath the quantity it modifies */}
        <div className="detail-actions-section">
          <span className="section-label">GHI NHẬN THAO TÁC</span>
          <div className="action-row">
            <Button disabled={empty} onClick={() => onAction("consume")}>
              Đã dùng
            </Button>
            <Button disabled={empty} variant="secondary" onClick={() => onAction("discard")}>
              Đã bỏ
            </Button>
            <Button variant="ghost" onClick={() => onAction("recount")}>
              Kiểm lại
            </Button>
          </div>
        </div>
      </Card>

      {/* Aside: Metadata and Movement Audit Log */}
      <div className="detail-aside col-span-full lg:col-span-5">
        <Card title="Thông tin bổ sung">
          <dl className="facts">
            {facts.map(([k, v, note]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>
                  {v}
                  {note && <small>{note}</small>}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card
          title="Lịch sử thay đổi"
          action={
            movements.length > 0 && (
              <button className="text-link" onClick={() => onAction("history")} type="button">
                Tất cả ({movements.length})
              </button>
            )
          }
        >
          {movements.length ? (
            movements.slice(0, 3).map((m) => (
              <div className="history-row" key={m.id}>
                <span>
                  <Icon name="history" />
                </span>
                <p>
                  <strong>{movementLabel[m.kind]}</strong>
                  <small>{fmtTime(m.recorded_at)}</small>
                </p>
                <em>
                  {fmtQty(m.quantity_before)} → {fmtQty(m.quantity_after)} {unit}
                </em>
              </div>
            ))
          ) : (
            <p className="inline-hint">Chưa có thay đổi nào được ghi nhận.</p>
          )}
        </Card>
      </div>
    </Grid>
  );
}
