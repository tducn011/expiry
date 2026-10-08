import type { Attention } from "../../mockApi";
import { attentionLabel } from "../../lib/format";
import Icon from "./Icon";

export default function Badge({ type }: { type: Attention }) {
  const icon = type === "unknown" || type === "past" ? "alert" : "clock";
  return (
    <span className={`badge ${type}`}>
      <Icon name={icon} />
      {attentionLabel[type]}
    </span>
  );
}
