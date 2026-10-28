import { useState } from "react"
import type { Dispatch, Food, State } from "../store/appStore"
import {
  addDays,
  daysLeft,
  formatDate,
  statusOf,
  today,
  CATEGORY_LABELS,
} from "../store/appStore"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import EmptyState from "../components/ui/EmptyState"
import {
  CalendarClock,
  CircleAlert,
  Clock,
  Pencil,
  SearchX,
  Trash2,
} from "../components/ui/Icon"
import InputField from "../components/ui/InputField"
import Modal from "../components/ui/Modal"
import PageHeader from "../components/ui/PageHeader"
import SectionTitle from "../components/ui/SectionTitle"
import StatusBadge from "../components/ui/StatusBadge"

export type DetailAction = "consume" | "discard" | "recount" | "history" | "edit" | "date" | "delete"

type QtyKind = "consume" | "discard" | "adjust"

interface QtyCopyConfig {
  t: string
  label: string
  verb: string
}

const qtyCopy: Record<QtyKind, QtyCopyConfig> = {
  consume: { t: "Ghi nhận đã dùng", label: "Lượng đã dùng", verb: "Đã dùng" },
  discard: { t: "Ghi nhận đã bỏ", label: "Lượng đã bỏ", verb: "Đã bỏ" },
  adjust: {
    t: "Điều chỉnh số lượng",
    label: "Số lượng thực tế",
    verb: "Đã chỉnh về",
  },
}

