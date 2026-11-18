import { useEffect, useMemo, useState } from "react"
import {
  Check,
  PackagePlus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"

import type { State } from "../store/appStore"
import { CATEGORY_LABELS, inferCategory } from "../store/appStore"
import type { ShoppingItem } from "../domain/types"
import {
  addShoppingItem,
  deleteShoppingItem,
  getShoppingItems,
  suggestItemsFromInventory,
  toggleShoppingItem,
} from "../api/shoppingStorage"
import Button from "../components/ui/Button"
import EmptyState from "../components/ui/EmptyState"
import Modal from "../components/ui/Modal"
import PageHeader from "../components/ui/PageHeader"
import type { ToastProps } from "../components/ui/Toast"
import { getFoodIcon } from "./FoodCard"

export interface ShoppingViewProps {
  state: State
  onAddToInventory: (item: ShoppingItem, method: "scan" | "manual") => void
  notify: (msg: string, variant?: ToastProps["variant"]) => void
}

export function ShoppingView({
  state,
  onAddToInventory,
  notify,
}: ShoppingViewProps) {
  const [items, setItems] = useState<ShoppingItem[]>(() =>
    getShoppingItems(state.userId),
  )
  const [newName, setNewName] = useState("")
  const [newQty, setNewQty] = useState("1")
  const [newUnit, setNewUnit] = useState<string>("cái")
  const [filter, setFilter] = useState<"all" | "active" | "checked">("all")
  const [lastBoughtId, setLastBoughtId] = useState<string | null>(null)
  const [importItemId, setImportItemId] = useState<string | null>(null)

  useEffect(() => setItems(getShoppingItems(state.userId)), [state.userId])

  const suggestions = useMemo(
    () => suggestItemsFromInventory(state.foods, items),
    [state.foods, items],
  )

  const activeItems = useMemo(() => items.filter((i) => !i.checked), [items])
  const checkedItems = useMemo(() => items.filter((i) => i.checked), [items])
  const importItem = items.find((item) => item.id === importItemId) || null
  const lastBought = items.find(
    (item) =>
      item.id === lastBoughtId && item.checked && !item.inventoryAddedAt,
  )
  const progress = items.length
    ? Math.round((checkedItems.length / items.length) * 100)
    : 0

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return

    const qty = Math.max(1, Number(newQty) || 1)
    const category = inferCategory(trimmed)
    const added = addShoppingItem(
      {
        name: trimmed,
        quantity: qty,
        unit: newUnit,
        category,
        checked: false,
        addedFromInventory: false,
      },
      state.userId,
    )

    setItems((prev) => [added, ...prev])
    setNewName("")
    setNewQty("1")
    notify(`Đã thêm "${trimmed}" vào danh sách mua sắm`)
  }

  const handleAddSuggestion = (
    s: ReturnType<typeof suggestItemsFromInventory>[number],
  ) => {
    const added = addShoppingItem(
      {
        name: s.name,
        quantity: s.quantity,
        unit: s.unit || "cái",
        category: s.category || inferCategory(s.name),
        checked: false,
        addedFromInventory: true,
        note: s.note,
      },
      state.userId,
    )
    setItems((prev) => [added, ...prev])
    notify(`Đã thêm "${s.name}" từ kho vào danh sách`)
  }

  const handleToggle = (id: string) => {
    const item = items.find((entry) => entry.id === id)
    const next = toggleShoppingItem(id, state.userId)
    setItems(next)
    if (item && !item.checked) {
      setLastBoughtId(id)
    } else if (lastBoughtId === id) {
      setLastBoughtId(null)
    }
  }

  const handleDelete = (id: string, name: string) => {
    const next = deleteShoppingItem(id, state.userId)
    setItems(next)
    notify(`Đã xóa "${name}"`)
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader title="Mua sắm" />

      {items.length > 0 && (
        <section
          aria-label="Tiến độ mua sắm"
          className="rounded-corner-lg border border-border-primary bg-surface-bg p-4 shadow-xs"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-text-heading">
              Danh sách của tôi
            </h2>
            <span className="text-sm font-semibold tabular-nums text-text-primary">
              {checkedItems.length}/{items.length} đã mua
            </span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-surface-soft"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuenow={checkedItems.length}
            aria-label="Số món đã mua"
          >
            <div
              className="h-full rounded-full bg-brand-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      )}

      {/* Add Item Input Form */}
      <form
        onSubmit={handleAddItem}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-[16px] border border-border-control bg-surface-bg shadow-none"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên món cần mua"
            aria-label="Tên món cần mua"
            className="h-11 w-full rounded-[12px] bg-transparent px-3 text-[14px] leading-[20px] text-text-primary placeholder:text-text-placeholder outline-none"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min="1"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            className="h-11 w-16 rounded-[12px] border border-border-primary bg-surface-subtle px-2.5 text-center text-[14px] font-medium text-text-primary outline-none focus:border-brand-primary"
            title="Số lượng"
            aria-label="Số lượng"
          />
          <select
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            aria-label="Đơn vị"
            className="h-11 rounded-[12px] border border-border-primary bg-surface-subtle px-2.5 text-[14px] font-medium text-text-primary outline-none focus:border-brand-primary cursor-pointer"
          >
            <option value="cái">cái</option>
            <option value="hộp">hộp</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="lít">lít</option>
            <option value="quả">quả</option>
            <option value="bó">bó</option>
            <option value="gói">gói</option>
          </select>
          <Button
            type="submit"
            variant="secondary"
            size="small"
            iconStart={<Plus size={16} />}
            disabled={!newName.trim()}
          >
            Thêm
          </Button>
        </div>
      </form>

      {lastBought && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-corner-lg border border-status-ok/30 bg-status-ok-bg px-4 py-3"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
            <Check size={18} className="text-status-ok" aria-hidden="true" />
            Đã mua {lastBought.name}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setImportItemId(lastBought.id)}
              iconStart={<PackagePlus size={15} />}
            >
              Thêm vào kho
            </Button>
            <button
              type="button"
              aria-label="Ẩn gợi ý thêm vào kho"
              onClick={() => setLastBoughtId(null)}
              className="flex size-11 md:size-8 items-center justify-center rounded-corner-sm text-text-secondary hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div
          role="tablist"
          aria-label="Lọc danh sách mua sắm"
          className="grid grid-cols-3 gap-1.5"
        >
          {([
            ["all", `Tất cả (${items.length})`],
            ["active", `Chưa mua (${activeItems.length})`],
            ["checked", `Đã mua (${checkedItems.length})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={`min-h-11 md:min-h-10 min-w-0 whitespace-nowrap rounded-corner-full border px-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary sm:text-sm ${
                filter === value
                  ? "border-brand-primary bg-brand-primary text-on-brand"
                  : "border-border-primary bg-surface-bg text-text-primary hover:bg-surface-hover"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Active Items List */}
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={36} />}
          title="Danh sách mua sắm trống"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {filter !== "checked" && activeItems.length > 0 && (
            <section
              aria-labelledby="active-list-heading"
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <h2
                  id="active-list-heading"
                  className="text-[18px] leading-[26px] font-semibold text-text-heading tracking-normal"
                >
                  Cần mua ({activeItems.length})
                </h2>
              </div>
              <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-[16px] border border-border-primary bg-surface-bg shadow-none">
                {activeItems.map((item) => {
                  const IconComp = getFoodIcon(item.name)
                  return (
                    <div
                      key={item.id}
                      className="group flex min-h-[64px] items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-surface-hover"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={false}
                          aria-label={`Đánh dấu đã mua ${item.name}`}
                          onClick={() => handleToggle(item.id)}
                          className="relative flex size-6 shrink-0 items-center justify-center rounded-[6px] after:absolute after:-inset-2.5 after:content-[''] border-2 border-border-control bg-surface-bg hover:border-brand-primary transition-colors cursor-pointer"
                        />
                        <span
                          aria-hidden="true"
                          className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-border-primary bg-surface-subtle text-text-primary"
                        >
                          <IconComp size={18} strokeWidth={2} />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-[15px] font-semibold text-text-heading">
                            {item.name}
                          </span>
                          <span className="text-[12px] text-text-secondary">
                            {item.quantity} {item.unit}
                            {item.category
                              ? ` · ${CATEGORY_LABELS[(item.category as keyof typeof CATEGORY_LABELS)] || item.category}`
                              : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          aria-label={`Xóa ${item.name}`}
                          onClick={() => handleDelete(item.id, item.name)}
                          className="flex size-11 md:size-8 items-center justify-center rounded-[8px] text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Checked Items List */}
          {filter !== "active" && checkedItems.length > 0 && (
            <section
              aria-labelledby="checked-list-heading"
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <h2
                  id="checked-list-heading"
                  className="text-[16px] leading-[24px] font-semibold text-text-secondary"
                >
                  Đã mua ({checkedItems.length})
                </h2>
              </div>
              <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-[16px] border border-border-primary bg-surface-bg shadow-none">
                {checkedItems.map((item) => {
                  const IconComp = getFoodIcon(item.name)
                  return (
                    <div
                      key={item.id}
                      className="group flex min-h-[64px] flex-col items-stretch gap-2 px-3.5 py-3 transition-colors hover:bg-surface-hover sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={true}
                          aria-label={`Đánh dấu chưa mua ${item.name}`}
                          onClick={() => handleToggle(item.id)}
                          className="relative flex size-6 shrink-0 items-center justify-center rounded-[6px] after:absolute after:-inset-2.5 after:content-[''] border-2 border-brand-primary bg-brand-primary text-on-brand cursor-pointer"
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border-primary bg-surface-subtle text-text-primary"
                        >
                          <IconComp size={16} strokeWidth={2} />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-[14px] font-medium text-text-primary line-through">
                            {item.name}
                          </span>
                          <span className="text-[12px] text-text-secondary">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                        {item.inventoryAddedAt ? (
                          <span className="text-xs font-medium text-status-ok">
                            Trong kho
                          </span>
                        ) : (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => setImportItemId(item.id)}
                            iconStart={<PackagePlus size={15} />}
                          >
                            Thêm vào kho
                          </Button>
                        )}
                        <button
                          type="button"
                          aria-label={`Xóa ${item.name}`}
                          onClick={() => handleDelete(item.id, item.name)}
                          className="flex size-11 md:size-8 items-center justify-center rounded-[8px] text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
          {filter === "active" && activeItems.length === 0 && (
            <EmptyState
              icon={<Check size={32} />}
              title="Đã mua hết danh sách"
            />
          )}
          {filter === "checked" && checkedItems.length === 0 && (
            <EmptyState
              icon={<ShoppingBag size={32} />}
              title="Chưa có món đã mua"
            />
          )}
        </div>
      )}

      {suggestions.length > 0 && (
        <section
          aria-labelledby="suggestions-heading"
          className="rounded-corner-lg border border-border-primary bg-surface-subtle p-4"
        >
          <h2
            id="suggestions-heading"
            className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-heading"
          >
            <Sparkles size={16} aria-hidden="true" />
            Gợi ý từ kho
          </h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 6).map((suggestion) => (
              <button
                key={suggestion.name}
                type="button"
                onClick={() => handleAddSuggestion(suggestion)}
                className="inline-flex min-h-11 md:min-h-10 items-center gap-2 rounded-corner-full border border-border-primary bg-surface-bg px-3 text-sm font-medium text-text-primary hover:border-brand-primary focus-visible:outline-2 focus-visible:outline-brand-primary"
              >
                <Plus
                  size={15}
                  className="text-brand-strong"
                  aria-hidden="true"
                />
                {suggestion.name}
                <span className="text-xs text-text-secondary">
                  {suggestion.quantity} {suggestion.unit}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <Modal
        isOpen={Boolean(importItem)}
        title={importItem ? `Thêm ${importItem.name} vào kho` : "Thêm vào kho"}
        onClose={() => setImportItemId(null)}
        size="compact"
      >
        {importItem && (
          <div className="flex flex-col gap-3">
            <div className="rounded-corner-md border border-border-primary bg-surface-subtle px-4 py-3 text-sm text-text-primary">
              {importItem.quantity} {importItem.unit}
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
              onClick={() => setImportItemId(null)}
            >
              Để sau
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ShoppingView
