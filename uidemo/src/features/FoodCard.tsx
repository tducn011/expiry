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
        <strong>{food.name}</strong>
        <span className="food-meta">
          <Badge type={attention} />
          {food.storage_location && <span>{food.storage_location}</span>}
          {dateFormatted && (
            <>
              <i />
              <span>{dateFormatted}</span>
            </>
          )}
        </span>
      </span>
      <span className="quantity">
        <strong>{fmtQty(food.remaining_quantity)}</strong>
        <small>{unitLabel[food.unit]}</small>
      </span>
      <Icon name="arrow" />
    </button>
  );
}
