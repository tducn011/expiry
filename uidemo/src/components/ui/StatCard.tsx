import { ReactNode } from "react";
import Icon from "./Icon";

export type StatTone = "default" | "past" | "today" | "soon" | "success" | "neutral";

export default function StatCard({
  title,
  value,
  unit,
  subtext,
  icon,
  tone = "default",
  onClick,
  action,
}: {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: string;
  tone?: StatTone;
  onClick?: () => void;
  action?: ReactNode;
}) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      type={onClick ? "button" : undefined}
      className={`stat-card tone-${tone} ${onClick ? "interactive" : ""}`}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <span className="stat-card-icon"><Icon name={icon} /></span>}
        {action}
      </div>
      <div className="stat-card-body">
        <strong className="stat-card-value">
          {value}
          {unit && <small className="stat-card-unit">{unit}</small>}
        </strong>
        {subtext && <p className="stat-card-subtext">{subtext}</p>}
      </div>
    </Component>
  );
}
