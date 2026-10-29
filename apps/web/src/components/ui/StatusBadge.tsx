import type { ReactNode } from "react"

import { CircleAlert, CircleCheck, Clock, HelpCircle } from "./Icon"

export type FoodStatus = "ok" | "soon" | "expired" | "unknown"

export interface FoodLike {
  expiry_date?: string | null

  expDate?: string | null
}

export function computeDaysLeft(dateStr?: string | null): number | null {
  if (!dateStr) return null

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date())

  const diffMs =
    new Date(dateStr + "T00:00:00").getTime() -
    new Date(todayStr + "T00:00:00").getTime()

  return Math.round(diffMs / 864e5)
}

export function computeStatusOf(
  dateStr: string | null | undefined,

  remindDays = 3,
): FoodStatus {
  const d = computeDaysLeft(dateStr)

  if (d === null) return "unknown"

  if (d < 0) return "expired"

  if (d <= remindDays) return "soon"

  return "ok"
}

export function computeStatusText(
  dateStr: string | null | undefined,

  remindDays = 3,
): string {
  const d = computeDaysLeft(dateStr)

  const st = computeStatusOf(dateStr, remindDays)

  if (st === "unknown") return "Chưa rõ HSD"

  if (st === "expired") return `Quá HSD ${Math.abs(d as number)} ngày`

  if (d === 0) return "Hết HSD hôm nay"

  return st === "soon" ? `Sắp HSD · còn ${d} ngày` : "Còn hạn"
}

const statusIcon: Record<FoodStatus, ReactNode> = {
  ok: <CircleCheck size={14} aria-hidden />,

  soon: <Clock size={14} aria-hidden />,

  expired: <CircleAlert size={14} aria-hidden />,

  unknown: <HelpCircle size={14} aria-hidden />,
}

const statusTone: Record<FoodStatus, string> = {
  ok: "bg-status-ok-bg text-status-ok border-status-ok/20",

  soon: "bg-status-soon-bg text-status-soon border-status-soon/20",

  expired: "bg-status-expired-bg text-status-expired border-status-expired/20",

  unknown: "bg-bg-subtle text-text-secondary border-border-primary/50",
}

export function StatusBadge({
  food,

  status,

  remindDays = 3,

  className = "",
}: {
  food?: FoodLike

  status?: FoodStatus

  remindDays?: number

  className?: string
}) {
  const dateStr = food?.expiry_date ?? food?.expDate

  const st: FoodStatus = status ?? computeStatusOf(dateStr, remindDays)

  const label = computeStatusText(dateStr, remindDays)

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-corner-full border px-2.5 py-0.5 text-xs font-semibold ${statusTone[st]} ${className}`}
    >
      {statusIcon[st]}
      <span>{label}</span>
    </span>
  )
}

export function Tag({
  label,

  variant = "brand",
}: {
  label: string

  variant?: "brand" | "neutral"
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-corner-full text-xs font-medium ${
        variant === "brand"
          ? "bg-brand-accent text-brand-primary"
          : "bg-bg-subtle text-text-secondary"
      }`}
    >
      {label}
    </span>
  )
}

export default StatusBadge
