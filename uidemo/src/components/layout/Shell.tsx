import { ReactNode } from "react";
import Icon from "../ui/Icon";

export type View = "home" | "inventory" | "attention" | "reviews" | "settings" | "trash";

type NavItem = {
  id: View;
  label: string;
  short: string;
  icon: string;
  badge?: number;
};

export default function Shell({
  view,
  setView,
  children,
  onAdd,
  displayName,
  attentionCount,
  urgentReviewCount = 0,
}: {
  view: View;
  setView: (v: View) => void;
  children: ReactNode;
  onAdd: () => void;
  displayName: string;
  attentionCount: number;
  urgentReviewCount?: number;
}) {
  const sidebarNav: NavItem[] = [
    { id: "home", label: "Trang chủ", short: "Trang chủ", icon: "home" },
    { id: "inventory", label: "Kho thực phẩm", short: "Kho", icon: "box" },
    { id: "attention", label: "Cần chú ý", short: "Chú ý", icon: "clock", badge: attentionCount },
    { id: "reviews", label: "Kiểm kê & Đánh giá", short: "Kiểm kê", icon: "review", badge: urgentReviewCount },
    { id: "trash", label: "Thùng rác", short: "Thùng rác", icon: "trash" },
    { id: "settings", label: "Cài đặt", short: "Cài đặt", icon: "settings" },
  ];

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="brand" onClick={() => setView("home")} style={{ cursor: "pointer" }}>
          <span>EXPIRY</span>
          <small>Gọn kho, rõ ngày</small>
        </div>

        {/* Powerful Centerpiece Add Button */}
        <button className="sidebar-add hero-add-button" onClick={onAdd} type="button">
          <span className="add-icon-wrap">
            <Icon name="plus" />
          </span>
          <span className="add-text">
            <strong>Thêm thực phẩm</strong>
            <small>Ghi nhanh vài giây</small>
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
                <em className={`count ${n.id === "reviews" ? "review-count" : ""}`}>
                  {n.badge}
                </em>
              )}
            </button>
          ))}
        </nav>

        <div className="profile">
          <span className="avatar">{displayName.split(" ").pop()?.[0]}</span>
          <span>
            <strong>{displayName}</strong>
            <small>Bản demo cục bộ</small>
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="shell-main">{children}</main>

      {/* Mobile Bottom Dock with Add Button Centered as the primary CTA */}
      <nav className="bottom-dock-nav" aria-label="Điều hướng chính di động">
        <button
          type="button"
          aria-current={view === "home" ? "page" : undefined}
          className={`dock-tab ${view === "home" ? "active" : ""}`}
          onClick={() => setView("home")}
        >
          <Icon name="home" />
          <span>Trang chủ</span>
        </button>

        <button
          type="button"
          aria-current={view === "inventory" ? "page" : undefined}
          className={`dock-tab ${view === "inventory" ? "active" : ""}`}
          onClick={() => setView("inventory")}
        >
          <Icon name="box" />
          <span>Kho</span>
        </button>

        {/* Center Hero Add Action */}
        <div className="dock-center-action">
          <button
            type="button"
            className="dock-hero-add-btn"
            onClick={onAdd}
            aria-label="Thêm thực phẩm mới"
          >
            <Icon name="plus" />
          </button>
          <span className="dock-hero-label">Thêm</span>
        </div>

        <button
          type="button"
          aria-current={view === "reviews" ? "page" : undefined}
          className={`dock-tab ${view === "reviews" ? "active" : ""}`}
          onClick={() => setView("reviews")}
        >
          <div className="dock-icon-wrap">
            <Icon name="review" />
            {urgentReviewCount > 0 && <span className="dock-badge-dot" />}
          </div>
          <span>Kiểm kê</span>
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
