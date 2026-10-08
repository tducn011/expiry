import type { Attention, FoodEntry, QuantityMovement } from "../mockApi";
import { fmtDate, fmtQty, fmtTime, labelTypeLabel, movementLabel, sourceLabel, unitLabel } from "../lib/format";
import Grid from "../components/layout/Grid";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon from "../components/ui/Icon";

export type DetailAction = "consume" | "discard" | "recount" | "history" | "edit" | "delete";

/** UI-04 detail: 7 / 5 split on desktop, stacked on tablet and mobile. */
export default function Detail({ food, attention, movements, onBack, onAction }: { food: FoodEntry; attention: Attention; movements: QuantityMovement[]; onBack: () => void; onAction: (a: DetailAction) => void }) {
  const unit = unitLabel[food.unit];
  const empty = food.remaining_quantity === 0;
  const facts: [string, string, string?][] = [
    ["Ngày theo dõi", fmtDate(food.expiry_date) || "Chưa biết ngày", food.expiry_date_certainty === "estimated" ? "Ngày ước tính" : undefined],
    ["Nguồn ngày", food.expiry_date_source ? sourceLabel[food.expiry_date_source] : "Không rõ nguồn"],
    ["Loại nhãn", food.expiry_date_label_type ? labelTypeLabel[food.expiry_date_label_type] : "Không rõ loại nhãn"],
    ["Vị trí", food.storage_location || "Chưa ghi vị trí"],
    ["Ngày mở", fmtDate(food.opened_on) || "Chưa ghi nhận"],
    ["Ghi chú", food.note || "Không có ghi chú"],
  ];
  return <Grid className="page">
    <button className="back-link col-span-full" onClick={onBack}><Icon name="back" />Quay lại kho</button>
    <Card className="detail-main col-span-full lg:col-span-7">
      <div className="detail-title"><div><span className="eyebrow">{empty ? "ĐÃ HẾT" : "ĐANG CÓ TRONG KHO"}</span><h1>{food.name}</h1></div><button className="icon-button" aria-label="Xóa bản ghi" onClick={() => onAction("delete")}><Icon name="trash" /></button></div>
      <div className="hero-quantity"><span className="eyebrow">LƯỢNG CÒN</span><strong>{fmtQty(food.remaining_quantity)} <small>{unit}</small></strong></div>
      <div className="attention-panel"><Badge type={attention} /><p>Theo ngày bạn đã ghi, không phải đánh giá an toàn.</p></div>
      <div className="action-row"><Button disabled={empty} onClick={() => onAction("consume")}>Ghi nhận đã dùng</Button><Button disabled={empty} variant="secondary" onClick={() => onAction("discard")}>Ghi nhận đã bỏ</Button><Button variant="ghost" onClick={() => onAction("recount")}>Kiểm lại số lượng</Button></div>
    </Card>
    <div className="detail-aside col-span-full lg:col-span-5">
      <Card title="Thông tin" action={<button className="text-link" onClick={() => onAction("edit")}><Icon name="edit" />Sửa</button>}>
        <dl className="facts">{facts.map(([k, v, note]) => <div key={k}><dt>{k}</dt><dd>{v}{note && <small>{note}</small>}</dd></div>)}</dl>
      </Card>
      <Card title="Lịch sử lượng" action={<button className="text-link" onClick={() => onAction("history")}>Xem tất cả</button>}>
        {movements.slice(0, 3).map(m => <div className="history-row" key={m.id}><span><Icon name="history" /></span><p><strong>{movementLabel[m.kind]}</strong><small>{fmtTime(m.recorded_at)}</small></p><em>{fmtQty(m.quantity_before)} → {fmtQty(m.quantity_after)} {unit}</em></div>)}
      </Card>
    </div>
  </Grid>;
}
