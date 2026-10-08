import type { Attention } from "../../mockApi"
import { attentionReason } from "../../lib/format"
import Icon from "./Icon"

export default function Badge({ type }: { type: Attention }) {
  const icon = type === "unknown" ? "alert" : "clock"
  return (
    <span className={`badge ${type}`}>
      <Icon name={icon} />
      {attentionReason[type]}
    </span>
  )
}
