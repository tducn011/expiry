import { useEffect, useMemo, useRef, useState } from "react"
import { ApiClient } from "./api/client"
import { MockApiClient } from "./api/mockClient"
import type { Attention, CreatePayload, FoodEntry } from "./domain/types"
import { attentionFor, localDay } from "./mockApi"
import Shell, { type View } from "./components/layout/Shell"
import Icon from "./components/ui/Icon"
import { RetryAction } from "./components/ui/Modal"
import AuthForm, { type AuthMode } from "./features/AuthForm"
import Detail, { type DetailAction } from "./features/Detail"
import EntryForm from "./features/EntryForm"
import History from "./features/History"
import Inventory, {
  defaultFilters,
  type InventoryFilters,
} from "./features/Inventory"
import MovementForm, { type MovementMode } from "./features/MovementForm"
import Settings from "./features/Settings"
import StatusDialog, { Dialog, type StatusMode } from "./features/StatusDialog"
import Trash from "./features/Trash"
import Welcome from "./features/Welcome"
import { useExpiry } from "./hooks/useExpiry"

type ModalKind = "add" | "restore" | DetailAction | StatusMode | null

const statusModes: StatusMode[] = [
  "conflict",
  "timeout",
  "loading",
  "read",
  "notfound",
  "rate",
  "session",
  "insufficient",
]

const defaultPrefs = {
  timezone: "Asia/Ho_Chi_Minh",
  attention_lead_days: 2,
  version: 1,
}

