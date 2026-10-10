import { ReactNode } from "react"
import Button from "../components/ui/Button"
import Icon from "../components/ui/Icon"
import Modal, { ModalActions } from "../components/ui/Modal"

export type StatusMode = "conflict" | "timeout" | "loading" | "read" | "notfound" | "rate" | "session" | "insufficient"

const content: Record<StatusMode, {
  eyebrow: string
  title: string
  body: string
  action: string
  cancel?: boolean
  extra?: ReactNode
}> = {
  conflict: {
    eyebrow: "DỮ LIỆU ĐÃ THAY ĐỔI",
    title: "Kiểm tra trước khi tiếp tục",
    body: "Bản ghi vừa được cập nhật ở nơi khác. Bản nháp của bạn vẫn được giữ để đối chiếu; Expiry sẽ không tự ghi đè.",
    action: "Dùng dữ liệu mới",
    cancel: true,
    extra: (
      <div className="compare">
        <span>
          <small>Dữ liệu hiện tại</small>
          <strong>350 g</strong>
        </span>
        <span>
          <small>Bản nháp của bạn</small>
          <strong>300 g</strong>
        </span>
      </div>
    ),
  },
  timeout: {
    eyebrow: "KẾT QUẢ CHƯA RÕ",
    title: "Chưa xác nhận được kết quả",
    body: "Kết nối bị gián đoạn sau khi xác nhận. Hãy kiểm tra lại để tránh ghi nhận hai lần.",
    action: "Kiểm tra và thử lại",
    cancel: true,
    extra: (
      <p className="note-box">
        <Icon name="history" />
        <span>
          Thử lại dùng cùng mã yêu cầu và cùng nội dung, không tạo movement
          trùng.
        </span>
      </p>
    ),
  },
  loading: {
    eyebrow: "ĐANG ĐỌC DỮ LIỆU",
    title: "Đang tải kho thực phẩm",
    body: "Expiry đang lấy dữ liệu mới nhất. Nội dung cũ được giữ lại khi làm mới.",
    action: "Đóng",
    extra: (
      <div className="skeleton-stack" aria-label="Đang tải">
        <i />
        <i />
        <i />
      </div>
    ),
  },
  read: {
    eyebrow: "KHÔNG THỂ ĐỌC DỮ LIỆU",
    title: "Chưa tải được kho",
    body: "Có lỗi khi đọc dữ liệu. Không có thay đổi nào được thực hiện; bạn có thể thử lại.",
    action: "Thử lại",
    cancel: true,
  },
  notfound: {
    eyebrow: "KHÔNG TÌM THẤY",
    title: "Bản ghi không còn khả dụng",
    body: "Bản ghi có thể đã bị xóa hoặc bạn không có quyền xem. Expiry không tiết lộ dữ liệu của tài khoản khác.",
    action: "Về kho",
    cancel: true,
  },
  rate: {
    eyebrow: "TẠM THỜI CHẬM LẠI",
    title: "Quá nhiều yêu cầu",
    body: "Hãy chờ một lúc rồi thử lại. Expiry sẽ không tự gửi liên tục trong thời gian này.",
    action: "Đã hiểu",
  },
  session: {
    eyebrow: "PHIÊN ĐÃ HẾT HẠN",
    title: "Đăng nhập lại để tiếp tục",
    body: "Bản nháp hiện tại được giữ. Sau khi xác thực, Expiry đọc dữ liệu mới nhất trước khi cho tiếp tục.",
    action: "Đăng nhập lại",
    cancel: true,
  },
  insufficient: {
    eyebrow: "LƯỢNG ĐÃ THAY ĐỔI",
    title: "Không đủ lượng để ghi nhận",
    body: "Lượng hiện tại đã thay đổi. Hãy điều chỉnh lượng muốn dùng hoặc bỏ trước khi xác nhận lại.",
    action: "Sửa lượng",
    cancel: true,
  },
}

/** Short status dialog shared by recovery states, confirm (UI-10/12) and the auth gate. */
export function Dialog({
  eyebrow,
  title,
  body,
  extra,
  action,
  actionVariant = "primary",
  onAction,
  onClose,
  cancel = true,
  dismissible = true,
}: {
  eyebrow?: string
  title: string
  body: string
  extra?: ReactNode
  action: string
  actionVariant?: "primary" | "danger"
  onAction: () => void
  onClose: () => void
  cancel?: boolean
  dismissible?: boolean
}) {
  return (
    <Modal
      size="compact"
      eyebrow={eyebrow}
      title={title}
      onClose={onClose}
      dismissible={dismissible}
      footer={
        <ModalActions
          start={
            cancel && (
              <Button variant="ghost" onClick={onClose}>
                Hủy
              </Button>
            )
          }
          end={
            <Button variant={actionVariant} onClick={onAction}>
              {action}
            </Button>
          }
        />
      }
    >
      <div className="dialog-body">
        <p>{body}</p>
        {extra}
      </div>
    </Modal>
  )
}

export default function StatusDialog({
  mode,
  onClose,
}: {
  mode: StatusMode
  onClose: () => void
}) {
  const c = content[mode]
  return (
    <Dialog
      eyebrow={c.eyebrow}
      title={c.title}
      body={c.body}
      extra={c.extra}
      action={c.action}
      cancel={c.cancel}
      onAction={onClose}
      onClose={onClose}
    />
  )
}
