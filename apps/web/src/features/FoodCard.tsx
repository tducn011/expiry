import type { Attention, FoodEntry } from "../mockApi"
import { attentionLabel, fmtDate, fmtQty, unitLabel } from "../lib/format"
import Badge from "../components/ui/Badge"
import Icon from "../components/ui/Icon"
import type { DetailAction } from "./Detail"

export default function FoodCard({
  food,
  attention,
  onOpen,
  onAction,
}: {
  food: FoodEntry
  attention: Attention
  onOpen: () => void
  onAction: (action: DetailAction) => void
}) {
  const dateFormatted = food.expiry_date
    ? `${
        food.expiry_date_certainty === "estimated" ? "Ước tính: " : ""
      }${fmtDate(food.expiry_date)}`
    : null

  return (
    <article className="food-row">
      <button
        className={`food-card tone-${attention}${
          fmtQty(food.remaining_quantity).length > 8 ? " large-quantity" : ""
        }`}
        onClick={onOpen}
        type="button"
        aria-label={`Xem ${food.name}, đang ghi nhận ${fmtQty(food.remaining_quantity)} ${unitLabel[food.unit]}, ${attentionLabel[attention]}${
          food.storage_location ? `, ${food.storage_location}` : ""
        }${dateFormatted ? `, ${dateFormatted}` : ""}`}
      >
        <span className="food-kind-icon">
          <Icon
            name={
              food.unit === "ml" ? "bottle" : food.unit === "g" ? "leaf" : "box"
            }
          />
        </span>
        <span className="food-main">
          <span className="food-name">{food.name}</span>
          <span className="food-meta">
            <span className="loc">
              {food.storage_location || "Chưa chọn vị trí"}
            </span>
            <span className="date">{dateFormatted || "Chưa ghi ngày"}</span>
          </span>
          <Badge type={attention} />
        </span>
        {/* Quantity: fixed-width right column, prominent number */}
        <span className="qty-col">
          <span className="qty-num">{fmtQty(food.remaining_quantity)}</span>
          <span className="qty-unit">{unitLabel[food.unit]}</span>
        </span>
        <Icon name="arrow" />
      </button>
      <div className="food-row-actions" aria-label={`Cập nhật ${food.name}`}>
        {attention === "unknown" && food.remaining_quantity > 0 ? (
          <button
            type="button"
            className="row-action primary"
            onClick={() => onAction("date")}
            aria-label={`Thêm ngày cho ${food.name}`}
          >
            <Icon name="edit" />
            Thêm ngày
          </button>
        ) : food.remaining_quantity > 0 ? (
          <button
            type="button"
            className={`row-action ${attention === "past" ? "danger" : "primary"}`}
            onClick={() =>
              onAction(attention === "past" ? "discard" : "consume")
            }
            aria-label={`Ghi ${
              attention === "past" ? "đã bỏ" : "đã dùng"
            } ${food.name}`}
          >
            <Icon name={attention === "past" ? "trash" : "check"} />
            {attention === "past" ? "Đã bỏ" : "Đã dùng"}
          </button>
        ) : null}
        <button
          type="button"
          className="row-action"
          onClick={() => onAction("recount")}
          aria-label={`Kiểm lại ${food.name}`}
        >
          <Icon name="review" />
          Kiểm lại
        </button>
      </div>
    </article>
  )
}
