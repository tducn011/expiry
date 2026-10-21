import { useEffect, useMemo, useRef, useState } from "react"

import { attentionFor, DEMO_DATE, localDay, mockApi } from "./mockApi"

import type {
  Attention,
  CreatePayload,
  EntryDraft,
  FoodEntry,
} from "./domain/types"

import Shell, { View } from "./components/layout/Shell"

import Icon from "./components/ui/Icon"

import { RetryAction } from "./components/ui/Modal"

import Detail, { DetailAction } from "./features/Detail"

import EntryForm from "./features/EntryForm"

import History from "./features/History"

import Inventory, {
  defaultFilters,
  InventoryFilters,
} from "./features/Inventory"

import MovementForm, { MovementMode } from "./features/MovementForm"

import Settings from "./features/Settings"

import StatusDialog, { Dialog, StatusMode } from "./features/StatusDialog"

import Trash from "./features/Trash"

import Welcome from "./features/Welcome"

import AuthForm, { AuthMode } from "./features/AuthForm"

import { useExpiry } from "./hooks/useExpiry"

import DemoApp from "./demo/DemoApp"

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

function App({ demoMode = false }: { demoMode?: boolean } = {}) {
  const queryParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams()

    return new URLSearchParams(window.location.search)
  }, [])

  const hasDemoParam =
    queryParams.get("demo") === "1" ||
    queryParams.get("demo") === "true" ||
    queryParams.has("demo")

  if (!demoMode && hasDemoParam) {
    return <DemoApp />
  }

  const isDemo = demoMode || hasDemoParam

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
    const m = queryParams.get("modal") as ModalKind

    return m ? m : null
  })

  const [notice, setNotice] = useState("")

  const [pendingCreate, setPendingCreate] = useState<CreatePayload | null>(null)

  const [pendingAdd, setPendingAdd] = useState(false)

  const [addOwnerId, setAddOwnerId] = useState<string | null>(null)

  const [authModalOpen, setAuthModalOpen] = useState(false)

  const [authModalMode, setAuthModalMode] = useState<AuthMode>("login")

  const [lastKnownEmail, setLastKnownEmail] = useState("")

  const [revision, setRevision] = useState(0)

  const [retryingCommand, setRetryingCommand] = useState(false)

  const retryLock = useRef(false)

  // Real backend integration via useExpiry hook

  const real = useExpiry(view, filters, 1, !isDemo)

  useEffect(() => {
    if (real.session?.user.email) setLastKnownEmail(real.session.user.email)
  }, [real.session])

  // Automatically prompt authentication modal when user is not authenticated in real mode

  useEffect(() => {
    if (!isDemo && !real.checking && !real.session) {
      setAuthModalOpen(true)
    }
  }, [isDemo, real.checking, real.session])

  // Demo fallback state (only when ?demo=1 or demoMode is explicitly active)

  const demoEntries = useMemo(
    () => (isDemo ? mockApi.listEntries() : []),

    [isDemo, revision],
  )

  const demoTrash = useMemo(
    () => (isDemo ? mockApi.listTrash() : []),

    [isDemo, revision],
  )

  const demoPrefs = useMemo(
    () => (isDemo ? mockApi.getPreferences() : null),

    [isDemo, revision],
  )

  const demoSelected = useMemo(
    () => (isDemo && selectedId ? mockApi.getEntry(selectedId) : null),

    [isDemo, selectedId, revision],
  )

  // Active source of truth based on runtime mode

  const entries: FoodEntry[] = isDemo ? demoEntries : real.allFoods

  const trash: FoodEntry[] = isDemo ? demoTrash : real.trash

  const prefs = isDemo
    ? (demoPrefs ?? {
        timezone: "Asia/Ho_Chi_Minh",

        attention_lead_days: 2,

        version: 1,
      })
    : (real.prefs ?? {
        timezone: "Asia/Ho_Chi_Minh",

        attention_lead_days: 2,

        version: 1,
      })

  const selected: FoodEntry | null = isDemo
    ? demoSelected
    : real.selected || entries.find((e) => e.id === selectedId) || null

  const modalEntryId = actionEntryId ?? selectedId

  const modalEntry: FoodEntry | null = isDemo
    ? modalEntryId
      ? mockApi.getEntry(modalEntryId)
      : null
    : entries.find((e) => e.id === modalEntryId) ||
      trash.find((e) => e.id === modalEntryId) ||
      selected ||
      actionEntrySnapshot ||
      null

  const activeAsOfDate = isDemo
    ? localDay(new Date(), prefs.timezone)
    : real.asOfDate || localDay(new Date(), prefs.timezone)

  const attention = (e: FoodEntry) =>
    isDemo
      ? attentionFor(e, prefs.attention_lead_days, activeAsOfDate)
      : (e.attention ?? "unknown")

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
  }, [entries, prefs])

  const urgentCount = counts.past + counts.today + counts.soon

  useEffect(() => {
    if (!isDemo && real.error?.status === 401 && real.session === null) {
      setAuthModalMode("reauth")

      setAuthModalOpen(true)
    }
  }, [isDemo, real.error, real.session])

  useEffect(() => {
    if (isDemo || modal !== "add" || addOwnerId) return

    if (real.session) setAddOwnerId(real.session.user.id)
    else if (!real.checking) {
      setModal(null)

      setPendingAdd(true)

      setAuthModalMode("login")

      setAuthModalOpen(true)
    }
  }, [isDemo, modal, addOwnerId, real.session, real.checking])

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

    [entries, view, filters, prefs],
  )

  const displayName = isDemo
    ? mockApi.user.display_name || "Bạn (Demo)"
    : real.session?.user?.display_name ||
      real.session?.user?.email ||
      "Chưa đăng nhập"

  const settingsOwner = isDemo ? "demo" : (real.session?.user.id ?? "guest")

  const settingsSnapshot = isDemo ? prefs : real.prefs

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

    if (!isDemo) real.setSelectedId(null)

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
    if (isDemo) {
      setAddOwnerId(null)

      setModal("add")
    } else if (real.session) {
      setAddOwnerId(real.session.user.id)

      setModal("add")
    } else {
      setPendingAdd(true)

      setModal(null)

      setAuthModalMode("login")

      setAuthModalOpen(true)
    }
  }

  // Unified mutation handler supporting both real backend commands and demo in-memory

  const create = async (payload: CreatePayload) => {
    if (isDemo) {
      try {
        const id = mockApi.createEntry(
          mockApi.createCommandKey("create"),

          payload,
        ).data.id

        setRevision((r) => r + 1)

        setSelectedId(id)

        setModal(null)

        setNotice("Đã thêm thực phẩm vào kho")

        window.setTimeout(() => setNotice(""), 3000)

        return
      } catch (err) {
        setModal("read")

        return
      }
    }

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
          ? (result.body as { id?: string } | undefined)
          : undefined

      if (created?.id) {
        setSelectedId(created.id)

        real.setSelectedId(created.id)
      }

      setNotice("Đã thêm thực phẩm vào kho")

      window.setTimeout(() => setNotice(""), 3000)
    } else if (result.error) {
      if (result.error.status === 401) {
        setPendingCreate(payload)

        setAuthModalMode("reauth")

        setAuthModalOpen(true)
      } else {
        setNotice(result.error.message)

        window.setTimeout(() => setNotice(""), 4000)
      }
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

        setNotice("Đã tiếp tục thao tác trước đó")

        window.setTimeout(() => setNotice(""), 3000)
      }
    } finally {
      retryLock.current = false

      setRetryingCommand(false)
    }
  }

  if (!isDemo && real.checking) {
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
        !isDemo
          ? !real.session
            ? () => setAuthModalOpen(true)
            : () => setView("settings")
          : undefined
      }
    >
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" />
          {notice}
        </div>
      )}

      {/* Global backend error display */}
      {!isDemo && real.error && !authModalOpen && (
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
          movements={isDemo ? mockApi.listMovements(selected.id) : real.history}
          onBack={() => {
            setSelectedId(null)

            if (!isDemo) real.setSelectedId(null)
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
          userEmail={!isDemo ? real.session?.user.email : undefined}
          onSave={async (patch) => {
            if (isDemo) {
              mockApi.updatePreferences(
                mockApi.createCommandKey("preferences"),

                prefs.version,

                patch,
              )

              setRevision((r) => r + 1)

              setNotice("Đã lưu cài đặt")

              window.setTimeout(() => setNotice(""), 3000)

              return
            }

            if (!real.session) return

            const res = await real.updatePreferences(prefs.version, patch)

            if (res.ok) {
              setNotice("Đã lưu cài đặt")

              window.setTimeout(() => setNotice(""), 3000)
            }
          }}
          onLogout={
            !isDemo && real.session
              ? async () => {
                  if (await real.logout()) {
                    setSelectedId(null)

                    setActionEntryId(null)

                    setActionEntrySnapshot(null)

                    setPendingCreate(null)

                    setModal(null)

                    setAddOwnerId(null)

                    setPendingAdd(false)

                    setNotice("Đã đăng xuất")

                    window.setTimeout(() => setNotice(""), 3000)

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

            if (!isDemo) real.setSelectedId(f.id)
          }}
          onAdd={requestAdd}
          onShowAttention={() => navigate("attention")}
          onShowInventory={() => navigate("inventory")}
          onAction={(food, action) => {
            setActionEntryId(food.id)

            setActionEntrySnapshot(food)

            if (!isDemo) real.setSelectedId(food.id)

            setModal(action)
          }}
        />
      )}

      {/* Entry creation modal */}
      {modal === "add" &&
        (isDemo ||
          (addOwnerId !== null &&
            (!real.session || real.session.user.id === addOwnerId))) && (
          <EntryForm
            initial={pendingCreate}
            active={!authModalOpen}
            canRetry={!isDemo && (real.canRetry || retryingCommand)}
            retryPending={real.busy || retryingCommand}
            retryError={real.error?.message || ""}
            onRetry={() => void retryPendingCommand()}
            onClose={() => {
              closeModal()

              setPendingCreate(null)
            }}
            onCreate={create}
            onScan={
              isDemo ? undefined : (file, barcode) => real.scan(file, barcode)
            }
          />
        )}

      {/* Auth Modal for real API session */}
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

              setNotice(
                mode === "register"
                  ? "Tạo tài khoản thành công"
                  : "Đăng nhập thành công",
              )

              window.setTimeout(() => setNotice(""), 3000)

              setAuthModalOpen(false)

              if (!res.changed && pendingCreate) await create(pendingCreate)

              return true
            }

            return false
          }}
        />
      )}

      {/* Movement form (consume / discard / recount) */}
      {modalEntry &&
        (modal === "consume" || modal === "discard" || modal === "recount") && (
          <MovementForm
            food={modalEntry}
            mode={modal as MovementMode}
            active={!authModalOpen}
            canRetry={!isDemo && (real.canRetry || retryingCommand)}
            retryPending={real.busy || retryingCommand}
            retryError={real.error?.message || ""}
            onRetry={() => void retryPendingCommand()}
            onClose={closeModal}
            onSave={async (amount, why) => {
              const confirmedUnchanged =
                modal === "recount" && amount === modalEntry.remaining_quantity

              if (isDemo) {
                const key = mockApi.createCommandKey(modal)

                try {
                  if (modal === "recount") {
                    mockApi.recount(
                      key,

                      modalEntry.id,

                      modalEntry.version,

                      amount,

                      why,
                    )
                  } else {
                    mockApi.recordMovement(
                      key,

                      modalEntry.id,

                      modalEntry.version,

                      modal,

                      amount,

                      why || null,
                    )
                  }

                  setRevision((r) => r + 1)

                  closeModal()

                  setNotice(
                    modal === "recount"
                      ? confirmedUnchanged
                        ? "Đã xác nhận kiểm kê, số lượng không đổi"
                        : "Đã cập nhật lượng sau kiểm lại"
                      : `Đã ghi nhận ${
                          modal === "consume" ? "đã dùng" : "đã bỏ"
                        }`,
                  )

                  window.setTimeout(() => setNotice(""), 3000)
                } catch {
                  setModal("conflict")
                }

                return
              }

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

                setNotice(
                  modal === "recount"
                    ? confirmedUnchanged
                      ? "Đã xác nhận kiểm kê, số lượng không đổi"
                      : "Đã cập nhật lượng sau kiểm lại"
                    : `Đã ghi nhận ${
                        modal === "consume" ? "đã dùng" : "đã bỏ"
                      }`,
                )

                window.setTimeout(() => setNotice(""), 3000)
              } else if (res.error) {
                if (
                  res.error.status === 409 &&
                  (res.error.code === "VERSION_CONFLICT" ||
                    res.error.code === "CONCURRENT_MODIFICATION")
                ) {
                  setModal("conflict")

                  real.refresh()
                } else if (res.error.code === "INSUFFICIENT_QUANTITY") {
                  setModal("insufficient")

                  real.refresh()
                } else if (res.error.status === 401) {
                  setAuthModalMode("reauth")

                  setAuthModalOpen(true)
                } else {
                  setNotice(res.error.message)

                  window.setTimeout(() => setNotice(""), 4000)
                }
              }
            }}
          />
        )}

      {/* History log */}
      {selected && modal === "history" && (
        <History
          food={selected}
          movements={isDemo ? mockApi.listMovements(selected.id) : real.history}
          active={!authModalOpen}
          onClose={closeModal}
        />
      )}

      {/* Edit / Add Date modal */}
      {modalEntry && (modal === "edit" || modal === "date") && (
        <EntryForm
          entry={modalEntry}
          initialStep={modal === "date" ? 1 : 0}
          active={!authModalOpen}
          canRetry={!isDemo && (real.canRetry || retryingCommand)}
          retryPending={real.busy || retryingCommand}
          retryError={real.error?.message || ""}
          onRetry={() => void retryPendingCommand()}
          onClose={closeModal}
          onUpdate={async (patch) => {
            if (isDemo) {
              try {
                mockApi.updateEntry(
                  mockApi.createCommandKey("update"),

                  modalEntry.id,

                  modalEntry.version,

                  patch,
                )

                setRevision((r) => r + 1)

                closeModal()

                setNotice("Đã cập nhật thông tin")

                window.setTimeout(() => setNotice(""), 3000)
              } catch {
                setModal("conflict")
              }

              return
            }

            if (!real.session) return

            const res = await real.updateFood(
              modalEntry.id,

              modalEntry.version,

              patch,
            )

            if (res.ok) {
              closeModal()

              setNotice("Đã cập nhật thông tin")

              window.setTimeout(() => setNotice(""), 3000)
            } else if (res.error) {
              if (
                res.error.status === 409 &&
                (res.error.code === "VERSION_CONFLICT" ||
                  res.error.code === "CONCURRENT_MODIFICATION")
              ) {
                setModal("conflict")

                real.refresh()
              } else if (res.error.status === 401) {
                setAuthModalMode("reauth")

                setAuthModalOpen(true)
              } else {
                setNotice(res.error.message)

                window.setTimeout(() => setNotice(""), 4000)
              }
            }
          }}
        />
      )}

      {/* Soft Delete confirmation */}
      {modalEntry && modal === "delete" && (
        <Dialog
          eyebrow="XÓA MÓN"
          title={`Xóa “${modalEntry.name}”?`}
          body="Món sẽ được chuyển vào thùng rác và có thể khôi phục bất cứ lúc nào."
          active={!authModalOpen}
          actionDisabled={
            !isDemo && (real.canRetry || real.busy || retryingCommand)
          }
          extra={
            <RetryAction
              canRetry={!isDemo && (real.canRetry || retryingCommand)}
              pending={real.busy || retryingCommand}
              error={real.error?.message || ""}
              onRetry={() => void retryPendingCommand()}
            />
          }
          action="Xóa vào thùng rác"
          actionVariant="danger"
          onClose={closeModal}
          onAction={async () => {
            if (isDemo) {
              try {
                mockApi.deleteEntry(
                  mockApi.createCommandKey("delete"),

                  modalEntry.id,

                  modalEntry.version,
                )

                setRevision((r) => r + 1)

                setModal(null)

                setSelectedId(null)

                setActionEntryId(null)

                setActionEntrySnapshot(null)

                setNotice("Đã chuyển vào thùng rác")

                window.setTimeout(() => setNotice(""), 3000)
              } catch {
                setModal("conflict")
              }

              return
            }

            if (!real.session) return

            const res = await real.deleteFood(
              modalEntry.id,

              modalEntry.version,
            )

            if (res.ok) {
              setModal(null)

              setSelectedId(null)

              setActionEntryId(null)

              setActionEntrySnapshot(null)

              real.setSelectedId(null)

              setNotice("Đã chuyển vào thùng rác")

              window.setTimeout(() => setNotice(""), 3000)
            } else if (res.error) {
              if (
                res.error.status === 409 &&
                (res.error.code === "VERSION_CONFLICT" ||
                  res.error.code === "CONCURRENT_MODIFICATION")
              ) {
                setModal("conflict")

                real.refresh()
              } else if (res.error.status === 401) {
                setAuthModalMode("reauth")

                setAuthModalOpen(true)
              } else {
                setNotice(res.error.message)

                window.setTimeout(() => setNotice(""), 4000)
              }
            }
          }}
        />
      )}

      {/* Restore confirmation */}
      {modalEntry && modal === "restore" && (
        <Dialog
          eyebrow="KHÔI PHỤC"
          title={`Khôi phục “${modalEntry.name}”?`}
          body="Món sẽ trở lại kho thực phẩm với đầy đủ thông tin ban đầu."
          active={!authModalOpen}
          actionDisabled={
            !isDemo && (real.canRetry || real.busy || retryingCommand)
          }
          extra={
            <RetryAction
              canRetry={!isDemo && (real.canRetry || retryingCommand)}
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

            if (!isDemo) real.setSelectedId(null)
          }}
          onAction={async () => {
            if (isDemo) {
              try {
                mockApi.restoreEntry(
                  mockApi.createCommandKey("restore"),

                  modalEntry.id,
                )

                setRevision((r) => r + 1)

                setModal(null)

                setSelectedId(null)

                navigate("inventory")

                setNotice("Đã khôi phục thực phẩm")

                window.setTimeout(() => setNotice(""), 3000)
              } catch {
                setModal("conflict")
              }

              return
            }

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

              setNotice("Đã khôi phục thực phẩm")

              window.setTimeout(() => setNotice(""), 3000)
            } else if (res.error) {
              if (
                res.error.status === 409 &&
                (res.error.code === "VERSION_CONFLICT" ||
                  res.error.code === "CONCURRENT_MODIFICATION")
              ) {
                setModal("conflict")

                real.refresh()
              } else if (res.error.status === 401) {
                setAuthModalMode("reauth")

                setAuthModalOpen(true)
              } else {
                setNotice(res.error.message)

                window.setTimeout(() => setNotice(""), 4000)
              }
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

              if (!isDemo) real.refresh()
            } else {
              closeModal()
            }
          }}
        />
      )}
    </Shell>
  )
}

export default App
