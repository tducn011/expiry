import { useState } from "react";
import type { FoodEntry } from "../mockApi";
import { fmtQty, unitLabel } from "../lib/format";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Icon from "../components/ui/Icon";
import Modal, { ModalActions } from "../components/ui/Modal";

export type MovementMode = "consume" | "discard" | "recount";

const copy: Record<MovementMode, { title: string; amount: string; reason: string; fill?: string }> = {
  consume: { title: "Ghi nhận đã dùng", amount: "Lượng đã dùng *", reason: "Lý do (không bắt buộc)", fill: "Dùng hết" },
  discard: { title: "Ghi nhận đã bỏ", amount: "Lượng đã bỏ *", reason: "Lý do (không bắt buộc)", fill: "Bỏ hết" },
  recount: { title: "Kiểm lại số lượng", amount: "Lượng thực tế đang có *", reason: "Lý do kiểm lại *" },
};

/** UI-05 consume, UI-06 discard, UI-07 recount: one form, `mode` is the variant. */
export default function MovementForm({ food, mode, onClose, onSave }: { food: FoodEntry; mode: MovementMode; onClose: () => void; onSave: (amount: number, reason: string) => void }) {
  const [amount, setAmount] = useState("");
  const [why, setWhy] = useState("");
  const [tried, setTried] = useState(false);
  const text = copy[mode];
  const unit = unitLabel[food.unit];
  const n = Number(amount);
  const recount = mode === "recount";
  const after = recount ? (amount === "" ? food.remaining_quantity : n) : +(food.remaining_quantity - (n || 0)).toFixed(3);
  const amountError = amount === "" ? "Nhập lượng." : food.unit === "piece" && !Number.isInteger(n) ? "Đơn vị “cái” chỉ nhận số nguyên." : recount ? (n < 0 ? "Lượng không thể âm." : "") : n <= 0 ? "Lượng phải lớn hơn 0." : n > food.remaining_quantity ? `Chỉ còn ${fmtQty(food.remaining_quantity)} ${unit}.` : "";
  const reasonError = recount && !why.trim() ? "Nhập lý do kiểm lại." : "";
  const noop = recount && amount !== "" && n === food.remaining_quantity;

  return <Modal layout="form" eyebrow={food.name} title={text.title} onClose={onClose}>
    <form className="stepped-form" noValidate onSubmit={e => { e.preventDefault(); setTried(true); if (!amountError && !reasonError && !noop) onSave(n, why.trim()); }}>
      <div className="form-body compact">
        <Field label={text.amount} error={tried ? amountError : ""}><div className="amount-input"><input autoFocus inputMode="decimal" type="number" min={0} step={food.unit === "piece" ? 1 : 0.001} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />{text.fill && <button type="button" className="fill-all" onClick={() => setAmount(String(food.remaining_quantity))}>{text.fill}</button>}<span>{unit}</span></div></Field>
        <div className="preview"><span>Trước<strong>{fmtQty(food.remaining_quantity)} {unit}</strong></span><Icon name="arrow" /><span>Sau thao tác<strong>{fmtQty(Math.max(0, after))} {unit}</strong></span></div>
        <Field label={text.reason} error={tried ? reasonError : ""} hint={noop ? "Lượng không đổi — sẽ không tạo thêm lịch sử." : `${why.length}/500`}><input maxLength={500} value={why} onChange={e => setWhy(e.target.value)} placeholder={recount ? "Ví dụ: Đếm lại trong tủ" : "Thêm ngữ cảnh nếu cần"} /></Field>
      </div>
      <footer className="modal-footer"><ModalActions start={<Button variant="ghost" onClick={onClose}>Hủy</Button>} end={<Button type="submit" disabled={noop}>Xác nhận</Button>} /></footer>
    </form>
  </Modal>;
}
