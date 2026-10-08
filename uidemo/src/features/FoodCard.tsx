import type { Attention, FoodEntry } from "../mockApi"
import { fmtDate, fmtQty, unitLabel } from "../lib/format"
import Badge from "../components/ui/Badge"
import Icon from "../components/ui/Icon"

export default function FoodCard({
  food,
  attention,
  onOpen,
}: {
  food: FoodEntry
  attention: Attention
  onOpen: () => void
}) {
  return (
    <button className={`food-card tone-${attention}`} onClick={onOpen}>
      <span className="food-main">
        <strong>{food.name}</strong>
        <span className="food-meta">
          <Badge type={attention} />
          <span>{food.storage_location || "Chưa ghi vị trí"}</span>
          <i />
          <span>
            {food.expiry_date
              ? `${
                  food.expiry_date_certainty === "estimated"
                    ? "Ước tính · "
                    : ""
                }${fmtDate(food.expiry_date)}`
              : "Chưa có ngày theo dõi"}
          </span>
        </span>
      </span>
      <span className="quantity">
        <strong>{fmtQty(food.remaining_quantity)}</strong>
        <small>{unitLabel[food.unit]}</small>
      </span>
      <Icon name="arrow" />
    </button>
  )
}
