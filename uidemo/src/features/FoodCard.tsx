import type { Attention, FoodEntry } from "../mockApi";
import { fmtDate, fmtQty, unitLabel } from "../lib/format";
import Badge from "../components/ui/Badge";
import Icon from "../components/ui/Icon";

export default function FoodCard({
  food,
  attention,
  onOpen,
}: {
  food: FoodEntry;
  attention: Attention;
  onOpen: () => void;
}) {
  const dateFormatted = food.expiry_date
    ? `${food.expiry_date_certainty === "estimated" ? "~" : ""}${fmtDate(food.expiry_date)}`
    : null;

  return (
    <button className={`food-card tone-${attention}`} onClick={onOpen} type="button">
      <span className="food-main">
        <span className="food-name">{food.name}</span>
        <span className="food-meta">
          {/* Badge is the urgency signal — first, leftmost, most prominent */}
          <Badge type={attention} />
          {food.storage_location && (
            <>
              <i />
              <span className="loc">{food.storage_location}</span>
            </>
          )}
          {dateFormatted && (
            <>
              <i />
              <span className="date">{dateFormatted}</span>
            </>
          )}
        </span>
      </span>
      {/* Quantity: fixed-width right column, prominent number */}
      <span className="qty-col">
        <span className="qty-num">{fmtQty(food.remaining_quantity)}</span>
        <span className="qty-unit">{unitLabel[food.unit]}</span>
      </span>
      <Icon name="arrow" />
    </button>
  );
}
