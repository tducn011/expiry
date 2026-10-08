import { ReactNode } from "react";
import Icon from "./Icon";

export default function QuickActionCard({
  title,
  description,
  icon,
  badge,
  badgeTone = "default",
  onClick,
  trailing,
  featured = false,
}: {
  title: string;
  description: string;
  icon: string;
  badge?: string;
  badgeTone?: "default" | "past" | "today" | "soon" | "success";
  onClick: () => void;
  trailing?: ReactNode;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      className={`quick-action-card ${featured ? "featured" : ""}`}
      onClick={onClick}
    >
      <div className="quick-action-icon">
        <Icon name={icon} />
      </div>
      <div className="quick-action-content">
        <div className="quick-action-title-row">
          <strong>{title}</strong>
          {badge && <span className={`quick-action-badge tone-${badgeTone}`}>{badge}</span>}
        </div>
        <p>{description}</p>
      </div>
      <div className="quick-action-trailing">
        {trailing || <Icon name="arrow" />}
      </div>
    </button>
  );
}
