import { ReactNode } from "react";
import Icon from "../ui/Icon";

export type View = "inventory" | "attention" | "trash" | "settings";

type NavItem = {
  id: View;
  label: string;
  icon: string;
  badge?: number;
};

export default function Shell({
  view,
  setView,
  children,
  onAdd,
  displayName,
  urgentCount = 0,
}: {
  view: View;
  setView: (v: View) => void;
  children: ReactNode;
  onAdd: () => void;
  displayName: string;
  urgentCount?: number;
}) {
  const sidebarNav: NavItem[] = [
    { id: "inventory", label: "Kho thực phẩm", icon: "box" },
    { id: "attention", label: "Cần chú ý", icon: "clock", badge: urgentCount },
    { id: "trash", label: "Thùng rác", icon: "trash" },
    { id: "settings", label: "Cài đặt", icon: "settings" },
  ];

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="brand" onClick={() => setView("inventory")} style={{ cursor: "pointer" }}>
          <span>EXPIRY</span>
          <small>Quản lý hạn dùng</small>
        </div>

        {/* Primary Add Button */}
        <button className="sidebar-add hero-add-button" onClick={onAdd} type="button">
          <span className="add-icon-wrap">
            <Icon name="plus" />
          </span>
          <span className="add-text">
            <strong>Thêm thực phẩm</strong>
          </span>
        </button>

        <nav aria-label="Điều hướng chính">
          {sidebarNav.map((n) => (
            <button
              key={n.id}
              type="button"
              aria-current={view === n.id ? "page" : undefined}
              className={view === n.id ? "active" : ""}
              onClick={() => setView(n.id)}
            >
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.badge !== undefined && n.badge > 0 && (
                <em className="count">{n.badge}</em>
              )}
            </button>
          ))}
        </nav>

        <div className="profile">
          <span className="avatar">{displayName.split(" ").pop()?.[0]}</span>
          <span>
            <strong>{displayName}</strong>
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="shell-main">{children}</main>

      {/* Mobile Bottom Dock */}
      <nav className="bottom-dock-nav" aria-label="Điều hướng chính di động">
        <button
          type="button"
          aria-current={view === "inventory" ? "page" : undefined}
          className={`dock-tab ${view === "inventory" ? "active" : ""}`}
          onClick={() => setView("inventory")}
        >
          <Icon name="box" />
          <span>Kho</span>
        </button>

        <button
          type="button"
          aria-current={view === "attention" ? "page" : undefined}
          className={`dock-tab ${view === "attention" ? "active" : ""}`}
          onClick={() => setView("attention")}
        >
          <div className="dock-icon-wrap">
            <Icon name="clock" />
            {urgentCount > 0 && <span className="dock-badge-dot" />}
          </div>
          <span>Chú ý</span>
        </button>

        {/* Center Hero Add Action */}
        <div className="dock-center-action">
          <button
            type="button"
            className="dock-hero-add-btn"
            onClick={onAdd}
            aria-label="Thêm thực phẩm"
          >
            <Icon name="plus" />
          </button>
          <span className="dock-hero-label">Thêm</span>
        </div>

        <button
          type="button"
          aria-current={view === "trash" ? "page" : undefined}
          className={`dock-tab ${view === "trash" ? "active" : ""}`}
          onClick={() => setView("trash")}
        >
          <Icon name="trash" />
          <span>Thùng rác</span>
        </button>

        <button
          type="button"
          aria-current={view === "settings" ? "page" : undefined}
          className={`dock-tab ${view === "settings" ? "active" : ""}`}
          onClick={() => setView("settings")}
        >
          <Icon name="settings" />
          <span>Cài đặt</span>
        </button>
      </nav>
    </div>
  );
}
