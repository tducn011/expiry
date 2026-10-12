import { useMemo, useState } from "react"
import { attentionFor, mockApi } from "./mockApi"
import type {
  Attention,
  CreatePayload,
  EntryDraft,
  FoodEntry,
} from "./domain/types"
import Shell, { View } from "./components/layout/Shell"
import Icon from "./components/ui/Icon"
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
import AuthForm from "./features/AuthForm"
import { useExpiry } from "./hooks/useExpiry"
import {
  ApiError as ClientApiError,
  createDTO,
  decimal,
  draftDTO,
  newCommand,
} from "./api/client"

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

  const isDemo = demoMode || queryParams.has("demo")

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
  const [modal, setModal] = useState<ModalKind>(() => {
    const m = queryParams.get("modal") as ModalKind
    return m ? m : null
  })
  const [notice, setNotice] = useState("")
  const [pendingCreate, setPendingCreate] = useState<CreatePayload | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [revision, setRevision] = useState(0)

  // Real backend integration via useExpiry hook
  const real = useExpiry(view, filters, 1)

  // Demo fallback state (only when ?demo=1 or demoMode is explicitly active)
  const demoEntries = useMemo(() => (isDemo ? mockApi.listEntries() : []), [isDemo, revision])
  const demoTrash = useMemo(() => (isDemo ? mockApi.listTrash() : []), [isDemo, revision])
  const demoPrefs = useMemo(() => (isDemo ? mockApi.getPreferences() : null), [isDemo, revision])
  const demoSelected = useMemo(
    () => (isDemo && selectedId ? mockApi.getEntry(selectedId) : null),
    [isDemo, selectedId, revision],
  )

  // Active source of truth based on runtime mode
  const entries: FoodEntry[] = isDemo ? demoEntries : real.allFoods
  const trash: FoodEntry[] = isDemo ? demoTrash : real.trash
  const prefs = isDemo
    ? (demoPrefs ?? { timezone: "Asia/Ho_Chi_Minh", attention_lead_days: 2, version: 1 })
    : (real.prefs ?? {
        timezone: "Asia/Ho_Chi_Minh",
        attention_lead_days: 2,
        version: 1,
      })

  const selected: FoodEntry | null = isDemo
    ? demoSelected
    : (real.selected || entries.find((e) => e.id === selectedId) || null)

  const modalEntryId = actionEntryId ?? selectedId
  const modalEntry: FoodEntry | null = isDemo
    ? (modalEntryId ? mockApi.getEntry(modalEntryId) : null)
    : (entries.find((e) => e.id === modalEntryId) ||
       trash.find((e) => e.id === modalEntryId) ||
       selected ||
       null)

  const attention = (e: Pick<FoodEntry, "expiry_date">) =>
    attentionFor(e, prefs.attention_lead_days)

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
    ? (mockApi.user.display_name || "Bạn (Demo)")
    : (real.session?.user?.display_name || "Chưa đăng nhập")

  const navigate = (v: View) => {
    setView(v)
    setSelectedId(null)
    setActionEntryId(null)
    if (!isDemo) real.setSelectedId(null)
    if (v === "inventory" || v === "attention") setFilters(defaultFilters)
  }

  const closeModal = () => {
    setModal(null)
    setActionEntryId(null)
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

    const cmd = newCommand(
      real.session.user.id,
      "POST",
      "/food-entries",
      createDTO(payload),
    )
    const result = await real.run(cmd)
    if (result.ok) {
      setModal(null)
      setPendingCreate(null)
      setNotice("Đã thêm thực phẩm vào kho")
      window.setTimeout(() => setNotice(""), 3000)
    }
  }

  if (!started)
    return (
      <Welcome
        onStart={() => {
          markStarted()
          if (!isDemo && !real.session) {
            setAuthModalOpen(true)
          } else {
            setModal("add")
          }
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
      onAdd={() => {
        if (!isDemo && !real.session) {
          setAuthModalOpen(true)
        } else {
          setModal("add")
        }
      }}
      displayName={displayName}
      urgentCount={urgentCount}
      onAuth={!isDemo && !real.session ? () => setAuthModalOpen(true) : undefined}
    >
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" />
          {notice}
        </div>
      )}

      {/* Global backend error display */}
      {!isDemo && real.error && !authModalOpen && (
        <div className="toast error" role="alert" style={{ background: "var(--danger, #dc2626)", color: "#fff" }}>
          <Icon name="alert" />
          {real.error.message}
          {real.canRetry && (
            <button
              type="button"
              style={{ marginLeft: 8, textDecoration: "underline", color: "#fff", background: "none", border: "none", cursor: "pointer" }}
              onClick={() => real.retry()}
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
          onAction={setModal}
        />
      ) : view === "settings" ? (
        <Settings
          prefs={prefs}
          displayName={displayName}
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
            const cmd = newCommand(real.session.user.id, "PATCH", "/me/preferences", {
              expected_version: prefs.version,
              ...patch,
            })
            const res = await real.run(cmd)
            if (res.ok) {
              setNotice("Đã lưu cài đặt")
              window.setTimeout(() => setNotice(""), 3000)
            }
          }}
          onLogout={
            !isDemo && real.session
              ? async () => {
                  await real.logout()
                  setNotice("Đã đăng xuất")
                  window.setTimeout(() => setNotice(""), 3000)
                }
              : undefined
          }
        />
      ) : view === "trash" ? (
        <Trash
          timezone={prefs.timezone}
          foods={trash}
          onRestore={(f) => {
            setSelectedId(f.id)
            if (!isDemo) real.setSelectedId(f.id)
            setModal("restore")
          }}
        />
      ) : (
        <Inventory
          mode={view === "attention" ? "attention" : "inventory"}
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
          onAdd={() => {
            if (!isDemo && !real.session) {
              setAuthModalOpen(true)
            } else {
              setModal("add")
            }
          }}
          onShowAttention={() => navigate("attention")}
          onShowInventory={() => navigate("inventory")}
          onAction={(food, action) => {
            setActionEntryId(food.id)
            if (!isDemo) real.setSelectedId(food.id)
            setModal(action)
          }}
        />
      )}

      {/* Entry creation modal */}
      {modal === "add" && (
        <EntryForm
          initial={pendingCreate}
          onClose={() => setModal(null)}
          onCreate={create}
        />
      )}

      {/* Auth Modal for real API session */}
      {authModalOpen && (
        <AuthForm
          pending={real.busy}
          error={real.error?.message || ""}
          onClose={() => setAuthModalOpen(false)}
          onSubmit={async (mode, input) => {
            const res = await real.authenticate(mode, input)
            if (res.ok) {
              setAuthModalOpen(false)
              setNotice(mode === "login" ? "Đăng nhập thành công" : "Tạo tài khoản thành công")
              window.setTimeout(() => setNotice(""), 3000)
              if (pendingCreate) {
                const payload = pendingCreate
                setPendingCreate(null)
                await create(payload)
              }
            }
          }}
        />
      )}

      {/* Movement form (consume / discard / recount) */}
      {modalEntry &&
        (modal === "consume" || modal === "discard" || modal === "recount") && (
          <MovementForm
            food={modalEntry}
            mode={modal as MovementMode}
            onClose={closeModal}
            onSave={async (amount, why) => {
              if (isDemo) {
                const key = mockApi.createCommandKey(modal)
                try {
                  if (modal === "recount") {
                    mockApi.recount(key, modalEntry.id, modalEntry.version, amount, why)
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
                      ? "Đã cập nhật lượng sau kiểm lại"
                      : `Đã ghi nhận ${modal === "consume" ? "đã dùng" : "đã bỏ"}`,
                  )
                  window.setTimeout(() => setNotice(""), 3000)
                } catch {
                  setModal("conflict")
                }
                return
              }

              if (!real.session) return
              if (modal === "recount") {
                const cmd = newCommand(
                  real.session.user.id,
                  "POST",
                  `/food-entries/${modalEntry.id}/recounts`,
                  {
                    expected_version: modalEntry.version,
                    actual_quantity: decimal(amount),
                    reason: why || null,
                  },
                )
                const res = await real.run(cmd)
                if (res.ok) {
                  closeModal()
                  setNotice("Đã cập nhật lượng sau kiểm lại")
                  window.setTimeout(() => setNotice(""), 3000)
                }
              } else {
                const cmd = newCommand(
                  real.session.user.id,
                  "POST",
                  `/food-entries/${modalEntry.id}/movements`,
                  {
                    expected_version: modalEntry.version,
                    kind: modal,
                    amount: decimal(amount),
                    reason: why || null,
                  },
                )
                const res = await real.run(cmd)
                if (res.ok) {
                  closeModal()
                  setNotice(`Đã ghi nhận ${modal === "consume" ? "đã dùng" : "đã bỏ"}`)
                  window.setTimeout(() => setNotice(""), 3000)
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
          onClose={() => setModal(null)}
        />
      )}

      {/* Edit / Add Date modal */}
      {modalEntry && (modal === "edit" || modal === "date") && (
        <EntryForm
          entry={modalEntry}
          initialStep={modal === "date" ? 1 : 0}
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
            const cmd = newCommand(
              real.session.user.id,
              "PATCH",
              `/food-entries/${modalEntry.id}`,
              {
                expected_version: modalEntry.version,
                ...draftDTO(patch),
              },
            )
            const res = await real.run(cmd)
            if (res.ok) {
              closeModal()
              setNotice("Đã cập nhật thông tin")
              window.setTimeout(() => setNotice(""), 3000)
            }
          }}
        />
      )}

      {/* Soft Delete confirmation */}
      {selected && modal === "delete" && (
        <Dialog
          eyebrow="XÓA MÓN"
          title={`Xóa “${selected.name}”?`}
          body="Món sẽ được chuyển vào thùng rác và có thể khôi phục bất cứ lúc nào."
          action="Xóa vào thùng rác"
          actionVariant="danger"
          onClose={() => setModal(null)}
          onAction={async () => {
            if (isDemo) {
              try {
                mockApi.deleteEntry(
                  mockApi.createCommandKey("delete"),
                  selected.id,
                  selected.version,
                )
                setRevision((r) => r + 1)
                setModal(null)
                setSelectedId(null)
                setNotice("Đã chuyển vào thùng rác")
                window.setTimeout(() => setNotice(""), 3000)
              } catch {
                setModal("conflict")
              }
              return
            }

            if (!real.session) return
            const cmd = newCommand(
              real.session.user.id,
              "DELETE",
              `/food-entries/${selected.id}?expected_version=${selected.version}`,
            )
            const res = await real.run(cmd)
            if (res.ok) {
              setModal(null)
              setSelectedId(null)
              real.setSelectedId(null)
              setNotice("Đã chuyển vào thùng rác")
              window.setTimeout(() => setNotice(""), 3000)
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
          action="Khôi phục"
          onClose={() => {
            setModal(null)
            setSelectedId(null)
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
            const cmd = newCommand(
              real.session.user.id,
              "POST",
              `/food-entries/${modalEntry.id}/restore`,
              {
                expected_version: modalEntry.version,
              },
            )
            const res = await real.run(cmd)
            if (res.ok) {
              setModal(null)
              setSelectedId(null)
              real.setSelectedId(null)
              navigate("inventory")
              setNotice("Đã khôi phục thực phẩm")
              window.setTimeout(() => setNotice(""), 3000)
            }
          }}
        />
      )}

      {statusModes.includes(modal as StatusMode) && (
        <StatusDialog mode={modal as StatusMode} onClose={closeModal} />
      )}
    </Shell>
  )
}

export default App
