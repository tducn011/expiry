import { useState } from "react"

import { api, ApiError } from "../api/client"

import type { Dispatch, Food, State } from "../store/appStore"

import { trashDaysLeft, trashed } from "../store/appStore"

import Button from "../components/ui/Button"

import Card from "../components/ui/Card"

import EmptyState from "../components/ui/EmptyState"

import { Trash2, Undo2 } from "../components/ui/Icon"

import Modal from "../components/ui/Modal"

import PageHeader from "../components/ui/PageHeader"

export function Trash({
  state,

  dispatch,

  onBack,

  notify,
}: {
  state: State

  dispatch: Dispatch

  onBack?: () => void

  notify: (m: string) => void
}) {
  const list = trashed(state)

  const [confirm, setConfirm] = useState<{
    f: Food

    kind: "restore" | "purge"
  } | null>(null)

  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!confirm) return

    if (state.mode === "account" && confirm.kind === "restore") {
      setLoading(true)

      try {
        const idempotencyKey = `idemp_${crypto.randomUUID()}`

        const restored = await api.restoreEntry(
          confirm.f.id,

          confirm.f.version ?? 1,

          idempotencyKey,
        )

        dispatch({ type: "restore", id: confirm.f.id })

        dispatch({
          type: "save",

          food: {
            ...confirm.f,

            version: restored.version,

            deletedAt: undefined,
          },
        })

        notify(`Đã khôi phục ${confirm.f.name} vào kho`)

        setConfirm(null)
      } catch (failure: unknown) {
        if (
          failure instanceof ApiError &&
          (failure.code === "VERSION_CONFLICT" || failure.status === 409)
        ) {
          notify(
            "Xung đột phiên bản: Dữ liệu đã thay đổi ở nơi khác. Vui lòng tải lại.",
          )
        } else {
          notify("Lỗi kết nối máy chủ. Không thể khôi phục thực phẩm.")
        }
      } finally {
        setLoading(false)
      }

      return
    }

    dispatch({ type: confirm.kind, id: confirm.f.id })

    notify(
      confirm.kind === "restore"
        ? `Đã khôi phục ${confirm.f.name} vào kho`
        : `Đã xóa vĩnh viễn ${confirm.f.name}`,
    )

    setConfirm(null)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <PageHeader
        title="Thùng rác"
        onBack={onBack}
        subtitle="Bản ghi tự động xóa vĩnh viễn 30 ngày sau khi chuyển vào đây (kiểm tra mỗi lần mở ứng dụng)."
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Trash2 size={32} />}
          title="Thùng rác trống"
          text="Những thực phẩm bạn xóa sẽ nằm ở đây trong 30 ngày trước khi bị xóa vĩnh viễn khỏi thiết bị."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => (
            <Card key={f.id} className="flex flex-col justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-text-primary">
                  {f.name}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {f.quantity} {f.unit} · còn{" "}
                  <strong className="text-brand-primary">
                    {trashDaysLeft(f)} ngày
                  </strong>{" "}
                  trước khi xóa vĩnh viễn
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border-primary/40">
                <Button
                  size="small"
                  variant="neutral"
                  iconStart={<Undo2 size={16} />}
                  onClick={() => setConfirm({ f, kind: "restore" })}
                >
                  Khôi phục
                </Button>
                <Button
                  size="small"
                  variant="subtle"
                  className="text-status-expired hover:bg-red-50"
                  onClick={() => setConfirm({ f, kind: "purge" })}
                >
                  Xóa vĩnh viễn
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        size="small"
        title={
          confirm?.kind === "restore" ? "Khôi phục bản ghi?" : "Xóa vĩnh viễn?"
        }
        footer={
          <>
            <Button variant="neutral" onClick={() => setConfirm(null)}>
              Hủy
            </Button>
            <Button
              variant={confirm?.kind === "restore" ? "primary" : "danger"}
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading
                ? "Đang xử lý..."
                : confirm?.kind === "restore"
                  ? "Khôi phục"
                  : "Xóa vĩnh viễn"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          {confirm?.kind === "restore"
            ? `"${confirm.f.name}" sẽ trở lại kho thực phẩm với các thông tin đã lưu trước đó.`
            : `"${confirm?.f.name}" sẽ bị xóa hoàn toàn khỏi thiết bị và không thể khôi phục lại.`}
        </p>
      </Modal>
    </div>
  )
}

export default Trash
