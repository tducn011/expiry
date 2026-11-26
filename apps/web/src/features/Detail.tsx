import { useEffect, useState } from "react"

import {
  api,
  ApiError,
  decimal,
  errorMessage,
  type MutationResult,
} from "../api/client"

import type { Dispatch, Food, HistoryEvent, State } from "../store/appStore"
import type { QuantityMovement } from "../domain/types"

import {
  addDays,
  CATEGORY_LABELS,
  daysLeft,
  formatDate,
  today,
} from "../store/appStore"

import Button from "../components/ui/Button"

import Card from "../components/ui/Card"

import EmptyState from "../components/ui/EmptyState"

import {
  Boxes,
  CalendarDays,
  CalendarClock,
  Check,
  FileText,
  History,
  Pencil,
  Scale,
  SearchX,
  StickyNote,
  Trash2,
} from "lucide-react"

import { getFoodIcon } from "./FoodCard"

import InputField from "../components/ui/InputField"

import Modal from "../components/ui/Modal"

import PageHeader, {
  type PageBreadcrumbItem,
} from "../components/ui/PageHeader"

import SectionTitle from "../components/ui/SectionTitle"

import StatusBadge from "../components/ui/StatusBadge"

export type DetailAction = "consume" | "discard" | "recount" | "history" | "edit" | "date" | "delete"

type QtyKind = "consume" | "discard" | "adjust"

type HistoryQueryState = {
  foodId: string
  items: QuantityMovement[]
  status: "loading" | "error" | "ready"
}

interface QtyCopyConfig {
  t: string

  label: string

  verb: string
}

const qtyCopy: Record<QtyKind, QtyCopyConfig> = {
  consume: { t: "Ghi nhận đã dùng", label: "Lượng đã dùng", verb: "Đã dùng" },

  discard: { t: "Ghi nhận đã bỏ", label: "Lượng đã bỏ", verb: "Đã bỏ" },

  adjust: {
    t: "Điều chỉnh số lượng",

    label: "Số lượng thực tế",

    verb: "Đã chỉnh về",
  },
}

const historyTitles: Record<HistoryEvent["kind"], string> = {
  add: "Đã thêm vào kho",
  edit: "Đã cập nhật thông tin",
  consume: "Đã dùng",
  discard: "Đã bỏ",
  adjust: "Đã điều chỉnh số lượng",
  trash: "Đã chuyển vào Thùng rác",
  restore: "Đã khôi phục",
  review: "Đã hẹn kiểm tra",
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date)
}

function formatLocalDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date)
}

function movementToHistoryEvent(
  movement: QuantityMovement,
  food: Food,
): HistoryEvent {
  const kind: HistoryEvent["kind"] =
    movement.kind === "consume"
      ? "consume"
      : movement.kind === "discard"
        ? "discard"
        : movement.kind === "recount"
          ? "adjust"
          : "add"

  return {
    id: movement.id,
    foodId: food.id,
    foodName: food.name,
    kind,
    at: movement.recorded_at,
    amount: Math.abs(movement.quantity_before - movement.quantity_after),
    from: movement.quantity_before,
    to: movement.quantity_after,
    unit: food.unit,
    category: food.category,
  }
}

export function historyDescription(event: HistoryEvent, food: Food) {
  const unit = event.unit || food.unit

  if (event.kind === "consume" || event.kind === "discard") {
    return `${event.amount ?? "—"} ${unit}`
  }

  if (event.kind === "adjust") {
    return `Từ ${event.from ?? "—"} đến ${event.to ?? "—"} ${unit}`
  }

  if (event.kind === "add") {
    return event.to !== undefined || event.amount !== undefined
      ? `Số lượng ban đầu: ${event.to ?? event.amount} ${unit}`
      : "Không có dữ liệu số lượng lúc nhập"
  }

  if (event.kind === "trash") return "Bản ghi được chuyển vào Thùng rác"
  if (event.kind === "restore") return "Bản ghi được khôi phục vào kho"
  if (event.kind === "edit") return "Thông tin sản phẩm được cập nhật"
  return ""
}

