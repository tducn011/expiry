import { useState, type ReactNode } from "react"

import type { Dispatch, State } from "../store/appStore"

import Button from "../components/ui/Button"

import {
  BellOff,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  LogOut,
  MapPin,
  PackageOpen,
  RotateCcw,
  Trash2,
} from "lucide-react"

import Modal from "../components/ui/Modal"

import LocationManagerModal from "../components/ui/LocationManagerModal"

import PageHeader from "../components/ui/PageHeader"

import SwitchField from "../components/ui/SwitchField"

function SettingsGroup({
  title,

  children,

  footer,
}: {
  title: string

  children: ReactNode

  footer?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div
        role="heading"
        aria-level={2}
        className="px-2 text-xs font-semibold uppercase tracking-wider text-text-secondary"
      >
        {title}
      </div>
      <div className="flex flex-col divide-y divide-border-primary/40 overflow-hidden rounded-corner-lg border border-border-primary/50 bg-surface-bg shadow-xs">
        {children}
      </div>
      {footer && <p className="px-2 text-xs text-text-secondary">{footer}</p>}
    </section>
  )
}

function SettingsRow({
  icon,

  label,

  value,

  onClick,

  disabled,
}: {
  icon: ReactNode

  label: string

  value?: string

  onClick?: () => void

  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled || !onClick}
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors enabled:hover:bg-surface-hover enabled:active:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary cursor-pointer disabled:cursor-default"
    >
      <span aria-hidden="true" className="shrink-0 text-brand-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-text-primary">
        {label}
      </span>
      {value && <span className="text-xs text-text-secondary">{value}</span>}
      {onClick && (
        <ChevronRight
          size={18}
          aria-hidden="true"
          className="shrink-0 text-text-tertiary"
        />
      )}
    </button>
  )
}

