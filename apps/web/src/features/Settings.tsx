import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Archive,
  Bell,
  BellOff,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  Database,
  LogIn,
  LogOut,
  MapPin,
  RotateCcw,
  Trash2,
  UserRound,
} from "lucide-react"
import type { SettingsSection } from "../App"
import type {
  Dispatch,
  Settings as AppSettings,
  State,
} from "../store/appStore"
import Button from "../components/ui/Button"
import LocationManagerModal from "../components/ui/LocationManagerModal"
import Modal from "../components/ui/Modal"
import PageHeader from "../components/ui/PageHeader"
import SwitchField from "../components/ui/SwitchField"
import { isDesktopViewport } from "../lib/motion"

const sectionLabels: Record<SettingsSection, string> = {
  account: "Tài khoản",
  notifications: "Thông báo & cảnh báo",
  inventory: "Kho thực phẩm",
  data: "Dữ liệu",
}

function SettingsRow({
  icon,
  label,
  value,
  onClick,
  disabled = false,
}: {
  icon: ReactNode
  label: string
  value?: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span aria-hidden="true" className="shrink-0 text-brand-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-text-primary">
        {label}
      </span>
      {value && (
        <span className="shrink-0 text-xs font-medium text-text-secondary">
          {value}
        </span>
      )}
      <ChevronRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-text-tertiary"
      />
    </button>
  )
}

