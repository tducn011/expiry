import type { Food } from "../store/appStore"
import { daysLeft, formatDate, statusOf } from "../store/appStore"
import {
  Apple,
  Beef,
  Carrot,
  ChevronRight,
  Croissant,
  CupSoda,
  Drumstick,
  Egg,
  LeafyGreen,
  Milk,
  Package,
  Wheat,
} from "../components/ui/Icon"

export const foodKinds: { re: RegExp; icon: typeof Milk }[] = [
  { re: /sữa chua/i, icon: CupSoda },
  { re: /sữa|phô mai|pho mai|bơ|kem/i, icon: Milk },
  { re: /trứng/i, icon: Egg },
  { re: /thịt gà|gà|vịt/i, icon: Drumstick },
  { re: /thịt|bò|heo|lợn|cá|tôm/i, icon: Beef },
  { re: /cà rốt/i, icon: Carrot },
  { re: /rau|cải|xà lách|hành/i, icon: LeafyGreen },
  { re: /táo|cà chua|cam|chuối|nho|xoài|lê|bưởi/i, icon: Apple },
  { re: /bánh/i, icon: Croissant },
  { re: /gạo|bột|mì|ngũ cốc/i, icon: Wheat },
]

export const getFoodIcon = (name: string) =>
  foodKinds.find((k) => k.re.test(name))?.icon ?? Package

const rowTone: Record<string, string> = {
  expired: "text-status-expired font-medium",
  soon: "text-status-soon font-medium",
  ok: "text-text-secondary",
  unknown: "text-text-secondary",
}

export interface FoodCardProps {
  food: Food
  remindDays?: number
  onOpen: () => void
  className?: string
}

export function FoodCard({
  food,
  remindDays = 3,
  onOpen,
  className = "",
}: FoodCardProps) {
  const st = statusOf(food, remindDays)
  const IconComponent = getFoodIcon(food.name)
  const d = daysLeft(food)

  let statusLabel: string
  if (st === "expired") {
    statusLabel = `Quá hạn ${d !== null ? Math.abs(d) : 1} ngày`
  } else if (st === "soon") {
    statusLabel = d === 0 ? "Hết hạn hôm nay" : `Còn ${d} ngày`
  } else if (st === "ok") {
    statusLabel = "Còn hạn"
  } else {
    statusLabel = "Chưa rõ HSD"
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) =>
        (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())
      }
      className={`group flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover active:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary ${className}`}
    >
      <div
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-corner-md bg-brand-tertiary text-brand-primary transition-transform group-hover:scale-105 shadow-xs"
      >
        <IconComponent size={22} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm md:text-base font-semibold text-text-primary">
          {food.name}
        </p>
        <p className="truncate text-xs text-text-secondary">
          {food.quantity} {food.unit}
          {food.location ? ` · ${food.location}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 text-xs">
          <span className={`whitespace-nowrap ${rowTone[st]}`}>
            {statusLabel}
          </span>
          {food.expDate && (
            <span className="whitespace-nowrap text-text-secondary">
              · HSD {formatDate(food.expDate)}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center text-text-tertiary">
        <ChevronRight
          size={18}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </div>
  )
}

export default FoodCard
