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
  expired: "text-status-expired font-semibold",

  soon: "text-status-soon font-semibold",

  ok: "text-status-ok font-semibold",

  unknown: "text-text-tertiary",
}

export const categoryTones: Record<Category, string> = {
  fresh_produce:
    "bg-category-fresh-bg text-category-fresh border border-category-fresh/20",
  meat_seafood:
    "bg-category-meat-bg text-category-meat border border-category-meat/20",
  dairy_eggs:
    "bg-category-dairy-bg text-category-dairy border border-category-dairy/20",
  prepared_food:
    "bg-category-prepared-bg text-category-prepared border border-category-prepared/20",
  dry_pantry:
    "bg-category-pantry-bg text-category-pantry border border-category-pantry/20",
  beverage:
    "bg-category-beverage-bg text-category-beverage border border-category-beverage/20",
  other:
    "bg-surface-subtle text-text-secondary border border-border-primary/50",
}

export interface FoodCardProps {
  food: Food

  remindDays?: number

  onOpen: () => void

  className?: string

  variant?: "card" | "grouped"
}

export function FoodCard({
  food,

  remindDays = 3,

  onOpen,

  className = "",

  variant = "card",
}: FoodCardProps) {
  const st = statusOf(food, remindDays)

  const IconComponent = getFoodIcon(food.name)

  const d = daysLeft(food)

  const category: Category = food.category || inferCategory(food.name)

  let statusLabel: string

  if (st === "expired") {
    statusLabel = `Quá hạn ${d !== null ? Math.abs(d) : 1} ngày`
  } else if (st === "soon") {
    statusLabel = d === 0 ? "Đến hạn hôm nay" : `Còn ${d} ngày`
  } else if (st === "ok") {
    statusLabel = d !== null ? `Còn ${d} ngày` : "Còn hạn"
  } else {
    statusLabel = "Chưa rõ HSD"
  }

  if (variant === "grouped") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={`home-food-row group ${className}`}
      >
        <span aria-hidden="true" className="home-food-icon">
          <IconComponent size={16} strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[16px] leading-[22px] font-semibold text-text-heading">
            {food.name}
          </span>
          <span className="block truncate text-xs leading-5 text-text-secondary">
            {food.quantity} {food.unit}
            {food.location ? ` · ${food.location}` : ""} ·{" "}
            {CATEGORY_LABELS[category] || "Khác"}
          </span>
        </span>
        <span className="home-food-expiry">
          <span
            className={`block text-[13px] leading-5 font-semibold ${rowTone[st]}`}
          >
            {statusLabel}
          </span>
          {food.expDate && (
            <span className="block text-[12px] leading-4 text-text-secondary">
              HSD {formatDate(food.expDate)}
            </span>
          )}
        </span>
      </button>
    )
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
        <IconComponent size={24} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-sm md:text-base font-semibold text-text-heading">
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
          size={16}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </div>
  )
}

export default FoodCard
