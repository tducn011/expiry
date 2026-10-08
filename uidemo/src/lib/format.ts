import type { Attention, DateCertainty, DateLabelType, DateSource, MovementKind, Unit } from "../mockApi";

export const unitLabel: Record<Unit, string> = { piece: "cái", g: "g", ml: "ml" };
export const certaintyLabel: Record<DateCertainty, string> = { exact: "Có ngày", estimated: "Ước tính", unknown: "Chưa biết" };
export const sourceLabel: Record<DateSource, string> = { package_label: "In trên bao bì", user_reentered: "Tôi nhập lại", user_estimate: "Tôi tự ước tính" };
export const labelTypeLabel: Record<DateLabelType, string> = { use_by: "Hạn sử dụng", best_before: "Dùng tốt nhất trước", unknown: "Không rõ loại nhãn" };
export const movementLabel: Record<MovementKind, string> = { initial: "Khởi tạo", consume: "Đã dùng", discard: "Đã bỏ", recount: "Kiểm lại" };
export const attentionReason: Record<Attention, string> = {
  past: "Ngày đã ghi đã qua",
  today: "Đến ngày đã ghi hôm nay",
  soon: "Còn trong khoảng nhắc trước",
  unknown: "Chưa có ngày theo dõi",
  later: "Chưa đến khoảng nhắc trước",
};
export const attentionGroups: [Attention, string][] = [["past", "Ngày đã qua"], ["today", "Đến ngày hôm nay"], ["soon", "Trong khoảng nhắc"], ["unknown", "Chưa có ngày"]];
export const locations = ["Ngăn mát", "Ngăn đông", "Ngăn rau", "Tủ bếp", "Kệ bếp"];

export const fmtQty = (n: number) => n.toLocaleString("vi-VN", { maximumFractionDigits: 3 });
export const fmtDate = (d: string | null) => (d ? d.split("-").reverse().join("/") : "");
export const fmtTime = (ts: string) => new Date(ts).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
