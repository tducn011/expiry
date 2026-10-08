import type { FoodEntry, QuantityMovement } from "../mockApi";
import { fmtQty, fmtTime, movementLabel, unitLabel } from "../lib/format";
import Button from "../components/ui/Button";
import Modal, { ModalActions } from "../components/ui/Modal";

/** UI-09 read-only timeline. A list, not a form: only the timeline region may scroll. */
export default function History({ food, movements, onClose }: { food: FoodEntry; movements: QuantityMovement[]; onClose: () => void }) {
  const unit = unitLabel[food.unit];
  return <Modal size="wide" layout="list" eyebrow={food.name} title="Lịch sử số lượng" description="Thời điểm là lúc app ghi nhận thay đổi." onClose={onClose} footer={<ModalActions end={<Button variant="secondary" onClick={onClose}>Đóng</Button>} />}>
    <div className="timeline">{movements.map(m => {
      const delta = +(m.quantity_after - m.quantity_before).toFixed(3);
      return <div className="timeline-item" key={m.id}><span className={`timeline-dot ${m.kind}`} /><div><span>{fmtTime(m.recorded_at)}</span><h3>{movementLabel[m.kind]}</h3>{m.reason && <p>{m.reason}</p>}</div><strong>{fmtQty(m.quantity_before)} → {fmtQty(m.quantity_after)} {unit}<small>{delta > 0 ? "+" : ""}{fmtQty(delta)} {unit}</small></strong></div>;
    })}</div>
  </Modal>;
}