export function Detail({
  state,

  id,

  dispatch,

  onEdit,

  onBack,

  breadcrumbs,

  notify,
}: {
  state: State

  id: string

  dispatch: Dispatch

  onEdit: (food: Food) => void

  onBack: () => void

  breadcrumbs?: readonly PageBreadcrumbItem[]

  notify: (m: string, v?: "success" | "danger" | "warning") => void
}) {
  const f = state.foods.find((x) => x.id === id)

  const FoodIcon = f ? getFoodIcon(f.name) : SearchX

  const foodExists = Boolean(f && !f.deletedAt)

  const [qty, setQty] = useState<QtyKind | null>(null)

  const [val, setVal] = useState("")

  const [step, setStep] = useState<"enter" | "review">("enter")

  const [err, setErr] = useState("")

  const [later, setLater] = useState(false)

  const [laterDate, setLaterDate] = useState(addDays(today(), 1))

  const [confirmTrash, setConfirmTrash] = useState(false)

  const [loading, setLoading] = useState(false)

  const [historyQuery, setHistoryQuery] = useState<HistoryQueryState | null>(
    null,
  )

  useEffect(() => {
    if (state.mode !== "account" || !foodExists) {
      setHistoryQuery(null)
      return
    }

    let cancelled = false
    setHistoryQuery({ foodId: id, items: [], status: "loading" })

    api
      .history(id, { page: 1, limit: 4 })
      .then((items) => {
        if (!cancelled) setHistoryQuery({ foodId: id, items, status: "ready" })
      })
      .catch(() => {
        if (!cancelled)
          setHistoryQuery({ foodId: id, items: [], status: "error" })
      })

    return () => {
      cancelled = true
    }
  }, [id, state.mode, foodExists, f?.version])

  if (!f || f.deletedAt) {
    return (
      <EmptyState
        icon={<SearchX size={32} />}
        title="Không còn trong kho"
        action={
          <Button variant="neutral" onClick={onBack}>
            Quay lại
          </Button>
        }
      />
    )
  }

  const rd = state.settings.remindDays

  const d = daysLeft(f)

  const isExpired = d !== null && d < 0

  const n = Number(val.replace(",", "."))

  const to = qty === "adjust" ? n : +(f.quantity - n).toFixed(3)

  function next() {
    if (!/^\d+([.,]\d{1,3})?$/.test(val.trim())) {
      return setErr("Chỉ nhập số, ví dụ 1 hoặc 0.5.")
    }

    if (qty !== "adjust" && n <= 0) return setErr("Lượng phải lớn hơn 0.")

    if (qty !== "adjust" && n > f!.quantity) {
      return setErr(`Không thể lớn hơn ${f!.quantity} ${f!.unit} đang có.`)
    }

    if (qty === "adjust" && n === f!.quantity) {
      return setErr("Số lượng chưa thay đổi.")
    }

    setErr("")

    setStep("review")
  }

  async function confirm() {
    if (qty === "consume" && isExpired) {
      setErr("Không thể ghi nhận đã dùng thực phẩm quá hạn.")
      return
    }

    if (state.mode === "account") {
      setLoading(true)

      setErr("")

      try {
        const idempotencyKey = `idemp_${crypto.randomUUID()}`

        const expectedVersion = f!.version ?? 1

        let res: MutationResult

        if (qty === "adjust") {
          res = await api.recount(
            f!.id,

            {
              expected_version: expectedVersion,

              actual_quantity: decimal(n),

              reason: "Kiểm kê lại thực tế",
            },

            idempotencyKey,
          )
        } else {
          res = await api.recordMovement(
            f!.id,

            {
              expected_version: expectedVersion,

              kind: qty!,

              amount: decimal(n),

              reason: qty === "consume" ? "Đã dùng thực phẩm" : "Bỏ thực phẩm",
            },

            idempotencyKey,
          )
        }

        dispatch({ type: "qty", id: f!.id, kind: qty!, value: n })

        if (res.entry) {
          dispatch({
            type: "save",

            food: {
              ...f!,

              quantity: res.entry.remaining_quantity,

              version: res.entry.version,

              finishedAt:
                res.entry.remaining_quantity === 0
                  ? new Date().toISOString()
                  : undefined,
            },
          })
        }

        notify(
          to === 0
            ? `${f!.name} đã hết — chuyển vào Lịch sử`
            : `${qtyCopy[qty!].verb}: còn ${to} ${f!.unit}`,
        )

        setQty(null)

        if (to === 0) onBack()

        return
      } catch (failure: unknown) {
        if (failure instanceof ApiError) {
          if (failure.code === "INSUFFICIENT_QUANTITY") {
            setErr(
              "Số lượng còn lại trong kho không đủ để thực hiện thao tác này.",
            )
          } else if (
            failure.code === "VERSION_CONFLICT" ||
            failure.status === 409
          ) {
            setErr(
              "Dữ liệu đã bị thay đổi ở thiết bị khác. Vui lòng tải lại trang.",
            )
          } else {
            setErr(
              errorMessage(failure.status, failure.code) ||
                "Không thể ghi nhận biến động kho.",
            )
          }
        } else {
          setErr("Lỗi kết nối máy chủ. Vui lòng thử lại sau.")
        }

        return
      } finally {
        setLoading(false)
      }
    }

    dispatch({ type: "qty", id: f!.id, kind: qty!, value: n })

    notify(
      to === 0
        ? `${f!.name} đã hết — chuyển vào Lịch sử`
        : `${qtyCopy[qty!].verb}: còn ${to} ${f!.unit}`,
    )

    setQty(null)

    if (to === 0) onBack()
  }

  async function handleTrash() {
    setLoading(true)

    try {
      if (state.mode === "account") {
        const idempotencyKey = `idemp_${crypto.randomUUID()}`

        await api.deleteEntry(f!.id, f!.version ?? 1, idempotencyKey)
      }

      dispatch({ type: "trash", id: f!.id })

      notify("Đã chuyển vào Thùng rác")

      onBack()
    } catch (failure: unknown) {
      if (
        failure instanceof ApiError &&
        (failure.code === "VERSION_CONFLICT" || failure.status === 409)
      ) {
        notify(
          "Xung đột phiên bản: Thực phẩm đã thay đổi trước đó. Vui lòng tải lại.",
        )
      } else {
        notify("Lỗi kết nối máy chủ. Không thể chuyển vào Thùng rác.")
      }
    } finally {
      setLoading(false)

      setConfirmTrash(false)
    }
  }

  const openQty = (k: QtyKind) => {
    if (k === "consume" && isExpired) return

    setQty(k)

    setVal(k === "adjust" ? String(f.quantity) : "")

    setStep("enter")

    setErr("")
  }

  const categoryLabel = f.category
    ? CATEGORY_LABELS[f.category] || f.category
    : "Chưa phân loại"

  const currentHistoryQuery =
    historyQuery?.foodId === f.id ? historyQuery : null
  const cachedHistory = state.history.filter((event) => event.foodId === f.id)
  const historyEvents =
    state.mode === "account" &&
    currentHistoryQuery?.status === "ready" &&
    currentHistoryQuery.items.length > 0
      ? currentHistoryQuery.items.map((movement) =>
          movementToHistoryEvent(movement, f),
        )
      : cachedHistory
  const historyWithCreation = historyEvents.some(
    (event) => event.kind === "add",
  )
    ? historyEvents
    : [
        ...historyEvents,
        {
          id: `created:${f.id}`,
          foodId: f.id,
          foodName: f.name,
          kind: "add" as const,
          at: f.createdAt,
          unit: f.unit,
          category: f.category,
        },
      ]
  const recentHistory = [...historyWithCreation]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 4)

  // The summary card already shows name, category, status, quantity, expiry
  // and location; this list only carries the remaining metadata.
  const detailRows = [
    { label: "Ngày thêm", value: formatLocalDate(f.createdAt) },
    {
      label: "Ngày sản xuất",
      value: f.mfgDate ? formatDate(f.mfgDate) : "Chưa ghi nhận",
    },
    ...(f.opened_on
      ? [{ label: "Ngày mở bao bì", value: formatDate(f.opened_on) }]
      : []),
    {
      label: "Hẹn kiểm tra",
      value: f.reviewAt ? formatDate(f.reviewAt) : "Chưa đặt lịch",
    },
    ...(f.barcode ? [{ label: "Mã vạch", value: f.barcode }] : []),
  ]

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title={f.name}
        onBack={onBack}
        breadcrumbs={breadcrumbs}
        actions={
          <Button
            variant="neutral"
            size="small"
            iconStart={<Pencil size={16} />}
            onClick={() => onEdit(f)}
          >
            Sửa
          </Button>
        }
      />

      <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <Card className="min-w-0">
          <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-5">
            <div
              aria-hidden="true"
              className="flex h-28 w-24 items-center justify-center self-start rounded-corner-lg border border-border-subtle bg-brand-tertiary text-brand-primary sm:h-40 sm:w-36"
            >
              <FoodIcon size={44} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 py-1">
              <h2 className="break-words text-xl font-semibold leading-tight text-text-heading sm:text-2xl">
                {f.name}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {categoryLabel}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge food={f} remindDays={rd} />
                {f.reviewAt && (
                  <span className="inline-flex items-center gap-1.5 rounded-corner-full bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-secondary">
                    <CalendarClock size={16} aria-hidden="true" />
                    Hẹn {formatDate(f.reviewAt)}
                  </span>
                )}
              </div>
            </div>

            <dl className="col-span-2 divide-y divide-border-subtle border-t border-border-subtle">
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="flex shrink-0 items-center gap-2 text-sm text-text-secondary">
                  <Scale size={16} aria-hidden="true" />
                  Số lượng
                </dt>
                <dd className="min-w-0 break-words text-right text-sm font-semibold text-text-heading">
                  {f.quantity} {f.unit}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="flex shrink-0 items-center gap-2 text-sm text-text-secondary">
                  <CalendarDays size={16} aria-hidden="true" />
                  Hạn sử dụng
                </dt>
                <dd className="min-w-0 break-words text-right text-sm font-semibold text-text-heading">
                  {f.expDate ? formatDate(f.expDate) : "Chưa rõ HSD"}
                  {f.expDate && d !== null && (
                    <span
                      className={`block text-xs font-medium ${
                        d < 0
                          ? "text-status-expired"
                          : d <= rd
                            ? "text-status-soon"
                            : "text-text-secondary"
                      }`}
                    >
                      {d < 0
                        ? `Quá hạn ${Math.abs(d)} ngày`
                        : d === 0
                          ? "Đến hạn hôm nay"
                          : `Còn ${d} ngày`}
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="flex shrink-0 items-center gap-2 text-sm text-text-secondary">
                  <Boxes size={16} aria-hidden="true" />
                  Nơi bảo quản
                </dt>
                <dd className="min-w-0 break-words text-right text-sm font-semibold text-text-heading">
                  {f.location || "Chưa chọn kho"}
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card className="min-w-0">
          <SectionTitle className="mb-4 flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-corner-full bg-brand-tertiary text-brand-primary">
              <Check size={16} aria-hidden="true" />
            </span>
            Thao tác nhanh
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2.5">
            {!isExpired && (
              <Button
                variant="primary"
                className="min-h-12 w-full"
                iconStart={<Check size={16} aria-hidden="true" />}
                onClick={() => openQty("consume")}
              >
                Đã dùng
              </Button>
            )}
            <Button
              variant="danger"
              className="min-h-12 w-full"
              iconStart={<Trash2 size={16} aria-hidden="true" />}
              onClick={() => openQty("discard")}
            >
              Đã bỏ
            </Button>
            <Button
              variant="neutral"
              size="small"
              className="min-h-11 w-full px-2"
              iconStart={<Scale size={16} aria-hidden="true" />}
              onClick={() => openQty("adjust")}
            >
              Chỉnh số lượng
            </Button>
            {!isExpired && (
              <Button
                variant="neutral"
                size="small"
                className="min-h-11 w-full px-2"
                iconStart={<CalendarClock size={16} aria-hidden="true" />}
                onClick={() => setLater(true)}
              >
                Hẹn kiểm tra
              </Button>
            )}
          </div>
          <div className="mt-4 border-t border-border-subtle pt-3">
            <Button
              variant="subtle"
              size="small"
              className="w-full text-text-secondary hover:text-status-expired"
              iconStart={<Trash2 size={16} aria-hidden="true" />}
              onClick={() => setConfirmTrash(true)}
            >
              Chuyển vào Thùng rác
            </Button>
            <p className="text-center text-xs text-text-secondary">
              Có thể khôi phục trong 30 ngày.
            </p>
          </div>
        </Card>

        <Card className="min-w-0">
          <SectionTitle className="mb-4 flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-corner-full bg-brand-tertiary text-brand-primary">
              <FileText size={16} aria-hidden="true" />
            </span>
            Thông tin chi tiết
          </SectionTitle>
          <dl className="divide-y divide-border-subtle">
            {detailRows.map(({ label, value }) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(6.5rem,0.8fr)_minmax(0,1.2fr)] gap-3 py-3 text-sm sm:grid-cols-[minmax(9rem,0.8fr)_minmax(0,1.2fr)]"
              >
                <dt className="text-text-secondary">{label}</dt>
                <dd className="min-w-0 break-words font-medium text-text-primary">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-border-subtle pt-3">
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <StickyNote size={16} aria-hidden="true" />
              Ghi chú
            </p>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-primary">
              {f.note || "Chưa có ghi chú cho sản phẩm này."}
            </p>
          </div>
        </Card>

        <aside className="grid min-w-0 content-start gap-4">
          <Card className="min-w-0">
            <SectionTitle className="mb-4 flex items-center gap-2">
              <span className="inline-flex size-8 items-center justify-center rounded-corner-full bg-brand-tertiary text-brand-primary">
                <History size={16} aria-hidden="true" />
              </span>
              Lịch sử
            </SectionTitle>
            {currentHistoryQuery?.status === "error" && (
              <p role="status" className="mb-3 text-xs text-text-secondary">
                Không tải được lịch sử mới nhất. Đang hiển thị dữ liệu đã có.
              </p>
            )}
            <ol className="ml-2 border-l border-border-subtle">
              {recentHistory.map((event, index) => (
                <li key={event.id} className="relative pb-4 pl-5 last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[6px] top-1.5 size-3 rounded-full border-2 border-surface-bg ${
                      index === 0 ? "bg-brand-primary" : "bg-border-primary"
                    }`}
                  />
                  <p className="text-sm font-semibold text-text-heading">
                    {historyTitles[event.kind]}
                  </p>
                  {historyDescription(event, f) && (
                    <p className="mt-0.5 text-xs text-text-secondary">
                      {historyDescription(event, f)}
                    </p>
                  )}
                  <time
                    dateTime={event.at}
                    className="mt-1 block text-xs text-text-tertiary"
                  >
                    {formatTimestamp(event.at)}
                  </time>
                </li>
              ))}
            </ol>
            {currentHistoryQuery?.status === "loading" && (
              <p role="status" className="mt-3 text-xs text-text-tertiary">
                Đang tải lịch sử…
              </p>
            )}
          </Card>
        </aside>
      </div>

      {/* Quantity Modal */}
      <Modal
        isOpen={!!qty}
        onClose={() => setQty(null)}
        title={
          qty ? (step === "review" ? "Xem lại thay đổi" : qtyCopy[qty].t) : ""
        }
        size="small"
        footer={
          step === "enter" ? (
            <>
              <Button variant="neutral" onClick={() => setQty(null)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={next}>
                Tiếp
              </Button>
            </>
          ) : (
            <>
              <Button variant="neutral" onClick={() => setStep("enter")}>
                Sửa lại
              </Button>
              <Button variant="primary" onClick={confirm} disabled={loading}>
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </>
          )
        }
      >
        {qty && step === "enter" && (
          <div className="flex flex-col gap-4">
            {(qty === "consume" || qty === "discard") && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-secondary">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setVal(String(f.quantity))

                    setErr("")
                  }}
                  className="rounded-corner-full border border-border-primary bg-surface-bg px-2.5 py-1 text-xs font-medium text-text-primary hover:border-brand-primary transition-colors cursor-pointer"
                >
                  {qty === "consume" ? "Dùng hết" : "Bỏ hết"} ({f.quantity}{" "}
                  {f.unit})
                </button>
                {f.quantity > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setVal("1")

                      setErr("")
                    }}
                    className="rounded-corner-full border border-border-primary bg-surface-bg px-2.5 py-1 text-xs font-medium text-text-primary hover:border-brand-primary transition-colors cursor-pointer"
                  >
                    1 {f.unit}
                  </button>
                )}
                {f.quantity >= 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setVal(String(+(f.quantity / 2).toFixed(2)))

                      setErr("")
                    }}
                    className="rounded-corner-full border border-border-primary bg-surface-bg px-2.5 py-1 text-xs font-medium text-text-primary hover:border-brand-primary transition-colors cursor-pointer"
                  >
                    Một nửa ({+(f.quantity / 2).toFixed(2)} {f.unit})
                  </button>
                )}
              </div>
            )}
            <InputField
              label={`${qtyCopy[qty].label} (${f.unit})`}
              inputMode="decimal"
              value={val}
              onChange={(v: string) => {
                setVal(v)

                setErr("")
              }}
              autoFocus
            />
            {err && (
              <p role="alert" className="text-xs text-danger font-medium">
                {err}
              </p>
            )}
          </div>
        )}

        {qty && step === "review" && (
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-text-secondary">
              {qtyCopy[qty].verb}
              {qty !== "adjust" ? `: ${n} ${f.unit}` : ""}
            </p>
            <p className="text-base font-semibold text-text-heading">
              {f.quantity} {f.unit} → {to} {f.unit}
            </p>
            {to === 0 && (
              <p className="text-xs text-text-secondary bg-bg-subtle p-2.5 rounded-corner-md">
                Món sẽ rời khỏi kho và được lưu trong Lịch sử để bạn thêm lại
                khi mua mới.
              </p>
            )}
            {err && (
              <p role="alert" className="text-xs text-danger font-medium">
                {err}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={later}
        onClose={() => setLater(false)}
        title="Hẹn kiểm tra lại"
        size="small"
        footer={
          <>
            <Button variant="neutral" onClick={() => setLater(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              disabled={!laterDate || laterDate <= today()}
              onClick={() => {
                dispatch({ type: "review", id: f.id, date: laterDate })

                setLater(false)

                notify(`Sẽ nhắc lại ngày ${formatDate(laterDate)}`)
              }}
            >
              Lưu lịch hẹn
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                size="small"
                variant={
                  laterDate === addDays(today(), num) ? "primary" : "neutral"
                }
                onClick={() => setLaterDate(addDays(today(), num))}
              >
                {num} ngày nữa
              </Button>
            ))}
          </div>
          <InputField
            label="Hoặc chọn ngày cụ thể"
            type="date"
            value={laterDate}
            onChange={setLaterDate}
            min={addDays(today(), 1)}
          />
          <p className="text-xs text-text-secondary">
            Ngày hẹn chỉ dời lời nhắc. HSD ghi trên nhãn thực phẩm không bị thay
            đổi.
          </p>
        </div>
      </Modal>

      {/* Trash Modal */}
      <Modal
        isOpen={confirmTrash}
        onClose={() => setConfirmTrash(false)}
        title="Chuyển vào Thùng rác?"
        size="small"
        footer={
          <>
            <Button variant="neutral" onClick={() => setConfirmTrash(false)}>
              Hủy
            </Button>
            <Button variant="danger" disabled={loading} onClick={handleTrash}>
              {loading ? "Đang xử lý..." : "Chuyển vào Thùng rác"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary leading-relaxed">
          Dùng khi bản ghi bị nhập sai hoặc không cần theo dõi nữa. Bạn có thể
          khôi phục trong vòng 30 ngày. Để ghi lại món đã ăn hoặc đã bỏ đi, hãy
          dùng nút &quot;Đã dùng&quot; hoặc &quot;Đã bỏ&quot;.
        </p>
      </Modal>
    </div>
  )
}

export default Detail
