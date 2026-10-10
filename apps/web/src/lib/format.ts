import type {
  Attention,
  DateCertainty,
  DateLabelType,
  DateSource,
  MovementKind,
  Unit,
} from "../mockApi"

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
  past: "Đã qua ngày theo dõi",
  today: "Đến ngày theo dõi",
  soon: "Sắp đến ngày theo dõi",
  unknown: "Chưa có ngày theo dõi",
  later: "Chưa đến ngày theo dõi",
}

export const attentionReason = attentionLabel

export const attentionGroups: [Attention, string][] = [
  ["past", "Kiểm tra trước khi quyết định"],
  ["today", "Đến ngày đã ghi"],
  ["soon", "Xem cho bữa tiếp theo"],
  ["unknown", "Cần bổ sung thông tin"],
]

export const attentionGuidance: Record<Attention, {
  title: string
  body: string
}> = {
  past: {
    title: "Ngày đã ghi đã qua",
    body: "Đối chiếu nhãn và tình trạng thực tế. Sửa thông tin nếu ghi sai; ghi nhận đã bỏ nếu bạn đã loại bỏ thực phẩm.",
  },
  today: {
    title: "Xem lại món này khi chọn bữa tiếp theo",
    body: "Đã đến ngày bạn ghi. Xem lượng, vị trí và thông tin thực tế trước khi quyết định; chỉ ghi nhận đã dùng sau khi bạn đã sử dụng.",
  },
  soon: {
    title: "Kế hoạch bữa ăn đổi? Xem món này trước",
    body: "Ngày bạn ghi đang đến gần. Xem lượng và vị trí để cân nhắc cho bữa tiếp theo; có thể kiểm lại nếu thông tin chưa khớp.",
  },
  unknown: {
    title: "Cần biết thêm trước khi ưu tiên",
    body: "Chưa có ngày theo dõi nên chưa thể xếp ưu tiên theo ngày. Bổ sung từ nhãn nếu có, hoặc giữ chưa biết và kiểm tra thực tế.",
  },
  later: {
    title: "Xem lại kho trước khi mua thêm",
    body: "Chưa đến ngày bạn ghi. Kiểm tra lượng thực tế và ghi nhận nếu đã dùng để thông tin trong kho theo kịp.",
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
export const fmtTime = (ts: string) =>
  new Date(ts).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
