import type { Attention, DateCertainty, DateLabelType, DateSource, MovementKind, Unit } from "../mockApi";

export const unitLabel: Record<Unit, string> = { piece: "cái", g: "g", ml: "ml" };
export const certaintyLabel: Record<DateCertainty, string> = { exact: "Chính xác", estimated: "Ước tính", unknown: "Chưa rõ" };
export const sourceLabel: Record<DateSource, string> = { package_label: "Bao bì", user_reentered: "Nhập lại", user_estimate: "Ước tính" };
export const labelTypeLabel: Record<DateLabelType, string> = { use_by: "Hạn dùng", best_before: "Dùng tốt trước", unknown: "Khác" };
export const movementLabel: Record<MovementKind, string> = { initial: "Ban đầu", consume: "Đã dùng", discard: "Đã bỏ", recount: "Kiểm lại" };

export const attentionLabel: Record<Attention, string> = {
  past: "Quá hạn",
  today: "Hôm nay",
  soon: "Sắp hết",
  unknown: "Chưa rõ",
  later: "Còn hạn",
};

export const attentionReason = attentionLabel;

export const attentionGroups: [Attention, string][] = [
  ["past", "Đã quá hạn"],
  ["today", "Hôm nay"],
  ["soon", "Sắp tới hạn"],
  ["unknown", "Chưa có hạn"],
];

export const locations = ["Ngăn mát", "Ngăn đông", "Ngăn rau", "Tủ bếp", "Kệ bếp"];

export const fmtQty = (n: number) => n.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
export const fmtDate = (d: string | null) => (d ? d.split("-").reverse().join("/") : "");
export const fmtTime = (ts: string) => new Date(ts).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
