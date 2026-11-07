import type { Category, Food } from "../store/appStore"

import {
  CATEGORY_LABELS,
  daysLeft,
  formatDate,
  inferCategory,
  statusOf,
} from "../store/appStore"

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
} from "lucide-react"

export interface FoodKindPattern {
  re: RegExp

  icon: typeof Milk
}

export const foodKinds: FoodKindPattern[] = [
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

export const categoryTones: Record<Category, string> = {
  fresh_produce:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  meat_seafood:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
  dairy_eggs:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  prepared_food:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  dry_pantry:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  beverage:
    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
  other: "bg-surface-subtle text-text-secondary border border-border-primary/50",
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

  const category: Category = food.category || inferCategory(food.name)

  let statusLabel: string

  if (st === "expired") {
    statusLabel = `Quá hạn ${d !== null ? Math.abs(d) : 1} ngày`
  } else if (st === "soon") {
    statusLabel = d === 0 ? "Hết hạn hôm nay" : `Còn ${d} ngày`
  } else if (st === "ok") {
    statusLabel = d !== null ? `Còn ${d} ngày` : "Còn hạn"
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
        className={`flex size-11 shrink-0 items-center justify-center rounded-corner-md transition-transform group-hover:scale-105 shadow-xs ${categoryTones[category]}`}
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
          <span className="text-text-tertiary"> · </span>
          <span className="text-text-tertiary">
            {CATEGORY_LABELS[category] || "Khác"}
          </span>
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