export function Settings({
  state,
  dispatch,
  section,
  onNavigateSection,
  onBack,
  onDirtyChange,
  onSavingChange,
  onSave,
  onNavigateTrash,
  onNavigateHome,
  onLogin,
  notify,
}: {
  state: State
  dispatch: Dispatch
  section?: SettingsSection
  onNavigateSection: (section: SettingsSection) => void
  onBack: () => void
  onDirtyChange: (dirty: boolean) => void
  onSavingChange: (saving: boolean) => void
  onSave: (
    draft: AppSettings,
  ) => Promise<{
    settings: AppSettings
    savedToAccount: boolean
  }>
  onNavigateTrash: () => void
  onNavigateHome?: () => void
  onLogin?: () => void
  notify: (message: string, variant?: "success" | "danger" | "warning") => void
}) {
  const activeSection = section ?? "notifications"
  const [draft, setDraft] = useState(state.settings)
  const savedRef = useRef(state.settings)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pickDays, setPickDays] = useState(false)
  const [showLocations, setShowLocations] = useState(false)
  const [pendingLeave, setPendingLeave] =
    useState<SettingsSection | "back" | null>(null)
  const [pendingReset, setPendingReset] = useState<"full" | "empty" | null>(
    null,
  )
  const notificationSupported =
    typeof window !== "undefined" && "Notification" in window
  const [permission, setPermission] =
    useState<NotificationPermission | "unsupported">(
      notificationSupported ? Notification.permission : "unsupported",
    )

  useEffect(() => {
    const previous = savedRef.current
    savedRef.current = state.settings
    setDraft((current) => ({
      ...state.settings,
      remindDays:
        current.remindDays === previous.remindDays
          ? state.settings.remindDays
          : current.remindDays,
      inApp:
        current.inApp === previous.inApp ? state.settings.inApp : current.inApp,
      homeAttentionExpanded:
        JSON.stringify(current.homeAttentionExpanded) ===
        JSON.stringify(previous.homeAttentionExpanded)
          ? state.settings.homeAttentionExpanded
          : current.homeAttentionExpanded,
      push: false,
    }))
  }, [state.settings])

  const dirty =
    draft.remindDays !== state.settings.remindDays ||
    draft.inApp !== state.settings.inApp ||
    JSON.stringify(draft.homeAttentionExpanded) !==
      JSON.stringify(state.settings.homeAttentionExpanded)
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange])
  useEffect(() => () => onDirtyChange(false), [onDirtyChange])
  useEffect(() => onSavingChange(saving), [saving, onSavingChange])
  useEffect(() => () => onSavingChange(false), [onSavingChange])
  const sections: {
    key: SettingsSection
    icon: ReactNode
  }[] = [
    { key: "account", icon: <UserRound size={20} /> },
    { key: "notifications", icon: <Bell size={20} /> },
    { key: "inventory", icon: <Archive size={20} /> },
    { key: "data", icon: <Database size={20} /> },
  ]

  function selectSection(next: SettingsSection) {
    if (saving || section === next) return
    if (dirty) {
      setPendingLeave(next)
      return
    }
    onNavigateSection(next)
  }

  function backToSections() {
    if (saving) return
    if (dirty) {
      setPendingLeave("back")
      return
    }
    onBack()
  }

  function discardAndLeave() {
    const destination = pendingLeave
    setDraft(state.settings)
    onDirtyChange(false)
    setPendingLeave(null)
    if (destination === "back") onBack()
    else if (destination) onNavigateSection(destination)
  }

  async function save() {
    if (!dirty || saving) return
    onSavingChange(true)
    setSaving(true)
    setSaveError(null)
    try {
      const inAppChanged = draft.inApp !== state.settings.inApp
      const result = await onSave({ ...draft, push: false })
      savedRef.current = result.settings
      setDraft(result.settings)
      notify(
        result.savedToAccount
          ? inAppChanged
            ? "Đã lưu ngưỡng cho tài khoản và thông báo trên thiết bị"
            : "Đã lưu ngưỡng cảnh báo vào tài khoản"
          : "Đã lưu cài đặt trên thiết bị",
      )
    } catch (error) {
      const message =
        error instanceof Error &&
        error.message === "Tài khoản đã thay đổi. Hãy mở lại Cài đặt."
          ? error.message
          : "Không thể lưu cài đặt. Vui lòng thử lại."
      setSaveError(message)
      notify("Không thể lưu cài đặt", "danger")
    } finally {
      onSavingChange(false)
      setSaving(false)
    }
  }

  async function sendTestNotification() {
    if (!notificationSupported || permission === "denied") return
    try {
      const nextPermission =
        permission === "default"
          ? await Notification.requestPermission()
          : permission
      setPermission(nextPermission)
      if (nextPermission === "granted") {
        new Notification("Expiry · Thông báo thử", { icon: "/favicon.svg" })
        notify("Đã gửi thông báo thử")
      } else if (nextPermission === "default") {
        notify("Chưa gửi thông báo thử vì chưa cấp quyền", "warning")
      }
    } catch {
      notify("Không thể gửi thông báo thử", "warning")
    }
  }

  return (
    <div
      className={`flex w-full flex-col gap-5 ${
        dirty && section ? "pb-20 md:pb-0" : ""
      }`}
    >
      <div className={section ? "hidden md:block" : "block"}>
        <PageHeader
          title="Cài đặt"
          onBack={onNavigateHome ?? onBack}
          backLabel="Quay lại Hôm nay"
          backClassName="md:hidden"
          breadcrumbs={
            section
              ? [
                  { label: "Hôm nay", onClick: onNavigateHome ?? onBack },
                  { label: "Cài đặt", onClick: backToSections },
                  { label: sectionLabels[activeSection] },
                ]
              : [
                  { label: "Hôm nay", onClick: onNavigateHome ?? onBack },
                  { label: "Cài đặt" },
                ]
          }
        />
      </div>
      <div className="grid min-w-0 gap-6 md:grid-cols-[240px_minmax(0,640px)] md:justify-center">
        <nav
          aria-label="Danh mục cài đặt"
          className={`${section ? "hidden md:block" : "block"} min-w-0`}
        >
          <div className="overflow-hidden rounded-corner-lg border border-border-primary bg-surface-bg shadow-xs">
            {sections.map(({ key, icon }) => (
              <button
                key={key}
                type="button"
                aria-current={
                  (section !== undefined || isDesktopViewport()) &&
                  activeSection === key
                    ? "page"
                    : undefined
                }
                onClick={() => selectSection(key)}
                className={`flex min-h-14 w-full items-center gap-3 border-b border-border-subtle px-4 text-left text-sm font-normal last:border-b-0 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary ${
                  activeSection === key
                    ? "md:bg-brand-secondary md:font-medium md:text-brand-primary"
                    : "text-text-primary hover:bg-surface-hover"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 text-brand-primary"
                >
                  {icon}
                </span>
                <span className="min-w-0 flex-1">{sectionLabels[key]}</span>
                <ChevronRight
                  size={16}
                  aria-hidden="true"
                  className="text-text-tertiary md:hidden"
                />
              </button>
            ))}
          </div>
        </nav>

        <section
          className={`${section ? "block" : "hidden md:block"} min-w-0`}
          aria-label={sectionLabels[activeSection]}
        >
          <div className="mb-4 md:hidden">
            <PageHeader
              title={sectionLabels[activeSection]}
              onBack={backToSections}
              backLabel="Quay lại Cài đặt"
            />
          </div>
          <h2 className="mb-4 hidden text-lg font-semibold text-text-heading md:block">
            {sectionLabels[activeSection]}
          </h2>

          {activeSection === "notifications" && (
            <div className="flex flex-col gap-4">
              <div className="divide-y divide-border-subtle overflow-hidden rounded-corner-lg border border-border-primary bg-surface-bg shadow-xs">
                <SwitchField
                  icon={<Bell size={20} />}
                  label="Thông báo trong ứng dụng"
                  description="Trên thiết bị này"
                  selected={draft.inApp}
                  onChange={(value) => {
                    setSaveError(null)
                    setDraft((current) => ({ ...current, inApp: value }))
                  }}
                  disabled={saving}
                />
                <SettingsRow
                  icon={<CalendarClock size={20} />}
                  label="Bắt đầu cảnh báo trước hạn"
                  value={`${draft.remindDays} ngày`}
                  onClick={() => setPickDays(true)}
                  disabled={saving}
                />
              </div>

              <div className="rounded-corner-lg border border-border-primary bg-surface-bg p-4 shadow-xs">
                <h3 className="mb-3 text-sm font-semibold text-text-heading">
                  Kiểm tra thông báo trình duyệt
                </h3>
                <Button
                  variant="secondary"
                  onClick={sendTestNotification}
                  disabled={
                    saving ||
                    permission === "unsupported" ||
                    permission === "denied"
                  }
                  className="min-h-11"
                >
                  Gửi thông báo thử
                </Button>
                {permission === "denied" && (
                  <p
                    role="alert"
                    className="mt-3 flex items-start gap-2 text-sm text-status-expired"
                  >
                    <BellOff
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                    />
                    Trình duyệt đã chặn thông báo. Hãy mở quyền thông báo của
                    trang để thử lại.
                  </p>
                )}
                {permission === "unsupported" && (
                  <p role="status" className="mt-3 text-sm text-text-secondary">
                    Trình duyệt này không hỗ trợ thông báo.
                  </p>
                )}
              </div>

              {saveError && (
                <p
                  role="alert"
                  className="rounded-corner-md border border-status-expired/30 bg-status-expired-bg p-3 text-sm text-status-expired"
                >
                  {saveError}
                </p>
              )}
              {dirty && (
                <div className="fixed inset-x-0 bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex gap-3 border-t border-border-primary bg-surface-bg p-3 shadow-lg md:static md:justify-end md:rounded-corner-lg md:border md:shadow-xs">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDraft(state.settings)
                      setSaveError(null)
                    }}
                    disabled={saving}
                    className="min-h-12 flex-[3] md:flex-none"
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="primary"
                    onClick={save}
                    loading={saving}
                    className="min-h-12 flex-[7] md:flex-none"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeSection === "inventory" && (
            <div className="flex flex-col gap-4">
              <div className="divide-y divide-border-subtle overflow-hidden rounded-corner-lg border border-border-primary bg-surface-bg shadow-xs">
                <SettingsRow
                  icon={<MapPin size={20} />}
                  label="Nơi bảo quản"
                  value={`${state.locations.length} vị trí`}
                  onClick={() => setShowLocations(true)}
                />
              </div>
              <section
                aria-labelledby="home-attention-settings-heading"
                className="overflow-hidden rounded-corner-lg border border-border-primary bg-surface-bg shadow-xs"
              >
                <h3
                  id="home-attention-settings-heading"
                  className="px-4 pt-4 text-sm font-semibold text-text-heading"
                >
                  Nhóm mở sẵn trên Hôm nay
                </h3>
                <div className="divide-y divide-border-subtle">
                  <SwitchField
                    label="Quá hạn"
                    selected={draft.homeAttentionExpanded.expired}
                    onChange={(value) => {
                      setSaveError(null)
                      setDraft((current) => ({
                        ...current,
                        homeAttentionExpanded: {
                          ...current.homeAttentionExpanded,
                          expired: value,
                        },
                      }))
                    }}
                    disabled={saving}
                  />
                  <SwitchField
                    label="Sắp hết hạn"
                    selected={draft.homeAttentionExpanded.soon}
                    onChange={(value) => {
                      setSaveError(null)
                      setDraft((current) => ({
                        ...current,
                        homeAttentionExpanded: {
                          ...current.homeAttentionExpanded,
                          soon: value,
                        },
                      }))
                    }}
                    disabled={saving}
                  />
                </div>
              </section>
            </div>
          )}

          {activeSection === "account" && (
            <div className="rounded-corner-lg border border-border-primary bg-surface-bg p-4 shadow-xs">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-corner-full bg-brand-secondary text-brand-primary">
                  <UserRound size={20} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {state.mode === "account"
                    ? state.userName || "Tài khoản Expiry"
                    : "Chế độ xem thử"}
                </span>
              </div>
              {state.mode === "account" ? (
                <Button
                  variant="secondary"
                  iconStart={<LogOut size={16} />}
                  onClick={() => dispatch({ type: "logout" })}
                >
                  Đăng xuất
                </Button>
              ) : (
                <Button
                  variant="primary"
                  iconStart={<LogIn size={16} />}
                  onClick={onLogin}
                >
                  Đăng nhập
                </Button>
              )}
            </div>
          )}

          {activeSection === "data" && (
            <div className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-corner-lg border border-border-primary bg-surface-bg shadow-xs">
                <SettingsRow
                  icon={<Trash2 size={20} />}
                  label="Thùng rác"
                  onClick={onNavigateTrash}
                />
              </div>
              {state.mode === "demo" && (
                <div className="rounded-corner-lg border border-status-expired/30 bg-surface-bg p-4 shadow-xs">
                  <h3 className="mb-3 text-sm font-semibold text-status-expired">
                    Dữ liệu mẫu trên thiết bị
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      iconStart={<RotateCcw size={16} />}
                      onClick={() => setPendingReset("full")}
                    >
                      Nạp lại dữ liệu mẫu
                    </Button>
                    <Button
                      variant="danger"
                      iconStart={<Archive size={16} />}
                      onClick={() => setPendingReset("empty")}
                    >
                      Chuyển sang kho trống
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <Modal
        isOpen={pickDays}
        onClose={() => setPickDays(false)}
        title="Bắt đầu cảnh báo trước hạn"
        size="small"
      >
        <div className="divide-y divide-border-subtle">
          {[...new Set([1, 3, 7, draft.remindDays])]
            .sort((a, b) => a - b)
            .map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={draft.remindDays === days}
                onClick={() => {
                  setSaveError(null)
                  setDraft((current) => ({ ...current, remindDays: days }))
                  setPickDays(false)
                }}
                className="flex min-h-12 w-full items-center justify-between px-3 text-sm font-medium text-text-primary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-brand-primary"
              >
                {days} ngày {days === 3 ? "(mặc định)" : ""}
                {draft.remindDays === days && (
                  <CircleCheck
                    size={16}
                    aria-hidden="true"
                    className="text-brand-primary"
                  />
                )}
              </button>
            ))}
        </div>
      </Modal>
      <Modal
        isOpen={pendingLeave !== null}
        onClose={() => setPendingLeave(null)}
        title="Bỏ thay đổi chưa lưu?"
        size="small"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingLeave(null)}>
              Ở lại
            </Button>
            <Button variant="danger" onClick={discardAndLeave}>
              Rời đi không lưu
            </Button>
          </>
        }
      />
      <Modal
        isOpen={pendingReset !== null}
        onClose={() => setPendingReset(null)}
        title={
          pendingReset === "empty"
            ? "Chuyển sang kho trống?"
            : "Nạp lại dữ liệu mẫu?"
        }
        description="Dữ liệu mẫu trên thiết bị sẽ bị thay thế."
        size="small"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingReset(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingReset) {
                  dispatch({ type: "demoReset", scenario: pendingReset })
                  notify(
                    pendingReset === "empty"
                      ? "Đã chuyển sang kho trống"
                      : "Đã nạp lại dữ liệu mẫu",
                  )
                }
                setPendingReset(null)
              }}
            >
              Xác nhận
            </Button>
          </>
        }
      />
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