export default function App({ demoMode = false }: { demoMode?: boolean } = {}) {
  const queryParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams()
    return new URLSearchParams(window.location.search)
  }, [])

  const isDemo =
    demoMode ||
    queryParams.get("demo") === "1" ||
    queryParams.get("demo") === "true" ||
    queryParams.has("demo")

  const client = useMemo(
    () => (isDemo ? new MockApiClient() : new ApiClient()),
    [isDemo],
  )

  const [started, setStarted] = useState(
    () =>
      isDemo ||
      queryParams.has("started") ||
      localStorage.getItem("expiry_onboarding_done") === "1",
  )

  const markStarted = () => {
    localStorage.setItem("expiry_onboarding_done", "1")
    setStarted(true)
  }

  const [view, setView] = useState<View>(() => {
    const v = queryParams.get("view") as View
    return v && ["inventory", "attention", "trash", "settings"].includes(v)
      ? v
      : "attention"
  })

  const [filters, setFilters] = useState<InventoryFilters>(defaultFilters)
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    queryParams.get("id"),
  )
  const [actionEntryId, setActionEntryId] = useState<string | null>(null)
  const [actionEntrySnapshot, setActionEntrySnapshot] =
    useState<FoodEntry | null>(null)
  const [modal, setModal] = useState<ModalKind>(() => {
    return queryParams.get("modal") as ModalKind || null
  })
  const [notice, setNotice] = useState("")
  const [pendingCreate, setPendingCreate] = useState<CreatePayload | null>(null)
  const [pendingAdd, setPendingAdd] = useState(false)
  const [addOwnerId, setAddOwnerId] = useState<string | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<AuthMode>("login")
  const [lastKnownEmail, setLastKnownEmail] = useState("")
  const [retryingCommand, setRetryingCommand] = useState(false)
  const retryLock = useRef(false)

  const real = useExpiry(view, filters, 1, client)

  const showNotice = (msg: string, duration = 3000) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(""), duration)
  }

  const handleMutationError = (error: {
    status?: number
    code?: string
    message?: string
  }) => {
    if (
      error.status === 409 &&
      (error.code === "VERSION_CONFLICT" ||
        error.code === "CONCURRENT_MODIFICATION")
    ) {
      setModal("conflict")
      real.refresh()
    } else if (error.code === "INSUFFICIENT_QUANTITY") {
      setModal("insufficient")
      real.refresh()
    } else if (error.status === 401) {
      setAuthModalMode("reauth")
      setAuthModalOpen(true)
    } else {
      showNotice(error.message || "Đã có lỗi xảy ra", 4000)
    }
  }

  useEffect(() => {
    if (real.session?.user.email) setLastKnownEmail(real.session.user.email)
  }, [real.session])

  useEffect(() => {
    if (!real.checking && !real.session) {
      setAuthModalOpen(true)
    }
  }, [real.checking, real.session])

  useEffect(() => {
    if (real.error?.status === 401 && real.session === null) {
      setAuthModalMode("reauth")
      setAuthModalOpen(true)
    }
  }, [real.error, real.session])

  useEffect(() => {
    if (modal !== "add" || addOwnerId) return
    if (real.session) {
      setAddOwnerId(real.session.user.id)
    } else if (!real.checking) {
      setModal(null)
      setPendingAdd(true)
      setAuthModalMode("login")
      setAuthModalOpen(true)
    }
  }, [modal, addOwnerId, real.session, real.checking])

  const entries: FoodEntry[] = real.allFoods
  const trash: FoodEntry[] = real.trash
  const prefs = real.prefs ?? defaultPrefs
  const selected: FoodEntry | null =
    real.selected || entries.find((e) => e.id === selectedId) || null

  const modalEntryId = actionEntryId ?? selectedId
  const modalEntry: FoodEntry | null =
    entries.find((e) => e.id === modalEntryId) ||
    trash.find((e) => e.id === modalEntryId) ||
    selected ||
    actionEntrySnapshot ||
    null

  const activeAsOfDate = real.asOfDate || localDay(new Date(), prefs.timezone)

  const attention = (e: FoodEntry) =>
    e.attention ?? attentionFor(e, prefs.attention_lead_days, activeAsOfDate)

  const counts = useMemo(() => {
    const c: Record<Attention, number> = {
      past: 0,
      today: 0,
      soon: 0,
      unknown: 0,
      later: 0,
    }
    entries.forEach((e) => {
      if (e.remaining_quantity > 0) c[attention(e)] += 1
    })
    return c
  }, [entries, prefs, activeAsOfDate])

  const urgentCount = counts.past + counts.today + counts.soon

  const visible = useMemo(
    () =>
      entries.filter((f) => {
        if (
          view === "attention" &&
          (attention(f) === "later" || f.remaining_quantity === 0)
        )
          return false
        if (
          filters.attentionFilter &&
          filters.attentionFilter !== "all" &&
          attention(f) !== filters.attentionFilter
        )
          return false
        if (
          filters.query &&
          !f.name.toLowerCase().includes(filters.query.toLowerCase())
        )
          return false
        if (
          filters.location !== "Tất cả vị trí" &&
          f.storage_location !== filters.location
        )
          return false
        if (
          view !== "attention" &&
          filters.lifecycle === "Còn hàng" &&
          f.remaining_quantity === 0
        )
          return false
        if (
          view !== "attention" &&
          filters.lifecycle === "Đã hết" &&
          f.remaining_quantity > 0
        )
          return false
        return true
      }),
    [entries, view, filters, prefs, activeAsOfDate],
  )

  const displayName =
    real.session?.user?.display_name ||
    real.session?.user?.email ||
    "Chưa đăng nhập"

  const settingsOwner = real.session?.user.id ?? "guest"
  const settingsSnapshot = real.prefs
  const settingsKey = `${settingsOwner}:${
    settingsSnapshot
      ? `${settingsSnapshot.version}:${settingsSnapshot.timezone}:${settingsSnapshot.attention_lead_days}`
      : "loading"
  }`

  const navigate = (v: View) => {
    setView(v)
    setSelectedId(null)
    setActionEntryId(null)
    setActionEntrySnapshot(null)
    real.setSelectedId(null)
    if (v === "inventory" || v === "attention") setFilters(defaultFilters)
  }

  const closeModal = () => {
    setModal(null)
    setActionEntryId(null)
    setActionEntrySnapshot(null)
    setAddOwnerId(null)
    setPendingAdd(false)
  }

  const requestAdd = () => {
    if (real.session) {
      setAddOwnerId(real.session.user.id)
      setModal("add")
    } else {
      setPendingAdd(true)
      setModal(null)
      setAuthModalMode("login")
      setAuthModalOpen(true)
    }
  }

  const create = async (payload: CreatePayload) => {
    if (!real.session) {
      setPendingCreate(payload)
      setAuthModalOpen(true)
      return
    }

    const result = await real.createFood(payload)
    setPendingCreate(null)

    if (result.ok) {
      closeModal()
      const created =
        "body" in result
          ? result.body as { id?: string } | undefined
          : undefined
      if (created?.id) {
        setSelectedId(created.id)
        real.setSelectedId(created.id)
      }
      showNotice("Đã thêm thực phẩm vào kho")
    } else if (result.error) {
      if (result.error.status === 401) {
        setPendingCreate(payload)
      }
      handleMutationError(result.error)
    }
  }

  const retryPendingCommand = async () => {
    if (retryLock.current || real.busy || !real.canRetry) return
    retryLock.current = true
    setRetryingCommand(true)
    try {
      const result = await real.retry()
      if (result.ok) {
        closeModal()
        setPendingCreate(null)
        showNotice("Đã tiếp tục thao tác trước đó")
      }
    } finally {
      retryLock.current = false
      setRetryingCommand(false)
    }
  }

  if (real.checking) {
    return (
      <div
        className="welcome"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "420px", width: "100%" }}>
          <span
            className="wordmark"
            style={{
              fontSize: "2rem",
              display: "block",
              marginBottom: "1.5rem",
            }}
          >
            EXPIRY
          </span>
          <div
            className="skeleton-stack"
            aria-label="Đang khôi phục phiên"
            style={{ marginBottom: "1.5rem" }}
          >
            <i
              style={{ height: "14px", width: "180px", margin: "0 auto 8px" }}
            />
            <i style={{ height: "10px", width: "120px", margin: "0 auto" }} />
          </div>
          <p
            style={{
              color: "var(--muted, #64748b)",
              fontSize: "0.95rem",
              marginBottom: "1.5rem",
            }}
          >
            Đang kiểm tra và khôi phục phiên làm việc...
          </p>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "var(--primary, #2563eb)",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set("demo", "1")
              window.location.href = url.toString()
            }}
          >
            Vào nhanh chế độ xem thử (Demo)
          </button>
        </div>
      </div>
    )
  }

  if (!started)
    return (
      <Welcome
        onStart={() => {
          markStarted()
          requestAdd()
        }}
        onSkip={() => {
          markStarted()
        }}
        onDemo={() => {
          markStarted()
          const url = new URL(window.location.href)
          url.searchParams.set("demo", "1")
          window.location.href = url.toString()
        }}
      />
    )

  return (
    <Shell
      view={view}
      setView={navigate}
      onAdd={requestAdd}
      displayName={displayName}
      urgentCount={urgentCount}
      onAuth={
        real.session?.user.id === "usr_demo"
          ? undefined
          : !real.session
            ? () => setAuthModalOpen(true)
            : () => setView("settings")
      }
    >
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" />
          {notice}
        </div>
      )}

      {real.error && !authModalOpen && (
        <div
          className="toast error"
          role="alert"
          style={{ background: "var(--danger, #dc2626)", color: "#fff" }}
        >
          <Icon name="alert" />
          {real.error.message}
          {real.canRetry && (
            <button
              type="button"
              style={{
                marginLeft: 8,
                textDecoration: "underline",
                color: "#fff",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => void retryPendingCommand()}
            >
              Thử lại
            </button>
          )}
        </div>
      )}

      {selected && !selected.deleted_at ? (
        <Detail
          food={selected}
          attention={attention(selected)}
          movements={real.history}
          onBack={() => {
            setSelectedId(null)
            real.setSelectedId(null)
          }}
          parentLabel={
            view === "attention"
              ? "Cần chú ý"
              : view === "trash"
                ? "Thùng rác"
                : view === "settings"
                  ? "Cài đặt"
                  : "Kho thực phẩm"
          }
          onAction={(action) => {
            setActionEntryId(selected.id)
            setActionEntrySnapshot(selected)
            setModal(action)
          }}
        />
      ) : view === "settings" ? (
        <Settings
          key={settingsKey}
          prefs={prefs}
          displayName={displayName}
          userEmail={real.session?.user.email}
          onSave={async (patch) => {
            if (!real.session) return
            const res = await real.updatePreferences(prefs.version, patch)
            if (res.ok) {
              showNotice("Đã lưu cài đặt")
            }
          }}
          onLogout={
            real.session && real.session.user.id !== "usr_demo"
              ? async () => {
                  if (await real.logout()) {
                    setSelectedId(null)
                    setActionEntryId(null)
                    setActionEntrySnapshot(null)
                    setPendingCreate(null)
                    setModal(null)
                    setAddOwnerId(null)
                    setPendingAdd(false)
                    showNotice("Đã đăng xuất")
                    setAuthModalOpen(true)
                  }
                }
              : undefined
          }
        />
      ) : view === "trash" ? (
        <Trash
          timezone={prefs.timezone}
          foods={trash}
          onRestore={(f) => {
            setActionEntryId(f.id)
            setActionEntrySnapshot(f)
            setModal("restore")
          }}
        />
      ) : (
        <Inventory
          mode={view === "attention" ? "attention" : "inventory"}
          asOfDate={activeAsOfDate}
          foods={visible}
          allFoods={entries}
          counts={counts}
          leadDays={prefs.attention_lead_days}
          attention={attention}
          filters={filters}
          setFilters={setFilters}
          onOpen={(f) => {
            setSelectedId(f.id)
            real.setSelectedId(f.id)
          }}
          onAdd={requestAdd}
          onShowAttention={() => navigate("attention")}
          onShowInventory={() => navigate("inventory")}
          onAction={(food, action) => {
            setActionEntryId(food.id)
            setActionEntrySnapshot(food)
            real.setSelectedId(food.id)
            setModal(action)
          }}
        />
      )}

      {modal === "add" &&
        addOwnerId !== null &&
        (!real.session || real.session.user.id === addOwnerId) && (
          <EntryForm
            initial={pendingCreate}
            active={!authModalOpen}
            canRetry={real.canRetry || retryingCommand}
            retryPending={real.busy || retryingCommand}
            retryError={real.error?.message || ""}
            onRetry={() => void retryPendingCommand()}
            onClose={() => {
              closeModal()
              setPendingCreate(null)
            }}
            onCreate={create}
            onScan={(file, barcode) => real.scan(file, barcode)}
          />
        )}

      {authModalOpen && (
        <AuthForm
          initialMode={authModalMode}
          initialEmail={real.session?.user.email || lastKnownEmail}
          pending={real.busy}
          error={real.error?.message || ""}
          onClose={() => {
            setAuthModalOpen(false)
            if (pendingAdd) {
              setPendingAdd(false)
              setAddOwnerId(null)
              setModal(null)
            }
          }}
          onSubmit={async (mode, input) => {
            const res = await real.authenticate(
              mode === "reauth" ? "login" : mode,
              {
                email: input.email,
                password: input.password || "",
                ...(mode === "register"
                  ? { display_name: input.display_name }
                  : {}),
              },
            )

            if (res.ok) {
              if (res.changed) {
                setPendingCreate(null)
                setModal(null)
                setSelectedId(null)
                setActionEntryId(null)
                setActionEntrySnapshot(null)
                setAddOwnerId(null)
                setPendingAdd(false)
              } else if (pendingAdd && res.owner) {
                setPendingAdd(false)
                setAddOwnerId(res.owner)
                setModal("add")
              }

              showNotice(
                mode === "register"
                  ? "Tạo tài khoản thành công"
                  : "Đăng nhập thành công",
              )
              setAuthModalOpen(false)
              if (!res.changed && pendingCreate) await create(pendingCreate)
              return true
            }
            return false
          }}
        />
      )}

      {modalEntry &&
        (modal === "consume" || modal === "discard" || modal === "recount") && (
          <MovementForm
            food={modalEntry}
            mode={modal as MovementMode}
            active={!authModalOpen}
            canRetry={real.canRetry || retryingCommand}
            retryPending={real.busy || retryingCommand}
            retryError={real.error?.message || ""}
            onRetry={() => void retryPendingCommand()}
            onClose={closeModal}
            onSave={async (amount, why) => {
              const confirmedUnchanged =
                modal === "recount" && amount === modalEntry.remaining_quantity

              if (!real.session) return

              const res =
                modal === "recount"
                  ? await real.recountFood(
                      modalEntry.id,
                      modalEntry.version,
                      amount,
                      why,
                    )
                  : await real.recordMovement(
                      modalEntry.id,
                      modalEntry.version,
                      modal as "consume" | "discard",
                      amount,
                      why || null,
                    )

              if (res.ok) {
                closeModal()
                showNotice(
                  modal === "recount"
                    ? confirmedUnchanged
                      ? "Đã xác nhận kiểm kê, số lượng không đổi"
                      : "Đã cập nhật lượng sau kiểm lại"
                    : `Đã ghi nhận ${
                        modal === "consume" ? "đã dùng" : "đã bỏ"
                      }`,
                )
              } else if (res.error) {
                handleMutationError(res.error)
              }
            }}
          />
        )}

      {selected && modal === "history" && (
        <History
          food={selected}
          movements={real.history}
          active={!authModalOpen}
          onClose={closeModal}
        />
      )}

      {modalEntry && (modal === "edit" || modal === "date") && (
        <EntryForm
          entry={modalEntry}
          initialStep={modal === "date" ? 1 : 0}
          active={!authModalOpen}
          canRetry={real.canRetry || retryingCommand}
          retryPending={real.busy || retryingCommand}
          retryError={real.error?.message || ""}
          onRetry={() => void retryPendingCommand()}
          onClose={closeModal}
          onUpdate={async (patch) => {
            if (!real.session) return

            const res = await real.updateFood(
              modalEntry.id,
              modalEntry.version,
              patch,
            )

            if (res.ok) {
              closeModal()
              showNotice("Đã cập nhật thông tin")
            } else if (res.error) {
              handleMutationError(res.error)
            }
          }}
        />
      )}

      {modalEntry && modal === "delete" && (
        <Dialog
          eyebrow="XÓA MÓN"
          title={`Xóa “${modalEntry.name}”?`}
          body="Món sẽ được chuyển vào thùng rác và có thể khôi phục bất cứ lúc nào."
          active={!authModalOpen}
          actionDisabled={real.canRetry || real.busy || retryingCommand}
          extra={
            <RetryAction
              canRetry={real.canRetry || retryingCommand}
              pending={real.busy || retryingCommand}
              error={real.error?.message || ""}
              onRetry={() => void retryPendingCommand()}
            />
          }
          action="Xóa vào thùng rác"
          actionVariant="danger"
          onClose={closeModal}
          onAction={async () => {
            if (!real.session) return

            const res = await real.deleteFood(modalEntry.id, modalEntry.version)

            if (res.ok) {
              setModal(null)
              setSelectedId(null)
              setActionEntryId(null)
              setActionEntrySnapshot(null)
              real.setSelectedId(null)
              showNotice("Đã chuyển vào thùng rác")
            } else if (res.error) {
              handleMutationError(res.error)
            }
          }}
        />
      )}

      {modalEntry && modal === "restore" && (
        <Dialog
          eyebrow="KHÔI PHỤC"
          title={`Khôi phục “${modalEntry.name}”?`}
          body="Món sẽ trở lại kho thực phẩm với đầy đủ thông tin ban đầu."
          active={!authModalOpen}
          actionDisabled={real.canRetry || real.busy || retryingCommand}
          extra={
            <RetryAction
              canRetry={real.canRetry || retryingCommand}
              pending={real.busy || retryingCommand}
              error={real.error?.message || ""}
              onRetry={() => void retryPendingCommand()}
            />
          }
          action="Khôi phục"
          onClose={() => {
            setModal(null)
            setSelectedId(null)
            setActionEntryId(null)
            setActionEntrySnapshot(null)
            real.setSelectedId(null)
          }}
          onAction={async () => {
            if (!real.session) return

            const res = await real.restoreFood(
              modalEntry.id,
              modalEntry.version,
            )

            if (res.ok) {
              setModal(null)
              setSelectedId(null)
              setActionEntryId(null)
              setActionEntrySnapshot(null)
              real.setSelectedId(null)
              navigate("inventory")
              showNotice("Đã khôi phục thực phẩm")
            } else if (res.error) {
              handleMutationError(res.error)
            }
          }}
        />
      )}

      {statusModes.includes(modal as StatusMode) && (
        <StatusDialog
          mode={modal as StatusMode}
          active={!authModalOpen}
          onClose={closeModal}
          onAction={() => {
            if (modal === "session") {
              closeModal()
              setAuthModalMode("reauth")
              setAuthModalOpen(true)
            } else if (modal === "conflict" || modal === "insufficient") {
              closeModal()
              real.refresh()
            } else {
              closeModal()
            }
          }}
        />
      )}
    </Shell>
  )
}
