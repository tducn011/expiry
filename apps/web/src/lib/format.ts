import type {
  Attention,
  DateCertainty,
  DateLabelType,
  DateSource,
  MovementKind,
  Unit,
} from "../domain/types"

export const unitLabel: Record<Unit, string> = {
  piece: "cái",
  g: "g",
  ml: "ml",
}
export const certaintyLabel: Record<DateCertainty, string> = {
  exact: "Chính xác",
  estimated: "Ước tính",
  unknown: "Chưa rõ",
}
export const sourceLabel: Record<DateSource, string> = {
  package_label: "Bao bì",
  user_reentered: "Nhập lại",
  user_estimate: "Ước tính",
}
export const labelTypeLabel: Record<DateLabelType, string> = {
  use_by: "Hạn dùng",
  best_before: "Dùng tốt trước",
  unknown: "Khác",
}
export const movementLabel: Record<MovementKind, string> = {
  initial: "Ban đầu",
  consume: "Đã dùng",
  discard: "Đã bỏ",
  recount: "Kiểm lại",
}

export const attentionLabel: Record<Attention, string> = {
  past: "Đã qua ngày",
  today: "Đến ngày hôm nay",
  soon: "Sắp đến ngày",
  unknown: "Chưa có ngày",
  later: "Chưa đến ngày",
}

export const attentionReason = attentionLabel

export const attentionGroups: [Attention, string][] = [
  ["past", "Cần xem xét"],
  ["today", "Đến ngày đã ghi"],
  ["soon", "Sắp đến ngày"],
  ["unknown", "Chưa có ngày theo dõi"],
]

export const attentionGuidance: Record<Attention, {
  title: string
  body: string
}> = {
  past: {
    title: "Ngày đã ghi đã qua",
    body: "Kiểm tra thực tế, sửa ngày nếu ghi sai hoặc ghi nhận đã bỏ.",
  },
  today: {
    title: "Đến ngày bạn ghi",
    body: "Xem lượng và vị trí; chỉ ghi nhận đã dùng sau khi thực sự sử dụng.",
  },
  soon: {
    title: "Ngày sắp đến",
    body: "Cân nhắc cho bữa tiếp theo; kiểm lại nếu thông tin chưa đúng.",
  },
  unknown: {
    title: "Chưa có ngày theo dõi",
    body: "Bổ sung ngày từ nhãn nếu có, hoặc kiểm tra thực tế.",
  },
  later: {
    title: "Chưa đến ngày",
    body: "Kiểm tra lượng thực tế và ghi nhận nếu đã dùng.",
  },
}

export const locations = [
  "Ngăn mát",
  "Ngăn đông",
  "Ngăn rau",
  "Tủ bếp",
  "Kệ bếp",
]

export const fmtQty = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 3 })
export const fmtDate = (d: string | null) =>
  d ? d.split("-").reverse().join("/") : ""
export const fmtTime = (ts: string, timezone = "Asia/Ho_Chi_Minh") =>
  new Date(ts).toLocaleString("vi-VN", {
    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