export function Settings({
  state,

  dispatch,

  onNavigateTrash,

  onLogin,

  notify,
}: {
  state: State

  dispatch: Dispatch

  onNavigateTrash: () => void

  onLogin?: () => void

  notify: (m: string, v?: "success" | "danger" | "warning") => void
}) {
  const [s, setS] = useState(state.settings)

  const [pickDays, setPickDays] = useState(false)

  const [showLocations, setShowLocations] = useState(false)

  const pushSupported =
    typeof window !== "undefined" && "Notification" in window

  const [perm, setPerm] = useState(
    pushSupported ? Notification.permission : "unsupported",
  )

  const dirty =
    s.remindDays !== state.settings.remindDays ||
    s.inApp !== state.settings.inApp ||
    s.push !== state.settings.push

  async function togglePush(on: boolean) {
    if (!on) return setS({ ...s, push: false })

    if (!pushSupported) return setPerm("unsupported")

    if (perm === "denied") {
      setS({ ...s, push: false })

      return
    }

    try {
      const p = await Notification.requestPermission()

      setPerm(p)

      setS({ ...s, push: p === "granted" })
    } catch {
      setS({ ...s, push: false })
    }
  }

  function sendTestNotification() {
    try {
      if (pushSupported && Notification.permission === "granted") {
        new Notification("Expiry - Nhắc nhở mẫu", {
          body: "Đây là thông báo thử nghiệm trên trình duyệt khi mở ứng dụng.",

          icon: "/favicon.ico",
        })

        notify("Đã gửi thông báo thử nghiệm trên trình duyệt")
      }
    } catch {
      notify("Không thể gửi thông báo trên trình duyệt", "warning")
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Cài đặt"
        subtitle={
          state.mode === "demo"
            ? undefined
            : `Tài khoản: ${state.userName || "Người dùng"}`
        }
      />

      <SettingsGroup
        title="Nhắc nhở hạn sử dụng"
        footer={
          perm === "unsupported"
            ? "Trình duyệt này không hỗ trợ Web Notification API. Bạn vẫn nhận được thông báo bên trong ứng dụng."
            : undefined
        }
      >
        <SettingsRow
          icon={<CalendarClock size={20} />}
          label="Nhắc trước ngày hết hạn"
          value={`${s.remindDays} ngày`}
          onClick={() => setPickDays(true)}
        />
        <div className="min-h-14 px-4 py-3">
          <SwitchField
            label="Thông báo trong ứng dụng"
            description="Hiển thị huy hiệu và danh sách thông báo bên trong Expiry"
            selected={s.inApp}
            onChange={(v) => setS({ ...s, inApp: v })}
          />
        </div>
        <div className="min-h-14 px-4 py-3">
          <SwitchField
            label="Thông báo trên trình duyệt"
            description={
              perm === "unsupported"
                ? "Trình duyệt hiện tại không hỗ trợ Web Notification API"
                : "Gửi thông báo trên trình duyệt khi ứng dụng đang mở"
            }
            selected={s.push}
            disabled={perm === "denied" || perm === "unsupported"}
            onChange={togglePush}
          />
        </div>
        {perm === "granted" && s.push && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border-primary/40 bg-surface-subtle/40">
            <span className="text-xs text-text-secondary">
              Kiểm tra quyền thông báo trên trình duyệt:
            </span>
            <Button
              size="small"
              variant="neutral"
              onClick={sendTestNotification}
            >
              Gửi thông báo thử
            </Button>
          </div>
        )}
        {perm === "denied" && (
          <div
            role="alert"
            className="flex items-start gap-3 bg-status-expired-bg px-4 py-3 text-xs text-status-expired border-t border-status-expired/20"
          >
            <BellOff size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                Thông báo trên trình duyệt đang bị chặn.
              </p>
              <p>
                Trình duyệt đã từ chối quyền gửi thông báo. Để bật lại, hãy mở
                cài đặt trang web này trong trình duyệt của bạn (Site Settings /
                Page info) và chọn Cho phép thông báo.
              </p>
            </div>
          </div>
        )}
        {perm === "unsupported" && (
          <div
            role="status"
            className="flex items-start gap-3 bg-bg-subtle px-4 py-3 text-xs text-text-secondary border-t border-border-primary/40"
          >
            <BellOff size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            <p>
              Trình duyệt hiện tại không hỗ trợ Web Notification API. Bạn vẫn
              nhận được lời nhắc bên trong ứng dụng.
            </p>
          </div>
        )}
      </SettingsGroup>

      {dirty && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-corner-lg bg-brand-tertiary px-4 py-3 border border-brand-primary/30 shadow-xs"
        >
          <p className="min-w-0 flex-1 text-xs md:text-sm font-medium text-text-primary">
            Bạn có thay đổi cài đặt chưa lưu.
          </p>
          <Button
            size="small"
            variant="neutral"
            onClick={() => setS(state.settings)}
          >
            Hủy
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={() => {
              dispatch({ type: "settings", settings: s })

              notify("Đã lưu cài đặt nhắc nhở")
            }}
          >
            Lưu thay đổi
          </Button>
        </div>
      )}

      <SettingsGroup title="Quản lý dữ liệu">
        <SettingsRow
          icon={<Trash2 size={20} />}
          label="Thùng rác"
          onClick={onNavigateTrash}
        />
        <SettingsRow
          icon={<MapPin size={20} />}
          label="Nơi bảo quản"
          value={`${state.locations.length} vị trí`}
          onClick={() => setShowLocations(true)}
        />
      </SettingsGroup>

      {state.mode === "demo" ? (
        <SettingsGroup title="Dữ liệu mẫu">
          <SettingsRow
            icon={<RotateCcw size={20} />}
            label="Nạp lại bộ dữ liệu mẫu"
            onClick={() => {
              dispatch({ type: "demoReset", scenario: "full" })

              notify("Đã nạp lại dữ liệu mẫu đầy đủ")
            }}
          />
          <SettingsRow
            icon={<PackageOpen size={20} />}
            label="Chuyển sang kho trống"
            onClick={() => {
              dispatch({ type: "demoReset", scenario: "empty" })

              notify("Đã chuyển sang trạng thái kho trống")
            }}
          />
        </SettingsGroup>
      ) : (
        <SettingsGroup title="Tài khoản">
          <SettingsRow
            icon={<LogOut size={20} />}
            label="Đăng xuất"
            onClick={() => dispatch({ type: "logout" })}
          />
        </SettingsGroup>
      )}

      {/* Pick Remind Days Modal */}
      <Modal
        isOpen={pickDays}
        onClose={() => setPickDays(false)}
        title="Nhắc trước HSD"
        size="small"
      >
        <div className="flex flex-col divide-y divide-border-primary/40">
          {[1, 2, 3, 5, 7].map((num) => (
            <button
              key={num}
              type="button"
              aria-pressed={s.remindDays === num}
              onClick={() => {
                setS({ ...s, remindDays: num })

                setPickDays(false)
              }}
              className="flex min-h-12 items-center justify-between px-3 text-sm font-medium hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <span>{num} ngày</span>
              {s.remindDays === num && (
                <CircleCheck
                  size={18}
                  aria-hidden="true"
                  className="text-brand-primary"
                />
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Location Manager Modal */}
      <LocationManagerModal
        isOpen={showLocations}
        onClose={() => setShowLocations(false)}
        state={state}
        dispatch={dispatch}
        notify={notify}
      />
    </div>
  )
}

export default Settings