export function Detail({
  state,
  id,
  dispatch,
  onEdit,
  onBack,
  notify,
}: {
  state: State
  id: string
  dispatch: Dispatch
  onEdit: (food: Food) => void
  onBack: () => void
  notify: (m: string, v?: "success" | "danger" | "warning") => void
}) {
  const f = state.foods.find((x) => x.id === id)
  const [qty, setQty] = useState<QtyKind | null>(null)
  const [val, setVal] = useState("")
  const [step, setStep] = useState<"enter" | "review">("enter")
  const [err, setErr] = useState("")
  const [later, setLater] = useState(false)
  const [laterDate, setLaterDate] = useState(addDays(today(), 1))
  const [confirmTrash, setConfirmTrash] = useState(false)

  if (!f || f.deletedAt) {
    return (
      <EmptyState
        icon={<SearchX size={32} />}
        title="Không còn trong kho"
        text="Bản ghi này đã được chuyển đi hoặc không tồn tại."
        action={
          <Button variant="neutral" onClick={onBack}>
            Quay lại
          </Button>
        }
      />
    )
  }

  const rd = state.settings.remindDays
  const st = statusOf(f, rd)
  const d = daysLeft(f)
  const t = today()
  const isReviewDue = f.reviewAt !== undefined && f.reviewAt <= t

  const n = Number(val.replace(",", "."))
  const to = qty === "adjust" ? n : +(f.quantity - n).toFixed(3)

  function next() {
    if (!/^\d+([.,]\d{1,3})?$/.test(val.trim())) {
      return setErr("Chỉ nhập số, ví dụ 1 hoặc 0.5.")
    }
    if (qty !== "adjust" && n <= 0) return setErr("Lượng phải lớn hơn 0.")
    if (qty !== "adjust" && n > f!.quantity) {
      return setErr(`Không thể lớn hơn ${f!.quantity} ${f!.unit} đang có.`)
    }
    if (qty === "adjust" && n === f!.quantity) {
      return setErr("Số lượng chưa thay đổi.")
    }
    setErr("")
    setStep("review")
  }

  function confirm() {
    dispatch({ type: "qty", id: f!.id, kind: qty!, value: n })
    notify(
      to === 0
        ? `${f!.name} đã hết — chuyển vào Lịch sử`
        : `${qtyCopy[qty!].verb}: còn ${to} ${f!.unit}`,
    )
    setQty(null)
    if (to === 0) onBack()
  }

  const openQty = (k: QtyKind) => {
    setQty(k)
    setVal(k === "adjust" ? String(f.quantity) : "")
    setStep("enter")
    setErr("")
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <PageHeader
        title={f.name}
        onBack={onBack}
        actions={
          <Button
            variant="neutral"
            size="small"
            iconStart={<Pencil size={16} />}
            onClick={() => onEdit(f)}
          >
            Sửa
          </Button>
        }
      />

      {/* Contextual guidance banner based on HCI and food safety principles */}
      {st === "expired" && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-corner-md border border-status-expired/30 bg-status-expired-bg px-4 py-3 text-sm text-status-expired shadow-xs"
        >
          <CircleAlert
            size={20}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <div className="flex-1">
            <p className="font-semibold">Món đã quá hạn sử dụng</p>
            <p className="mt-1 text-xs md:text-sm text-status-expired/90">
              Đã quá HSD {d !== null ? Math.abs(d) : 1} ngày. Hãy kiểm tra cảm
              quan thực tế: nếu còn dùng tốt hãy ưu tiên dùng ngay, hoặc chọn{" "}
              <strong>Đã bỏ</strong> để kho luôn phản ánh đúng. Expiry không tự
              ý xóa thực phẩm của bạn.
            </p>
          </div>
        </div>
      )}

      {st === "soon" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-corner-md border border-status-soon/30 bg-status-soon-bg px-4 py-3 text-sm text-status-soon shadow-xs"
        >
          <Clock size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Món sắp hết hạn</p>
            <p className="mt-1 text-xs md:text-sm text-status-soon/90">
              {d === 0
                ? "Món hết hạn hôm nay."
                : `Còn ${d} ngày trước khi hết HSD.`}{" "}
              Hãy ưu tiên sử dụng sớm trước khi thực phẩm hỏng.
            </p>
          </div>
        </div>
      )}

      {isReviewDue && st !== "expired" && st !== "soon" && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-corner-md border border-brand-primary/30 bg-brand-tertiary px-4 py-3 text-sm text-brand-primary shadow-xs"
        >
          <CalendarClock
            size={20}
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <div className="flex-1">
            <p className="font-semibold">Đến ngày hẹn kiểm tra lại</p>
            <p className="mt-1 text-xs md:text-sm text-text-secondary">
              Đến ngày hẹn ({formatDate(f.reviewAt)}). Vui lòng kiểm tra thực tế
              xem món còn dùng tốt không rồi ghi nhận hoặc hẹn lịch mới.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <StatusBadge food={f} remindDays={rd} />
            {f.reviewAt && (
              <p className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                <CalendarClock
                  size={16}
                  aria-hidden="true"
                  className="text-brand-primary"
                />{" "}
                Hẹn kiểm tra lại: {formatDate(f.reviewAt)}
              </p>
            )}
            <dl className="grid grid-cols-2 gap-4 pt-2 border-t border-border-primary/40">
              {[
                ["Số lượng", `${f.quantity} ${f.unit}`],
                ["Nơi bảo quản", f.location || "Chưa chọn"],
                [
                  "Danh mục",
                  f.category
                    ? CATEGORY_LABELS[f.category] || f.category
                    : "Chưa phân loại",
                ],
                [
                  "Ngày sản xuất",
                  f.mfgDate ? formatDate(f.mfgDate) : "Chưa rõ",
                ],
                [
                  "Hạn sử dụng",
                  f.expDate ? formatDate(f.expDate) : "Chưa rõ HSD",
                ],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs text-text-secondary">{k}</dt>
                  <dd className="text-sm font-semibold text-text-primary mt-0.5 break-words">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <Card className="flex flex-col gap-3">
          <SectionTitle>Thao tác nhanh</SectionTitle>
          <Button variant="primary" onClick={() => openQty("consume")}>
            Đã dùng
          </Button>
          <Button variant="neutral" onClick={() => openQty("discard")}>
            Đã bỏ
          </Button>
          <Button variant="neutral" onClick={() => openQty("adjust")}>
            Điều chỉnh số lượng
          </Button>
          <Button
            variant="neutral"
            iconStart={<CalendarClock size={18} />}
            onClick={() => setLater(true)}
          >
            Hẹn kiểm tra lại
          </Button>
          <Button
            variant="subtle"
            iconStart={<Trash2 size={18} />}
            onClick={() => setConfirmTrash(true)}
          >
            Chuyển vào Thùng rác
          </Button>
        </Card>
      </div>

      {/* Quantity Modal */}
      <Modal
        isOpen={!!qty}
        onClose={() => setQty(null)}
        title={
          qty ? (step === "review" ? "Xem lại thay đổi" : qtyCopy[qty].t) : ""
        }
        size="small"
        footer={
          step === "enter" ? (
            <>
              <Button variant="neutral" onClick={() => setQty(null)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={next}>
                Tiếp
              </Button>
            </>
          ) : (
            <>
              <Button variant="neutral" onClick={() => setStep("enter")}>
                Sửa lại
              </Button>
              <Button variant="primary" onClick={confirm}>
                Xác nhận
              </Button>
            </>
          )
        }
      >
        {qty && step === "enter" && (
          <div className="flex flex-col gap-4">
            {(qty === "consume" || qty === "discard") && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-secondary">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setVal(String(f.quantity))
                    setErr("")
                  }}
                  className="rounded-corner-full border border-border-primary bg-surface-bg px-2.5 py-1 text-xs font-medium text-text-primary hover:border-brand-primary transition-colors cursor-pointer"
                >
                  {qty === "consume" ? "Dùng hết" : "Bỏ hết"} ({f.quantity}{" "}
                  {f.unit})
                </button>
                {f.quantity > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setVal("1")
                      setErr("")
                    }}
                    className="rounded-corner-full border border-border-primary bg-surface-bg px-2.5 py-1 text-xs font-medium text-text-primary hover:border-brand-primary transition-colors cursor-pointer"
                  >
                    1 {f.unit}
                  </button>
                )}
                {f.quantity >= 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setVal(String(+(f.quantity / 2).toFixed(2)))
                      setErr("")
                    }}
                    className="rounded-corner-full border border-border-primary bg-surface-bg px-2.5 py-1 text-xs font-medium text-text-primary hover:border-brand-primary transition-colors cursor-pointer"
                  >
                    Một nửa ({+(f.quantity / 2).toFixed(2)} {f.unit})
                  </button>
                )}
              </div>
            )}
            <InputField
              label={`${qtyCopy[qty].label} (${f.unit})`}
              inputMode="decimal"
              value={val}
              onChange={(v: string) => {
                setVal(v)
                setErr("")
              }}
              description={`Đang ghi nhận: ${f.quantity} ${f.unit}`}
              autoFocus
            />
            {err && (
              <p role="alert" className="text-xs text-danger font-medium">
                {err}
              </p>
            )}
          </div>
        )}

        {qty && step === "review" && (
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-text-secondary">
              {qtyCopy[qty].verb}
              {qty !== "adjust" ? `: ${n} ${f.unit}` : ""}
            </p>
            <p className="text-base font-bold text-text-primary">
              {f.quantity} {f.unit} → {to} {f.unit}
            </p>
            {to === 0 && (
              <p className="text-xs text-text-secondary bg-bg-subtle p-2.5 rounded-corner-md">
                Món sẽ rời khỏi kho và được lưu trong Lịch sử để bạn thêm lại
                khi mua mới.
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={later}
        onClose={() => setLater(false)}
        title="Hẹn kiểm tra lại"
        size="small"
        footer={
          <>
            <Button variant="neutral" onClick={() => setLater(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              disabled={!laterDate || laterDate <= today()}
              onClick={() => {
                dispatch({ type: "review", id: f.id, date: laterDate })
                setLater(false)
                notify(`Sẽ nhắc lại ngày ${formatDate(laterDate)}`)
              }}
            >
              Lưu lịch hẹn
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                size="small"
                variant={
                  laterDate === addDays(today(), num) ? "primary" : "neutral"
                }
                onClick={() => setLaterDate(addDays(today(), num))}
              >
                {num} ngày nữa
              </Button>
            ))}
          </div>
          <InputField
            label="Hoặc chọn ngày cụ thể"
            type="date"
            value={laterDate}
            onChange={setLaterDate}
            min={addDays(today(), 1)}
          />
          <p className="text-xs text-text-secondary">
            Ngày hẹn chỉ dời lời nhắc. HSD ghi trên nhãn thực phẩm không bị thay
            đổi.
          </p>
        </div>
      </Modal>

      {/* Trash Modal */}
      <Modal
        isOpen={confirmTrash}
        onClose={() => setConfirmTrash(false)}
        title="Chuyển vào Thùng rác?"
        size="small"
        footer={
          <>
            <Button variant="neutral" onClick={() => setConfirmTrash(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: "trash", id: f.id })
                notify("Đã chuyển vào Thùng rác")
                onBack()
              }}
            >
              Chuyển vào Thùng rác
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          Dùng khi bản ghi bị nhập sai hoặc không cần theo dõi nữa. Bạn có thể
          khôi phục trong vòng 30 ngày. Để ghi lại món đã ăn hoặc đã bỏ đi, hãy
          dùng nút &quot;Đã dùng&quot; hoặc &quot;Đã bỏ&quot;.
        </p>
      </Modal>
    </div>
  )
}

export default Detail
