import { useState } from "react"

import type { Dispatch, State } from "../../store/appStore"

import { DEFAULT_LOCATIONS } from "../../store/appStore"

import { getLocationIcon } from "../../features/StorageView"

import Button from "./Button"

import {
  CircleAlert,
  CircleCheck,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react"

import InputField from "./InputField"

import Modal from "./Modal"

import { Tag } from "./StatusBadge"

export interface LocationManagerModalProps {
  isOpen: boolean

  onClose: () => void

  state: State

  dispatch: Dispatch

  onAddLocation?: (name: string) => Promise<void> | void

  onRenameLocation?: (oldName: string, newName: string) => Promise<void> | void

  onRemoveLocation?: (name: string) => Promise<void> | void

  notify?: (msg: string, variant?: "success" | "danger" | "warning") => void
}

export default function LocationManagerModal({
  isOpen,

  onClose,

  state,

  dispatch,

  onAddLocation,

  onRenameLocation,

  onRemoveLocation,

  notify,
}: LocationManagerModalProps) {
  const [newLocName, setNewLocName] = useState("")

  const [editingLoc, setEditingLoc] = useState<string | null>(null)

  const [renameVal, setRenameVal] = useState("")

  const [errorMsg, setErrorMsg] = useState("")

  const activeFoods = state.foods.filter((f) => !f.deletedAt && !f.finishedAt)

  const handleAdd = async () => {
    const trimmed = newLocName.trim()

    if (!trimmed) return

    if (state.locations.includes(trimmed)) {
      setErrorMsg(`Vị trí "${trimmed}" đã tồn tại.`)

      return
    }

    setErrorMsg("")

    dispatch({ type: "addLocation", name: trimmed })

    if (onAddLocation) {
      await onAddLocation(trimmed)
    }

    notify?.(`Đã thêm nơi bảo quản: ${trimmed}`, "success")

    setNewLocName("")
  }

  const handleStartRename = (loc: string) => {
    setEditingLoc(loc)

    setRenameVal(loc)

    setErrorMsg("")
  }

  const handleSaveRename = async (oldName: string) => {
    const newName = renameVal.trim()

    if (!newName) {
      setErrorMsg("Tên vị trí không được để trống.")

      return
    }

    if (newName === oldName) {
      setEditingLoc(null)

      return
    }

    if (state.locations.includes(newName)) {
      setErrorMsg(`Vị trí "${newName}" đã tồn tại.`)

      return
    }

    setErrorMsg("")

    dispatch({ type: "renameLocation", oldName, newName })

    if (onRenameLocation) {
      await onRenameLocation(oldName, newName)
    }

    const count = activeFoods.filter((f) => f.location === oldName).length

    notify?.(
      count > 0
        ? `Đã đổi tên thành "${newName}" và cập nhật ${count} món liên quan`
        : `Đã đổi tên thành "${newName}"`,

      "success",
    )

    setEditingLoc(null)
  }

  const handleDelete = async (loc: string) => {
    const count = activeFoods.filter((f) => f.location === loc).length

    if (count > 0) {
      setErrorMsg(
        `Không thể xóa: Có ${count} món đang lưu trữ tại "${loc}". Vui lòng chuyển thực phẩm sang vị trí khác trước.`,
      )

      return
    }

    if (DEFAULT_LOCATIONS.includes(loc)) {
      setErrorMsg(`Không thể xóa vị trí mặc định "${loc}".`)

      return
    }

    setErrorMsg("")

    dispatch({ type: "removeLocation", name: loc })

    if (onRemoveLocation) {
      await onRemoveLocation(loc)
    }

    notify?.(`Đã xóa nơi bảo quản: ${loc}`, "success")
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setEditingLoc(null)

        setErrorMsg("")

        onClose()
      }}
      title="Quản lý nơi bảo quản"
      description="Thêm, đổi tên hoặc xóa các vị trí lưu trữ thực phẩm. Dữ liệu sẽ đồng bộ theo tài khoản."
      size="regular"
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Error message */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-center gap-2 p-2.5 rounded-corner-md bg-status-expired-bg text-status-expired text-xs border border-status-expired/20"
          >
            <CircleAlert size={16} className="shrink-0" />
            <p className="flex-1">{errorMsg}</p>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="p-1 hover:bg-black/10 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Add Location Form */}
        <div className="flex items-end gap-2 p-3 bg-surface-subtle/50 rounded-corner-md border border-border-primary/50">
          <div className="flex-1">
            <InputField
              label="Thêm nơi bảo quản mới"
              placeholder="VD: Kệ đồ khô, Tủ mát mini..."
              value={newLocName}
              onChange={(val: string) => {
                setNewLocName(val)

                if (errorMsg) setErrorMsg("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()

                  handleAdd()
                }
              }}
            />
          </div>
          <Button
            size="small"
            variant="primary"
            disabled={!newLocName.trim()}
            onClick={handleAdd}
            className="shrink-0 mb-0.5"
          >
            <Plus size={16} className="mr-1 inline-block" />
            Thêm
          </Button>
        </div>

        {/* Existing Locations List */}
        <div className="flex flex-col divide-y divide-border-primary/40 rounded-corner-md border border-border-primary/60 overflow-hidden">
          {state.locations.map((loc) => {
            const isEditing = editingLoc === loc

            const count = activeFoods.filter((f) => f.location === loc).length

            const isDefault = DEFAULT_LOCATIONS.includes(loc)

            const LocIcon = getLocationIcon(loc)

            return (
              <div
                key={loc}
                className="flex items-center justify-between gap-3 p-3 bg-surface-bg hover:bg-surface-hover/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-corner-md flex items-center justify-center bg-brand-primary/10 text-brand-primary shrink-0">
                    <LocIcon size={16} />
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="text"
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(loc)

                          if (e.key === "Escape") setEditingLoc(null)
                        }}
                        autoFocus
                        className="flex-1 min-w-0 px-2 py-1 text-sm border rounded-corner-md bg-surface-bg border-brand-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(loc)}
                        title="Lưu tên mới"
                        className="p-1.5 text-status-ok hover:bg-status-ok-bg rounded-corner-md transition-colors cursor-pointer"
                      >
                        <CircleCheck size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingLoc(null)}
                        title="Hủy"
                        className="p-1.5 text-text-tertiary hover:bg-surface-subtle rounded-corner-md transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm font-semibold text-text-primary truncate">
                        {loc}
                      </span>
                      {isDefault && <Tag label="Mặc định" variant="neutral" />}
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        ({count} món)
                      </span>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartRename(loc)}
                      title={`Đổi tên vị trí "${loc}"`}
                      className="p-1.5 text-text-secondary hover:text-brand-primary hover:bg-surface-subtle rounded-corner-md transition-colors cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={isDefault || count > 0}
                      onClick={() => handleDelete(loc)}
                      title={
                        isDefault
                          ? "Vị trí mặc định, không thể xóa"
                          : count > 0
                            ? `Đang có ${count} món, không thể xóa`
                            : `Xóa vị trí "${loc}"`
                      }
                      className="p-1.5 text-text-secondary hover:text-danger hover:bg-status-expired-bg rounded-corner-md transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
