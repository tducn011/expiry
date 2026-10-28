import { useMemo, useState } from "react"
import type { Dispatch, State, Category } from "../store/appStore"
import { statusOf, CATEGORIES } from "../store/appStore"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import EmptyState from "../components/ui/EmptyState"
import {
  Boxes,
  CircleAlert,
  Plus,
  Search,
  SearchX,
  X,
} from "../components/ui/Icon"
import InputField from "../components/ui/InputField"
import Modal from "../components/ui/Modal"
import PageHeader from "../components/ui/PageHeader"
import FoodCard from "./FoodCard"

interface StorageCategoryFilter {
  v: Category | "all"
  label: string
}

export interface StorageViewProps {
  state: State
  dispatch: Dispatch
  onOpenDetail: (id: string) => void
  onAdd: () => void
}

export default function StorageView({
  state,
  dispatch,
  onOpenDetail,
  onAdd,
}: StorageViewProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    "all",
  )
  const [query, setQuery] = useState("")
  const [onlyAttention, setOnlyAttention] = useState(false)
  const [newLocModal, setNewLocModal] = useState(false)
  const [newLocName, setNewLocName] = useState("")

  const remindDays = state.settings.remindDays

  // Active items
  const activeFoods = useMemo(
    () => state.foods.filter((f) => !f.deletedAt && !f.finishedAt),
    [state.foods],
  )

  // Metrics per location
  const locationStats = useMemo(() => {
    const stats: Record<string, {
      total: number
      attention: number
      expired: number
    }> = {}
    for (const loc of state.locations) {
      stats[loc] = { total: 0, attention: 0, expired: 0 }
    }
    stats["Khác"] = { total: 0, attention: 0, expired: 0 }

    for (const f of activeFoods) {
      const locKey =
        f.location && state.locations.includes(f.location) ? f.location : "Khác"
      if (!stats[locKey]) stats[locKey] = { total: 0, attention: 0, expired: 0 }
      stats[locKey].total++
      const st = statusOf(f, remindDays)
      if (st === "expired") {
        stats[locKey].expired++
        stats[locKey].attention++
      } else if (st === "soon") {
        stats[locKey].attention++
      }
    }
    return stats
  }, [activeFoods, state.locations, remindDays])

  // Total attention items
  const totalAttentionCount = useMemo(() => {
    return activeFoods.filter((f) => {
      const st = statusOf(f, remindDays)
      return st === "expired" || st === "soon"
    }).length
  }, [activeFoods, remindDays])

  // Filtered food list
  const filteredFoods = useMemo(() => {
    return activeFoods.filter((f) => {
      // Location filter
      if (selectedLocation !== "all") {
        if (selectedLocation === "Khác") {
          if (f.location && state.locations.includes(f.location)) return false
        } else if (f.location !== selectedLocation) {
          return false
        }
      }
      // Category filter
      if (selectedCategory !== "all") {
        if (f.category !== selectedCategory) return false
      }
      // Only attention toggle
      if (onlyAttention) {
        const st = statusOf(f, remindDays)
        if (st !== "expired" && st !== "soon") return false
      }
      // Search query
      if (query.trim()) {
        const q = query.trim().toLowerCase()
        const matchName = f.name.toLowerCase().includes(q)
        const matchLoc = (f.location || "").toLowerCase().includes(q)
        if (!matchName && !matchLoc) return false
      }
      return true
    })
  }, [
    activeFoods,
    selectedLocation,
    selectedCategory,
    onlyAttention,
    query,
    remindDays,
    state.locations,
  ])

  const handleAddLocation = () => {
    const name = newLocName.trim()
    if (!name) return
    if (!state.locations.includes(name)) {
      dispatch({ type: "addLocation", name })
    }
    setSelectedLocation(name)
    setNewLocName("")
    setNewLocModal(false)
  }

  const categoryOptions: StorageCategoryFilter[] = [
    { v: "all", label: "Tất cả nhóm" },
    ...CATEGORIES.map((c) => ({ v: c.value, label: c.label })),
  ]

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Nơi lưu trữ"
        subtitle="Tìm duyệt nhanh theo không gian bảo quản & nhóm thực phẩm"
        actions={
          <Button
            variant="primary"
            size="small"
            iconStart={<Plus size={16} />}
            onClick={() => setNewLocModal(true)}
          >
            Thêm vị trí
          </Button>
        }
      />

      {/* Search & Quick Toggles */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <InputField
            placeholder="Tìm nhanh theo tên hoặc vị trí..."
            value={query}
            onChange={(val: string) => setQuery(val)}
            className="w-full"
            prefix={<Search size={18} className="text-text-secondary" />}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOnlyAttention((v) => !v)}
          className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-corner-md text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
            onlyAttention
              ? "bg-danger-subtle border-danger text-danger shadow-xs"
              : "bg-surface-bg border-border-primary text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          }`}
        >
          <CircleAlert
            size={16}
            className={onlyAttention ? "text-danger" : "text-text-secondary"}
          />
          <span>Chỉ hiện cần chú ý</span>
          {totalAttentionCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                onlyAttention
                  ? "bg-danger text-white"
                  : "bg-danger/20 text-danger"
              }`}
            >
              {totalAttentionCount}
            </span>
          )}
        </button>
      </div>

      {/* Storage Hub Bento Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Boxes size={18} className="text-brand-primary" />
            <span>Khu vực bảo quản</span>
          </h2>
          <span className="text-xs text-text-secondary">
            {state.locations.length} vị trí khả dụng
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card: Tất cả */}
          <button
            type="button"
            onClick={() => setSelectedLocation("all")}
            className={`flex flex-col justify-between p-3.5 rounded-corner-md border text-left transition-all cursor-pointer ${
              selectedLocation === "all"
                ? "border-brand-primary bg-brand-primary/5 shadow-xs ring-2 ring-brand-primary/20"
                : "border-border-primary/80 bg-surface-bg hover:border-brand-primary/40 hover:bg-surface-hover"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xl">🏠</span>
              {totalAttentionCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-danger text-white">
                  {totalAttentionCount} cần ăn
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary truncate">
                Tất cả kho
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {activeFoods.length} món đồ
              </p>
            </div>
          </button>

          {/* Cards for each location */}
          {state.locations.map((loc) => {
            const stats = locationStats[loc] || {
              total: 0,
              attention: 0,
              expired: 0,
            }
            const isSelected = selectedLocation === loc
            const iconEmoji =
              loc.toLowerCase().includes("mát") ||
              loc.toLowerCase().includes("tủ lạnh")
                ? "❄️"
                : loc.toLowerCase().includes("đông")
                  ? "🧊"
                  : loc.toLowerCase().includes("bếp") ||
                      loc.toLowerCase().includes("kệ")
                    ? "🥫"
                    : "📦"

            return (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                className={`flex flex-col justify-between p-3.5 rounded-corner-md border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5 shadow-xs ring-2 ring-brand-primary/20"
                    : "border-border-primary/80 bg-surface-bg hover:border-brand-primary/40 hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xl">{iconEmoji}</span>
                  {stats.attention > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        stats.expired > 0
                          ? "bg-danger text-white"
                          : "bg-warning text-black"
                      }`}
                    >
                      {stats.attention} chú ý
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary truncate">
                    {loc}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {stats.total} món
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Horizontal Category Filter Chips */}
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-2">
          Phân loại theo nhóm:
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryOptions.map((cat) => {
            const isActive = selectedCategory === cat.v
            return (
              <button
                key={cat.v}
                type="button"
                onClick={() => setSelectedCategory(cat.v)}
                className={`min-h-8 shrink-0 rounded-corner-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer select-none outline-none focus-visible:outline-2 focus-visible:outline-brand-primary ${
                  isActive
                    ? "bg-brand-primary text-white shadow-xs"
                    : "bg-surface-bg border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Food Items List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-text-primary">
            Danh sách món (
            {selectedLocation === "all" ? "Tất cả vị trí" : selectedLocation})
            {selectedCategory !== "all" &&
              ` · ${categoryOptions.find((c) => c.v === selectedCategory)?.label}`}
          </h3>
          <span className="text-xs text-text-secondary">
            {filteredFoods.length} kết quả
          </span>
        </div>

        {filteredFoods.length === 0 ? (
          <EmptyState
            icon={<SearchX size={36} />}
            title="Không tìm thấy thực phẩm"
            text={
              query || onlyAttention || selectedCategory !== "all"
                ? "Không có món nào khớp với bộ lọc hiện tại. Hãy thử chọn nhóm khác hoặc xóa tìm kiếm."
                : `Vị trí "${selectedLocation}" hiện chưa có món nào.`
            }
            action={
              <Button variant="primary" size="small" onClick={onAdd}>
                + Thêm món vào vị trí này
              </Button>
            }
          />
        ) : (
          <Card className="divide-y divide-border-primary/50 overflow-hidden p-0">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                remindDays={remindDays}
                onOpen={() => onOpenDetail(food.id)}
              />
            ))}
          </Card>
        )}
      </div>

      {/* Modal: Thêm vị trí mới */}
      {newLocModal && (
        <Modal
          title="Thêm nơi bảo quản"
          description="Đặt tên cho khu vực lưu trữ thực phẩm trong nhà (ví dụ: Tủ gia vị, Ngăn rau...)"
          onClose={() => {
            setNewLocName("")
            setNewLocModal(false)
          }}
          footer={
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant="subtle"
                onClick={() => {
                  setNewLocName("")
                  setNewLocModal(false)
                }}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                disabled={!newLocName.trim()}
                onClick={handleAddLocation}
              >
                Lưu vị trí
              </Button>
            </div>
          }
        >
          <div className="py-2">
            <InputField
              label="Tên nơi bảo quản"
              placeholder="VD: Kệ đồ khô, Tủ mát mini..."
              value={newLocName}
              onChange={(val: string) => setNewLocName(val)}
              autoFocus
            />
          </div>
        </Modal>
      )}
    </div>
  )
}
