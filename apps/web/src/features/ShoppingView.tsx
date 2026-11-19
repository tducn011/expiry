import { useEffect, useState, type FormEvent } from "react"
import {
  Check,
  PackagePlus,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react"
import type { ShoppingItem } from "../domain/types"
import { normalizeShoppingName } from "../domain/shoppingStock"
import { inferCategory, UNITS, type State } from "../store/appStore"
import {
  addShoppingItem,
  changeShoppingItem,
  getShoppingItems,
  ShoppingItemChanged,
  suggestItemsFromInventory,
} from "../api/shoppingStorage"
import Button from "../components/ui/Button"
import SelectField from "../components/ui/SelectField"
import EmptyState from "../components/ui/EmptyState"
import Modal from "../components/ui/Modal"
import PageHeader from "../components/ui/PageHeader"
import type { ToastProps } from "../components/ui/Toast"
import { getFoodIcon } from "./FoodCard"
import { ShoppingStockCheck, useShoppingStock } from "./ShoppingStockCheck"

export type ShoppingFilter = "all" | "active" | "checked"

export interface ShoppingViewProps {
  state: State
  filter?: ShoppingFilter
  onFilterChange?: (filter: ShoppingFilter) => void
  onAddToInventory: (item: ShoppingItem, method: "scan" | "manual") => void
  notify: (msg: string, variant?: ToastProps["variant"]) => void
}

const units = [
  { value: "", label: "Đơn vị" },
  ...UNITS.map((unit) => ({ value: unit, label: unit })),
]
const blankDraft = { name: "", quantity: "", unit: "" }

function readList(owner: string | undefined) {
  try {
    return { items: getShoppingItems(owner), unavailable: false }
  } catch {
    return { items: [], unavailable: true }
  }
}

function describeQuantity(item: ShoppingItem) {
  if (item.quantity === null)
    return item.unit ? `Chưa rõ lượng · ${item.unit}` : "Chưa rõ lượng"
  return item.unit
    ? `${item.quantity} ${item.unit}`
    : `${item.quantity} · Chưa rõ đơn vị`
}

export function ShoppingView({
  state,
  filter: routeFilter,
  onFilterChange,
  onAddToInventory,
  notify,
}: ShoppingViewProps) {
  const owner = state.userId
  const [list, setList] = useState(() => readList(owner))
  const [draft, setDraft] = useState(blankDraft)
  const [error, setError] = useState("")
  const [localFilter, setLocalFilter] = useState<ShoppingFilter>("all")
  const [editing, setEditing] = useState<ShoppingItem>()
  const [removing, setRemoving] = useState<ShoppingItem>()
  const [importItemId, setImportItemId] = useState<string>()
  const [revision, setRevision] = useState(0)
  const reloadStock = () => setRevision((value) => value + 1)
  const snapshot = useShoppingStock(state, revision)
  const { items, unavailable } = list
  const filter = routeFilter ?? localFilter

  useEffect(() => {
    setList(readList(owner))
    const refresh = () => {
      setList(readList(owner))
      setRevision((value) => value + 1)
    }
    window.addEventListener("storage", refresh)
    window.addEventListener("focus", refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener("focus", refresh)
    }
  }, [owner])

  const active = items.filter((item) => !item.checked)
  const bought = items.filter((item) => item.checked)
  const importItem = bought.find(
    (item) => item.id === importItemId && !item.inventoryAddedAt,
  )
  const suggestionFoods =
    state.mode === "demo"
      ? state.foods
      : snapshot.status === "ready"
        ? snapshot.foods.filter((food) => !food.inactive)
        : []
  const suggestions = suggestItemsFromInventory(suggestionFoods, items)

  const updateList = (next: ShoppingItem[]) =>
    setList({ items: next, unavailable: false })

  function change(
    item: ShoppingItem,
    update: (current: ShoppingItem) => ShoppingItem | null,
  ) {
    try {
      updateList(changeShoppingItem(item, update, owner))
      setError("")
      return true
    } catch (failure) {
      if (failure instanceof ShoppingItemChanged) {
        setList(readList(owner))
        setError(
          "Mục mua đã thay đổi. Hãy xem lại danh sách trước khi xác nhận.",
        )
      } else {
        setError(
          "Chưa lưu được danh sách. Hãy kiểm tra quyền lưu dữ liệu rồi thử lại.",
        )
      }
      return false
    }
  }

  function add(values: Omit<ShoppingItem, "id" | "createdAt">) {
    try {
      const latest = getShoppingItems(owner)
      if (
        latest.some(
          (item) =>
            !item.checked &&
            normalizeShoppingName(item.name) ===
              normalizeShoppingName(values.name) &&
            (item.quantity ?? null) === values.quantity &&
            (item.unit ?? null) === values.unit,
        )
      ) {
        setError(
          "Món với lượng và đơn vị này đã có trong danh sách cần mua. Bạn có thể sửa mục hiện tại.",
        )
        return false
      }
      const added = addShoppingItem(values, owner)
      updateList([added, ...latest])
      setError("")
      reloadStock()
      notify(`Đã thêm ${added.name} vào danh sách`)
      return true
    } catch {
      setError("Chưa lưu được danh sách. Thông tin bạn nhập vẫn còn.")
      return false
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = draft.name.trim()
    const quantityText = draft.quantity.trim().replace(",", ".")
    const quantity = quantityText ? Number(quantityText) : null
    if (!normalizeShoppingName(name) || [...name].length > 200) {
      setError("Nhập tên món từ 1 đến 200 ký tự.")
      return
    }
    if (
      quantity !== null &&
      (!/^\d+(?:\.\d{1,3})?$/.test(quantityText) ||
        quantity <= 0 ||
        quantity > 999999999.999)
    ) {
      setError("Nhập số lượng lớn hơn 0, tối đa 3 chữ số thập phân.")
      return
    }
    const unit = draft.unit || null
    const category = inferCategory(name)
    if (editing) {
      if (
        !change(editing, (item) => ({
          ...item,
          name,
          quantity,
          unit,
          category: name === item.name ? item.category : category,
          matchedFoodId:
            name === item.name &&
            quantity === item.quantity &&
            unit === item.unit
              ? item.matchedFoodId
              : undefined,
        }))
      )
        return
      reloadStock()
      notify("Đã cập nhật mục mua")
    } else if (!add({ name, quantity, unit, category, checked: false })) return
    setEditing(undefined)
    setDraft(blankDraft)
  }

  function startEdit(item: ShoppingItem) {
    setEditing(item)
    setDraft({
      name: item.name,
      quantity: item.quantity?.toString() ?? "",
      unit: item.unit ?? "",
    })
    setError("")
    document.getElementById("shopping-name")?.focus()
  }

  function renderItem(item: ShoppingItem) {
    const Icon = getFoodIcon(item.name)
    return (
      <article key={item.id} className="min-w-0 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            role="checkbox"
            aria-checked={item.checked}
            aria-label={`${
              item.checked ? "Đánh dấu chưa mua" : "Đánh dấu đã mua"
            } ${item.name}`}
            onClick={() => {
              if (
                change(item, (current) => ({
                  ...current,
                  checked: !current.checked,
                }))
              ) {
                notify(
                  item.checked ? "Đã chuyển về Cần mua" : "Đã đánh dấu đã mua",
                )
              }
            }}
            className="grid size-11 shrink-0 place-items-center rounded-corner-md hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            <span
              className={`grid size-6 place-items-center rounded-md border-2 ${
                item.checked
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-border-control"
              }`}
            >
              {item.checked && <Check size={15} aria-hidden="true" />}
            </span>
          </button>
          <Icon
            size={18}
            className="hidden shrink-0 text-text-secondary min-[360px]:block"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-semibold text-text-heading">
              {item.name}
            </h3>
            <p className="text-xs text-text-secondary">
              {describeQuantity(item)}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Sửa ${item.name}`}
            onClick={() => startEdit(item)}
            className="grid size-11 shrink-0 place-items-center rounded-corner-md text-text-secondary hover:bg-surface-hover"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Xóa ${item.name}`}
            onClick={() => setRemoving(item)}
            className="grid size-11 shrink-0 place-items-center rounded-corner-md text-text-secondary hover:bg-surface-hover"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
        <ShoppingStockCheck
          item={item}
          state={state}
          snapshot={snapshot}
          onRetry={reloadStock}
          onLink={(foodId) => {
            if (
              change(item, (current) => ({ ...current, matchedFoodId: foodId }))
            ) {
              notify(foodId ? "Đã liên kết gói trong kho" : "Đã bỏ liên kết")
            }
          }}
        />
        {(item.inventoryAddedAt || item.checked) && (
          <div className="flex justify-end">
            {item.inventoryAddedAt ? (
              <span className="py-2 text-xs font-semibold text-status-ok">
                Đã nhập kho
              </span>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setImportItemId(item.id)}
                iconStart={<PackagePlus size={15} />}
              >
                Thêm vào kho
              </Button>
            )}
          </div>
        )}
      </article>
    )
  }

  const sections = [
    {
      id: "active",
      label: "Cần mua",
      items: active,
      empty: "Không còn món cần mua",
    },
    {
      id: "checked",
      label: "Đã mua",
      items: bought,
      empty: "Chưa có món đã mua",
    },
  ] as const

  return (
    <div className="shopping-view flex w-full flex-col gap-4">
      <PageHeader
        title="Mua sắm"
        actions={
          items.length > 0 && (
            <Button variant="subtle" onClick={reloadStock}>
              Đọc lại kho
            </Button>
          )
        }
      />
      {items.length > 0 && (
        <section
          aria-label="Tiến độ mua sắm"
          className="rounded-corner-lg border border-border-primary bg-surface-bg p-3"
        >
          <div className="flex justify-between gap-2 text-xs font-semibold">
            <span>{active.length} cần mua</span>
            <span>
              {bought.length}/{items.length} đã mua
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-secondary"
            role="progressbar"
            aria-label="Số món đã mua"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={bought.length}
          >
            <div
              className="h-full rounded-full bg-brand-primary"
              style={{ width: `${(100 * bought.length) / items.length}%` }}
            />
          </div>
        </section>
      )}

      <form onSubmit={submit} className="flex flex-col gap-2">
        {editing && (
          <h2 className="text-sm font-semibold text-text-heading">
            Sửa mục mua
          </h2>
        )}
        <div
          className={`shopping-entry-fields grid min-w-0 items-center gap-2 ${
            editing
              ? "grid-cols-2 sm:grid-cols-[minmax(0,1fr)_100px_112px]"
              : "grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto] sm:grid-cols-[minmax(0,1fr)_100px_112px_auto]"
          }`}
        >
          <input
            id="shopping-name"
            type="text"
            value={draft.name}
            maxLength={200}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Tên món cần mua"
            aria-label="Tên món cần mua"
            className="col-span-full h-11 min-w-0 rounded-corner-md border border-border-control bg-surface-bg px-3 text-base sm:col-span-1 md:text-sm"
          />
          <input
            type="text"
            inputMode="decimal"
            value={draft.quantity}
            onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
            placeholder="Số lượng"
            aria-label="Số lượng (tùy chọn)"
            className="h-11 min-w-0 rounded-corner-md border border-border-control bg-surface-bg px-2 text-base md:text-sm"
          />
          <SelectField
            value={draft.unit}
            onChange={(unit) => setDraft({ ...draft, unit })}
            aria-label="Đơn vị"
            options={units}
          />
          <div
            className={
              editing
                ? "col-span-full grid grid-cols-2 gap-2 sm:flex sm:justify-end"
                : "grid"
            }
          >
            {editing && (
              <Button
                variant="subtle"
                onClick={() => {
                  setEditing(undefined)
                  setDraft(blankDraft)
                  setError("")
                }}
              >
                Hủy sửa
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="px-3"
              disabled={unavailable || !draft.name.trim()}
              iconStart={editing ? undefined : <Plus size={16} />}
            >
              {editing ? "Lưu mục mua" : "Thêm"}
            </Button>
          </div>
        </div>
      </form>
      {error && (
        <p
          role="alert"
          className="rounded-corner-md bg-status-expired-bg px-3 py-2 text-sm text-status-expired"
        >
          {error}
        </p>
      )}
      {unavailable && (
        <div className="flex flex-wrap items-center gap-2">
          <p role="alert">Không đọc được danh sách mua.</p>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setList(readList(owner))}
          >
            Thử lại
          </Button>
        </div>
      )}
      {!unavailable && items.length === 0 && (
        <EmptyState
          icon={<ShoppingBag size={32} />}
          title="Danh sách mua sắm trống"
        />
      )}
      {items.length > 0 && (
        <>
          <div
            role="group"
            aria-label="Lọc danh sách mua sắm"
            className="grid grid-cols-3 gap-1.5 sm:w-fit sm:gap-2"
          >
            {([
              ["all", "Tất cả", items.length],
              ["active", "Chưa mua", active.length],
              ["checked", "Đã mua", bought.length],
            ] as const).map(([value, label, count]) => (
              <Button
                key={value}
                size="small"
                className="min-w-0 !min-h-11 !px-0.5 min-[360px]:!px-1.5 sm:!px-3"
                type="button"
                aria-pressed={filter === value}
                variant={filter === value ? "primary" : "secondary"}
                onClick={() => {
                  setLocalFilter(value)
                  onFilterChange?.(value)
                }}
              >
                {label} ({count})
              </Button>
            ))}
          </div>
          {sections
            .filter(
              (section) =>
                filter === section.id ||
                (filter === "all" && section.items.length),
            )
            .map((section) => (
              <section
                key={section.id}
                aria-label={section.label}
                className="grid gap-2"
              >
                <h2 className="text-sm font-semibold text-text-heading">
                  {section.label} ({section.items.length})
                </h2>
                {section.items.length ? (
                  <div className="divide-y divide-border-subtle rounded-corner-lg border border-border-primary bg-surface-bg">
                    {section.items.map(renderItem)}
                  </div>
                ) : (
                  <EmptyState title={section.empty} />
                )}
              </section>
            ))}
        </>
      )}

      {!unavailable && suggestions.length > 0 && (
        <section aria-label="Gợi ý từ kho" className="grid gap-2">
          <h2 className="text-sm font-semibold text-text-heading">
            Gợi ý từ kho
          </h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 6).map((suggestion) => (
              <Button
                key={suggestion.name}
                size="small"
                variant="secondary"
                onClick={() => add({ ...suggestion, checked: false })}
              >
                {suggestion.name}
              </Button>
            ))}
          </div>
        </section>
      )}

      {removing && (
        <Modal
          title="Xóa mục mua?"
          onClose={() => setRemoving(undefined)}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setRemoving(undefined)}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (change(removing, () => null)) {
                    reloadStock()
                    notify("Đã xóa mục mua")
                  }
                  setRemoving(undefined)
                }}
              >
                Xóa mục mua
              </Button>
            </>
          }
        >
          <p className="text-sm text-text-secondary [overflow-wrap:anywhere]">
            {removing.name}
          </p>
        </Modal>
      )}

      {importItem && (
        <Modal
          title="Thêm vào kho"
          onClose={() => setImportItemId(undefined)}
          size="compact"
        >
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-2">
            <div className="min-w-0 [overflow-wrap:anywhere] sm:col-span-2">
              <p className="text-sm font-semibold text-text-heading">
                {importItem.name}
              </p>
              <p className="text-xs text-text-secondary">
                {describeQuantity(importItem)}
              </p>
            </div>
            <Button
              block
              variant="primary"
              onClick={() => onAddToInventory(importItem, "scan")}
            >
              Quét nhãn HSD
            </Button>
            <Button
              block
              variant="secondary"
              onClick={() => onAddToInventory(importItem, "manual")}
            >
              Nhập HSD thủ công
            </Button>
            <Button
              block
              variant="subtle"
              className="sm:col-span-2"
              onClick={() => setImportItemId(undefined)}
            >
              Để sau
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ShoppingView
