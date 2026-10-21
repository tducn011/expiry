import type { FoodEntry, QuantityMovement } from "../domain/types"

import { fmtQty, fmtTime, movementLabel, unitLabel } from "../lib/format"

import Button from "../components/ui/Button"

import Modal, { ModalActions } from "../components/ui/Modal"

/** UI-09 read-only timeline. A list, not a form: only the timeline region may scroll. */

export default function History({
  timezone = "Asia/Ho_Chi_Minh",

  food,

  movements,

  onClose,

  active = true,
}: {
  timezone?: string

  food: FoodEntry

  movements: QuantityMovement[]

  onClose: () => void

  active?: boolean
}) {
  const unit = unitLabel[food.unit]

  return (
    <Modal
      size="wide"
      layout="list"
      eyebrow={food.name}
      title="Lịch sử số lượng"
      description="Thời điểm là lúc app ghi nhận thay đổi."
      onClose={onClose}
      active={active}
      footer={
        <ModalActions
          end={
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          }
        />
      }
    >
      <div className="timeline">
        {movements.length === 0 ? (
          <div
            className="inline-hint"
            style={{ padding: "2rem 1.5rem", textAlign: "center" }}
          >
            <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
              Chưa có biến động số lượng
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.8 }}>
              Khi bạn ghi nhận đã dùng, bỏ bớt hoặc kiểm lại số lượng, các mốc thời gian sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          movements.map((m) => {
            const delta = +(m.quantity_after - m.quantity_before).toFixed(3)

            return (
              <div className="timeline-item" key={m.id}>
                <span className={`timeline-dot ${m.kind}`} />
                <div>
                  <span>{fmtTime(m.recorded_at, timezone)}</span>
                  <h3>{movementLabel[m.kind]}</h3>
                  {m.reason && <p>{m.reason}</p>}
                </div>
                <strong>
                  {fmtQty(m.quantity_before)} → {fmtQty(m.quantity_after)}{" "}
                  {unit}
                  <small>
                    {delta > 0 ? "+" : ""}
                    {fmtQty(delta)} {unit}
                  </small>
                </strong>
              </div>
            )
          })
        )}
      </div>
    </Modal>
  )
}
