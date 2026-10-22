import type { Attention } from "../../domain/types"

import { attentionLabel } from "../../lib/format"

import Icon from "./Icon"

export default function Badge({ type }: { type: Attention }) {
  const icon =
    type === "unknown" || type === "past" || type === "today"
      ? "alert"
      : "clock"

  return (
    <span className={`badge ${type}`}>
      <Icon name={icon} />
      {attentionLabel[type]}
    </span>
  )
}
