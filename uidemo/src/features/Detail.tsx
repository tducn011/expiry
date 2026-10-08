import type { Attention, FoodEntry, QuantityMovement } from "../mockApi";
import { fmtDate, fmtQty, fmtTime, movementLabel, unitLabel } from "../lib/format";
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
    [
      "Hạn sử dụng",
      fmtDate(food.expiry_date) || "Chưa có",
      food.expiry_date_certainty === "estimated" ? "Ước tính" : undefined,
    ],
    ["Vị trí", food.storage_location || "Chưa chọn"],
    ...(food.opened_on ? [["Ngày mở", fmtDate(food.opened_on)] as [string, string]] : []),
    ...(food.note ? [["Ghi chú", food.note] as [string, string]] : []),
  ];

  return (
    <Grid className="page">
      <button className="back-link col-span-full" onClick={onBack}>
        <Icon name="back" />
        Quay lại kho
      </button>

      <Card className="detail-main col-span-full lg:col-span-7">
        <div className="detail-title">
          <div>
            <span className="eyebrow">{empty ? "ĐÃ HẾT" : "CÒN HÀNG"}</span>
            <h1>{food.name}</h1>
          </div>
          <button className="icon-button" aria-label="Xóa món" onClick={() => onAction("delete")}>
            <Icon name="trash" />
          </button>
        </div>

        <div className="hero-quantity">
          <span className="eyebrow">SỐ LƯỢNG</span>
          <strong>
            {fmtQty(food.remaining_quantity)} <small>{unit}</small>
          </strong>
        </div>

        <div className="attention-panel">
          <Badge type={attention} />
        </div>

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
      </Card>

      <div className="detail-aside col-span-full lg:col-span-5">
        <Card
          title="Thông tin"
          action={
            <button className="text-link" onClick={() => onAction("edit")}>
              <Icon name="edit" />
              Sửa
            </button>
          }
        >
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
            <button className="text-link" onClick={() => onAction("history")}>
              Tất cả
            </button>
          }
        >
          {movements.slice(0, 3).map((m) => (
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
          ))}
        </Card>
      </div>
    </Grid>
  );
}
