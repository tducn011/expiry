import { useState } from "react"
import type { HistoryEvent, State } from "../store/appStore"
import { formatDate, today } from "../store/appStore"
import Button from "../components/ui/Button"
import EmptyState from "../components/ui/EmptyState"
import {
  ChevronRight,
  History as HistoryIcon,
  RotateCcw,
} from "../components/ui/Icon"
import Modal from "../components/ui/Modal"
import PageHeader from "../components/ui/PageHeader"

const kindLabel: Record<string, string> = {
  add: "Đã thêm",
  edit: "Đã sửa",
  consume: "Đã dùng",
  discard: "Đã bỏ",
  adjust: "Điều chỉnh",
  trash: "Chuyển vào Thùng rác",
  restore: "Khôi phục",
  review: "Hẹn kiểm tra lại",
}

const kindTone: Record<string, string> = {
  consume: "bg-status-ok-bg text-status-ok border-status-ok/20",
  discard: "bg-status-soon-bg text-status-soon border-status-soon/20",
  adjust: "bg-brand-tertiary text-brand-primary border-brand-primary/20",
}

function dayLabel(iso: string) {
  const d = iso.slice(0, 10)
  const t = today()
  if (d === t) return "Hôm nay"
  const y = new Date(t + "T00:00:00")
  y.setDate(y.getDate() - 1)
  const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`
  if (d === yStr) return "Hôm qua"
  return formatDate(d)
}

function eventSummary(e: HistoryEvent) {
  if (e.amount !== undefined) return `-${e.amount} ${e.unit ?? ""}`.trim()
  if (e.from !== undefined && e.to !== undefined)
    return `${e.from} → ${e.to} ${e.unit ?? ""}`.trim()
  return ""
}

export function History({
  state,
  onOpenDetail,
  onReadd,
}: {
  state: State
  onOpenDetail: (id: string) => void
  onReadd: (food: import("../store/appStore").Food) => void
}) {
  const [open, setOpen] = useState<HistoryEvent | null>(null)
  const finished = state.foods.filter((f) => f.finishedAt && !f.deletedAt)
  const quantityKinds = ["consume", "discard", "adjust"]
  const events = state.history
    .filter((e) => quantityKinds.includes(e.kind))
    .slice(0, 100)

  const groups: { day: string; items: HistoryEvent[] }[] = []
  for (const e of events) {
    const day = dayLabel(e.at)
    const g = groups.find((x) => x.day === day)
    if (g) g.items.push(e)
    else groups.push({ day, items: [e] })
  }

  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const source = open
    ? state.foods.find((f) => f.id === open.foodId)
    : undefined

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Lịch sử"
        subtitle="Các lần dùng, bỏ và điều chỉnh số lượng thực phẩm"
      />

      {events.length === 0 && finished.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon size={32} />}
          title="Chưa có hoạt động"
          text="Khi bạn ghi nhận Đã dùng, Đã bỏ hoặc điều chỉnh số lượng thực phẩm, lịch sử sẽ tự động hiển thị ở đây."
        />
      ) : (
        <>
          {groups.map((g) => (
            <section key={g.day} className="flex flex-col gap-2">
              <div
                role="heading"
                aria-level={2}
                className="px-2 text-xs md:text-sm font-semibold uppercase tracking-wide text-text-secondary"
              >
                {g.day}
              </div>
              <div className="flex flex-col divide-y divide-border-primary/40 overflow-hidden rounded-corner-lg border border-border-primary/50 bg-surface-bg shadow-xs">
                {g.items.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setOpen(e)}
                    className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover active:bg-bg-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary cursor-pointer"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-sm md:text-base font-semibold text-text-primary">
                        {e.foodName}
                      </p>
                      <p className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`rounded-corner-full border px-2 py-0.5 font-medium ${
                            kindTone[e.kind] ||
                            "bg-bg-subtle text-text-secondary"
                          }`}
                        >
                          {e.kind === "adjust"
                            ? "Điều chỉnh số lượng"
                            : kindLabel[e.kind] || e.kind}
                        </span>
                        <span className="text-text-secondary">
                          {time(e.at)}
                        </span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-xs md:text-sm">
                      <p className="font-semibold text-text-primary">
                        {eventSummary(e)}
                      </p>
                      {e.kind !== "adjust" && e.to !== undefined && (
                        <p className="text-text-secondary">
                          Còn {e.to} {e.unit}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-text-tertiary"
                    />
                  </button>
                ))}
              </div>
            </section>
          ))}

          {finished.length > 0 && (
            <section className="flex flex-col gap-2">
              <div
                role="heading"
                aria-level={2}
                className="px-2 text-xs md:text-sm font-semibold uppercase tracking-wide text-text-secondary"
              >
                Đã hết ({finished.length})
              </div>
              <div className="flex flex-col divide-y divide-border-primary/40 overflow-hidden rounded-corner-lg border border-border-primary/50 bg-surface-bg shadow-xs">
                {finished.map((f) => (
                  <div
                    key={f.id}
                    className="flex min-h-16 items-center gap-3 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm md:text-base font-semibold text-text-primary">
                        {f.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Hết ngày{" "}
                        {f.finishedAt
                          ? formatDate(f.finishedAt.slice(0, 10))
                          : ""}
                      </p>
                    </div>
                    <Button
                      size="small"
                      variant="neutral"
                      iconStart={<RotateCcw size={16} />}
                      onClick={() => onReadd(f)}
                    >
                      Thêm lại
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* History Event Detail Modal */}
      <Modal
        isOpen={!!open}
        onClose={() => setOpen(null)}
        title="Chi tiết hoạt động"
        size="small"
        footer={
          source && !source.deletedAt && !source.finishedAt ? (
            <Button
              variant="primary"
              onClick={() => {
                const fid = source.id
                setOpen(null)
                onOpenDetail(fid)
              }}
            >
              Xem thực phẩm này
            </Button>
          ) : (
            <Button variant="neutral" onClick={() => setOpen(null)}>
              Đóng
            </Button>
          )
        }
      >
        {open && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between py-1 border-b border-border-primary/40">
              <span className="text-text-secondary">Thực phẩm:</span>
              <span className="font-semibold text-text-primary">
                {open.foodName}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-primary/40">
              <span className="text-text-secondary">Thao tác:</span>
              <span className="font-semibold text-text-primary">
                {kindLabel[open.kind]}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border-primary/40">
              <span className="text-text-secondary">Thời gian:</span>
              <span className="font-semibold text-text-primary">
                {time(open.at)} ngày {formatDate(open.at.slice(0, 10))}
              </span>
            </div>
            {open.amount !== undefined && (
              <div className="flex justify-between py-1 border-b border-border-primary/40">
                <span className="text-text-secondary">Lượng ghi nhận:</span>
                <span className="font-semibold text-text-primary">
                  {open.amount} {open.unit}
                </span>
              </div>
            )}
            {open.from !== undefined && open.to !== undefined && (
              <div className="flex justify-between py-1 border-b border-border-primary/40">
                <span className="text-text-secondary">Thay đổi tồn kho:</span>
                <span className="font-semibold text-text-primary">
                  {open.from} {open.unit} → {open.to} {open.unit}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default History
