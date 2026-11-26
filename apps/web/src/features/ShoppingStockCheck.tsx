import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { api } from "../api/client"
import type { ShoppingItem } from "../domain/types"
import {
  compareShoppingStock,
  hasComparableUnits,
  type StockPackage,
} from "../domain/shoppingStock"
import { formatDate, today, type State } from "../store/appStore"
import Button from "../components/ui/Button"

type StockSnapshot = { status: "loading" | "error" } | {
  status: "ready"
  foods: StockPackage[]
  readAt: string
}

export function useShoppingStock(state: State, refresh: number): StockSnapshot {
  const request = useMemo(
    () => ({
      mode: state.mode,
      owner: state.userId,
      foods: state.foods,
      refresh,
    }),
    [state.mode, state.userId, state.foods, refresh],
  )
  const [result, setResult] = useState<{
    request: typeof request
    snapshot: StockSnapshot
  }>()
  useEffect(() => {
    if (request.mode === "none") return
    let canceled = false
    async function read() {
      try {
        let foods: StockPackage[]
        if (request.mode === "demo") {
          foods = request.foods.map((food) => ({
            ...food,
            expiry: food.expDate,
            inactive: Boolean(food.deletedAt || food.finishedAt),
          }))
        } else {
          if (!request.owner) throw new Error("Inventory owner required")
          const limit = 100
          foods = []
          let expected: number | undefined
          let asOf: string | undefined
          const seen = new Set<string>()
          for (let page = 1; ; page++) {
            const response = await api.entries({ page, limit })
            if (canceled) return
            expected ??= response.pagination.total
            asOf ??= response.as_of_date
            if (
              expected !== response.pagination.total ||
              asOf !== response.as_of_date
            )
              throw new Error("Inventory changed")
            for (const food of response.items) {
              if (seen.has(food.id)) throw new Error("Inventory changed")
              seen.add(food.id)
              foods.push({
                id: food.id,
                name: food.name,
                quantity: food.remaining_quantity,
                unit: food.unit === "piece" ? "cái" : food.unit,
                category: food.category,
                location: food.storage_location,
                expiry: food.expiry_date,
                inactive: Boolean(food.deleted_at),
                version: food.version,
              })
            }
            if (foods.length === expected) break
            if (!response.items.length || foods.length > expected)
              throw new Error("Incomplete inventory")
          }
        }
        if (!canceled)
          setResult({
            request,
            snapshot: {
              status: "ready",
              foods,
              readAt: new Date().toISOString(),
            },
          })
      } catch {
        if (!canceled) setResult({ request, snapshot: { status: "error" } })
      }
    }
    void read()
    return () => {
      canceled = true
    }
  }, [request])
  if (state.mode === "none") return { status: "error" }
  return result?.request === request ? result.snapshot : { status: "loading" }
}

const timestamp = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  })

interface QuantityTimeProps {
  foodId: string
  state: State
}

function QuantityTime({ foodId, state }: QuantityTimeProps) {
  const [live, setLive] = useState<{
    status: "ready" | "error"
    at?: string
  }>()
  useEffect(() => {
    if (state.mode !== "account") return
    let canceled = false
    api
      .history(foodId, { page: 1, limit: 1 })
      .then((events) => {
        if (!canceled) setLive({ status: "ready", at: events[0]?.recorded_at })
      })
      .catch(() => {
        if (!canceled) setLive({ status: "error" })
      })
    return () => {
      canceled = true
    }
  }, [state.mode, foodId])
  const demoTime = state.history.reduce<string | undefined>((latest, event) => {
    if (
      event.foodId !== foodId ||
      !["add", "consume", "discard", "adjust"].includes(event.kind)
    )
      return latest
    return !latest || Date.parse(event.at) > Date.parse(latest)
      ? event.at
      : latest
  }, undefined)
  const at = state.mode === "account" ? live?.at : demoTime
  let label = "Chưa có dữ liệu"
  if (at && Number.isFinite(Date.parse(at))) label = timestamp(at)
  else if (state.mode === "account") {
    if (!live) label = "Đang tải…"
    else if (live.status === "error") label = "Không đọc được lịch sử"
  }
  return <p>Đổi số lượng gần nhất: {label}</p>
}

export function ShoppingStockCheck({
  item,
  snapshot,
  state,
  onRetry,
  onLink,
}: {
  item: ShoppingItem
  snapshot: StockSnapshot
  state: State
  onRetry: () => void
  onLink: (foodId: string | undefined) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [selection, setSelected] = useState<{
    foodId: string
    snapshot: StockSnapshot
  }>()
  const selected =
    selection?.snapshot === snapshot ? selection?.foodId : undefined
  const candidates =
    snapshot.status === "ready"
      ? compareShoppingStock(item, snapshot.foods)
      : []
  const linked = candidates.find(({ food }) => food.id === item.matchedFoodId)
  const status =
    snapshot.status === "loading"
      ? "Đang đối chiếu…"
      : snapshot.status === "error"
        ? "Không kiểm tra được"
        : linked
          ? "Khớp dữ liệu kho"
          : candidates.length
            ? "Có thể khớp"
            : "Không tìm thấy trong kho đã ghi"
  const candidate = candidates.find(({ food }) => food.id === selected)

  const [confirming, setConfirming] = useState(false)
  const [confirmationError, setConfirmationError] = useState("")
  const confirmationRequest = useRef<StockSnapshot | undefined>(snapshot)
  useEffect(() => {
    confirmationRequest.current = snapshot
    return () => {
      confirmationRequest.current = undefined
    }
  }, [snapshot])

  async function confirmPackage(food: StockPackage) {
    if (confirming) return
    setConfirmationError("")
    if (state.mode !== "account") {
      onLink(food.id)
      setSelected(undefined)
      return
    }

    setConfirming(true)
    try {
      const current = await api.entry(food.id)
      if (confirmationRequest.current !== snapshot) return
      if (
        current.deleted_at ||
        current.remaining_quantity <= 0 ||
        current.version !== food.version
      ) {
        setConfirmationError(
          "Gói trong kho đã thay đổi. Hãy xem lại kết quả mới.",
        )
        onRetry()
        return
      }
      onLink(food.id)
      setSelected(undefined)
    } catch {
      if (confirmationRequest.current === snapshot) {
        setConfirmationError(
          "Chưa xác nhận được gói trong kho. Hãy kiểm tra lại.",
        )
        onRetry()
      }
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="border-t border-border-subtle pt-1">
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={`${status}: ${item.name}`}
        onClick={() => setExpanded((open) => !open)}
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-corner-sm py-1 text-left text-xs font-semibold hover:underline ${
          linked ? "text-status-ok" : "text-text-secondary"
        }`}
      >
        <span className="min-w-0">
          <span className="mr-2 text-text-secondary font-normal">
            Đối chiếu kho
          </span>
          {status}
          {candidates.length > 0 && (
            <span className="ml-1 text-text-secondary font-normal">
              · {candidates.length} gói
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={`shrink-0 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="grid gap-2 pb-2 text-xs text-text-secondary">
          {confirmationError && <p role="status">{confirmationError}</p>}
          {snapshot.status === "loading" && (
            <p role="status">Đang đọc kho hiện tại…</p>
          )}
          {snapshot.status === "error" && (
            <div className="flex flex-wrap items-center gap-2">
              <p role="status">Chưa đọc được kho hiện tại.</p>
              <Button variant="secondary" onClick={onRetry}>
                Kiểm tra lại
              </Button>
            </div>
          )}
          {snapshot.status === "ready" && (
            <>
              <p>
                Đọc kho lúc {timestamp(snapshot.readAt)}
                {state.mode === "demo" ? " · Dữ liệu mẫu" : ""}
              </p>
              {candidates.length > 0 && (
                <p>
                  Dựa trên kho đã ghi. Kiểm tra số lượng thực tế và tình trạng
                  thực phẩm trước khi quyết định mua.
                </p>
              )}
              {item.matchedFoodId && !linked && (
                <p>Gói đã liên kết không còn là ứng viên trong lần đọc này.</p>
              )}
              {candidates.map(({ food, reason }) => {
                const isLinked = linked?.food.id === food.id
                const isExpired = food.expiry && food.expiry < today()
                return (
                  <div
                    key={food.id}
                    className="grid gap-1 rounded-corner-md border border-border-subtle p-3"
                  >
                    <p className="break-words font-semibold text-text-heading">
                      {food.name}
                      {isLinked && " · Đã liên kết"}
                    </p>
                    <p>
                      {reason} · {food.quantity} {food.unit} ·{" "}
                      {food.location || "Chưa rõ vị trí"}
                    </p>
                    <p>
                      {food.expiry
                        ? `HSD ${formatDate(food.expiry)}${
                            isExpired ? " · Quá hạn" : ""
                          }`
                        : "Chưa rõ HSD"}
                    </p>
                    <QuantityTime
                      key={snapshot.readAt + food.id}
                      foodId={food.id}
                      state={state}
                    />
                    {item.unit && !hasComparableUnits(item.unit, food.unit) && (
                      <p>Đơn vị khác với mục mua. Xem từng gói để đối chiếu.</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {isLinked ? (
                        <Button
                          variant="subtle"
                          onClick={() => onLink(undefined)}
                        >
                          Bỏ liên kết
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          disabled={confirming}
                          onClick={() => {
                            setConfirmationError("")
                            setSelected({ foodId: food.id, snapshot })
                          }}
                        >
                          Chọn gói này
                        </Button>
                      )}
                    </div>
                    {candidate?.food.id === food.id && (
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:flex">
                        <Button
                          className="min-w-0 px-2"
                          loading={confirming}
                          onClick={() => void confirmPackage(food)}
                        >
                          Xác nhận liên kết
                        </Button>
                        <Button
                          variant="subtle"
                          disabled={confirming}
                          onClick={() => setSelected(undefined)}
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
