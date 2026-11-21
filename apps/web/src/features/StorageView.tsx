import { useEffect, useMemo, useState } from "react"

import type { Dispatch, State, Category } from "../store/appStore"

import { statusOf, CATEGORIES } from "../store/appStore"

import Button from "../components/ui/Button"

import Card from "../components/ui/Card"

import EmptyState from "../components/ui/EmptyState"

import {
  Archive,
  Bell,
  Boxes,
  CircleAlert,
  Package,
  Plus,
  Refrigerator,
  Search,
  SearchX,
  Snowflake,
  X,
} from "lucide-react"

import InputField from "../components/ui/InputField"

import Modal from "../components/ui/Modal"

import LocationManagerModal from "../components/ui/LocationManagerModal"

import PageHeader from "../components/ui/PageHeader"

import FoodCard from "./FoodCard"
import { FilterDropdown } from "../components/ui/FilterChips"

export interface LocationStatItem {
  total: number

  attention: number
}

interface StorageCategoryFilter {
  v: Category | "all"

  label: string
}

export function getLocationIcon(loc: string) {
  const l = loc.toLowerCase()

  if (l.includes("mát") || l.includes("tủ lạnh")) return Refrigerator

  if (l.includes("đông") || l.includes("băng") || l.includes("đá"))
    return Snowflake

  if (
    l.includes("bếp") ||
    l.includes("kệ") ||
    l.includes("tủ") ||
    l.includes("kho")
  )
    return Archive

  return Package
}

export interface StoragePreferences {
  preferred_location?: string

  category?: Category | "all"

  locations?: string[]

  new_location?: string
}

export interface StorageViewProps {
  state: State

  dispatch: Dispatch

  onOpenDetail: (id: string) => void

  onAdd: () => void

  initialLocation?: string

  initialCategory?: Category | "all"

  onNavigateAttention?: () => void

  onFilterChange?: (location: string, category: Category | "all") => void

  isLive?: boolean

  onAddLocation?: (name: string) => Promise<void> | void

  onRenameLocation?: (oldName: string, newName: string) => Promise<void> | void

  onRemoveLocation?: (name: string) => Promise<void> | void

  onSavePreferences?: (preferences: StoragePreferences) => Promise<void> | void
}

function getStorage(): Storage | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage
  } catch {}

  return null
}

export default function StorageView({
  state,

  dispatch,

  onOpenDetail,

  onAdd,

  initialLocation,

  initialCategory,

  onNavigateAttention,

  onFilterChange,

  isLive: isLiveProp,

  onAddLocation,

  onRenameLocation,

  onRemoveLocation,

  onSavePreferences,
}: StorageViewProps) {
  const isLive = isLiveProp ?? state.mode === "account"

  const storagePrefKey = `expiry_storage_preferences_${state.userId || "demo"}`

  const userPrefKey = `expiry_user_preferences_${state.userId || "demo"}`

  const [selectedLocation, setSelectedLocation] = useState<string>(
    initialLocation || "all",
  )

  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    initialCategory || "all",
  )

  useEffect(() => {
    if (initialLocation !== undefined) setSelectedLocation(initialLocation)
  }, [initialLocation])

  useEffect(() => {
    if (initialCategory !== undefined) setSelectedCategory(initialCategory)
  }, [initialCategory])

  useEffect(() => {
    if (initialLocation === undefined || initialCategory === undefined) {
      try {
        const saved =
          getStorage()?.getItem(storagePrefKey) ||
          getStorage()?.getItem("expiry_storage_preferences")

        if (saved) {
          const parsed = JSON.parse(saved)

          if (
            initialLocation === undefined &&
            parsed.location &&
            (parsed.location === "all" ||
              state.locations.includes(parsed.location) ||
              parsed.location === "Khác")
          ) {
            setSelectedLocation(parsed.location)
          }

          if (initialCategory === undefined && parsed.category) {
            setSelectedCategory(parsed.category)
          }
        }
      } catch {}
    }
  }, [storagePrefKey])

  const handleLocationChange = (loc: string) => {
    setSelectedLocation(loc)

    onFilterChange?.(loc, selectedCategory)

    try {
      getStorage()?.setItem(
        storagePrefKey,

        JSON.stringify({ location: loc, category: selectedCategory }),
      )
    } catch {}

    onSavePreferences?.({ preferred_location: loc, category: selectedCategory })
  }

  const handleCategoryChange = (cat: Category | "all") => {
    setSelectedCategory(cat)

    onFilterChange?.(selectedLocation, cat)

    try {
      getStorage()?.setItem(
        storagePrefKey,

        JSON.stringify({ location: selectedLocation, category: cat }),
      )
    } catch {}

    onSavePreferences?.({ preferred_location: selectedLocation, category: cat })
  }

  const [query, setQuery] = useState("")

  const [onlySoon, setOnlySoon] = useState(false)

  const toggleOnlySoon = () => setOnlySoon((current) => !current)

  const [newLocModal, setNewLocModal] = useState(false)

  const [manageLocModal, setManageLocModal] = useState(false)

  const [newLocName, setNewLocName] = useState("")

  const remindDays = state.settings.remindDays

  // Active items

  const activeFoods = useMemo(
    () => state.foods.filter((f) => !f.deletedAt && !f.finishedAt),

    [state.foods],
  )

  const expiredFoods = useMemo(
    () => activeFoods.filter((f) => statusOf(f, remindDays) === "expired"),
    [activeFoods, remindDays],
  )

  const inventoryFoods = useMemo(
    () => activeFoods.filter((f) => statusOf(f, remindDays) !== "expired"),
    [activeFoods, remindDays],
  )

  const soonCount = useMemo(
    () =>
      inventoryFoods.filter((f) => statusOf(f, remindDays) === "soon").length,
    [inventoryFoods, remindDays],
  )

  // Metrics per location

  const locationStats = useMemo(() => {
    const stats: Record<string, LocationStatItem> = {}

    for (const loc of state.locations) {
      stats[loc] = { total: 0, attention: 0 }
    }

    stats["Khác"] = { total: 0, attention: 0 }

    for (const f of inventoryFoods) {
      const locKey =
        f.location && state.locations.includes(f.location) ? f.location : "Khác"

      if (!stats[locKey]) stats[locKey] = { total: 0, attention: 0 }

      stats[locKey].total++

      const st = statusOf(f, remindDays)

      if (st === "soon") {
        stats[locKey].attention++
      }
    }

    return stats
  }, [inventoryFoods, state.locations, remindDays])

  // Filtered food list

  const filteredFoods = useMemo(() => {
    return inventoryFoods
      .filter((f) => {
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

        // Only soon-to-expire toggle

        if (onlySoon && statusOf(f, remindDays) !== "soon") {
          return false
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
      .sort((a, b) => {
        const priority = (food: typeof inventoryFoods[number]) => {
          const status = statusOf(food, remindDays)
          return status === "soon" ? 0 : status === "ok" ? 1 : 2
        }

        return (
          priority(a) - priority(b) ||
          (a.expDate ?? "9999").localeCompare(b.expDate ?? "9999")
        )
      })
  }, [
    inventoryFoods,

    selectedLocation,

    selectedCategory,

    onlySoon,

    query,

    remindDays,

    state.locations,
  ])

  const handleAddLocation = async () => {
    const name = newLocName.trim()

    if (!name) return

    if (!state.locations.includes(name)) {
      dispatch({ type: "addLocation", name })
    }

    if (onAddLocation) {
      await onAddLocation(name)
    }

    try {
      const userPrefs = JSON.parse(
        getStorage()?.getItem(userPrefKey) ||
          getStorage()?.getItem("expiry_user_preferences") ||
          "{}",
      )

      const locs = Array.from(
        new Set([...(userPrefs.locations || state.locations), name]),
      )

      getStorage()?.setItem(
        userPrefKey,

        JSON.stringify({ ...userPrefs, locations: locs }),
      )
    } catch {}

    onSavePreferences?.({ new_location: name })

    setSelectedLocation(name)

    setNewLocName("")

    setNewLocModal(false)
  }

  const categoryOptions: StorageCategoryFilter[] = [
    { v: "all", label: "Tất cả nhóm" },

    ...CATEGORIES.map((c) => ({ v: c.value, label: c.label })),
  ]

  return (
    <div className="storage-view flex flex-col gap-4 w-full">
      <PageHeader
        title="Nơi lưu trữ"
        actions={
          <div className="flex items-center gap-2">
            {isLive && (
              <span
                data-testid="live-storage-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20"
              >
                <span className="size-2 rounded-full bg-brand-primary animate-pulse" />
                Trực tuyến
              </span>
            )}
            <Button
              variant="secondary"
              size="small"
              iconStart={<Boxes size={16} />}
              onClick={() => setManageLocModal(true)}
            >
              Quản lý vị trí
            </Button>
          </div>
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
            prefix={<Search size={16} className="text-text-secondary" />}
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

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {expiredFoods.length > 0 && onNavigateAttention && (
            <Button
              variant="danger"
              size="small"
              iconStart={<Bell size={16} />}
              onClick={onNavigateAttention}
              aria-label={`Cần chú ý, ${expiredFoods.length} món quá hạn`}
            >
              Cần chú ý ({expiredFoods.length})
            </Button>
          )}
          <button
            type="button"
            role="switch"
            aria-checked={onlySoon}
            aria-label="Chỉ hiện sắp hết hạn"
            onClick={toggleOnlySoon}
            className={`inline-flex min-h-11 items-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-corner-md text-xs font-semibold border transition-[color,background-color,border-color,box-shadow] cursor-pointer shrink-0 ${
              onlySoon
                ? "bg-status-soon-bg border-status-soon text-status-soon shadow-xs ring-1 ring-status-soon/30"
                : "bg-surface-bg border-border-primary text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            <CircleAlert
              size={16}
              className={onlySoon ? "text-status-soon" : "text-text-secondary"}
            />
            <span className="sm:hidden">Sắp hết hạn</span>
            <span className="hidden sm:inline">Chỉ hiện sắp hết hạn</span>
            {onlySoon && (
              <span className="size-1.5 rounded-full bg-status-soon" />
            )}
            {soonCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[12px] font-semibold ${
                  onlySoon
                    ? "bg-status-soon text-white"
                    : "bg-status-soon-bg text-status-soon"
                }`}
              >
                {soonCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Storage Hub Bento Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <div>
            <h2 className="text-sm font-semibold text-text-heading flex items-center gap-2 tracking-normal">
              <Boxes size={16} className="text-brand-primary" />
              <span>Khu vực bảo quản</span>
            </h2>
          </div>
          <span className="text-xs text-text-secondary">
            {state.locations.length} vị trí
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card: Tất cả */}
          <button
            type="button"
            aria-pressed={selectedLocation === "all"}
            onClick={() => handleLocationChange("all")}
            className={`storage-location-card flex flex-col justify-between p-3 rounded-corner-md border text-left transition-[color,background-color,border-color,box-shadow] cursor-pointer ${
              selectedLocation === "all"
                ? "border-brand-primary bg-brand-primary/5 shadow-xs ring-2 ring-brand-primary/20"
                : "border-border-primary/80 bg-surface-bg hover:border-brand-primary/40 hover:bg-surface-hover"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-8 h-8 rounded-corner-md flex items-center justify-center bg-brand-primary/10 text-brand-primary">
                <Boxes size={16} />
              </div>
              <div className="flex items-center gap-1">
                {soonCount > 0 && (
                  <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full text-[12px] font-semibold bg-status-soon-bg text-status-soon">
                    {soonCount} sắp HSD
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-heading truncate">
                Tất cả kho
              </p>
              <p className="text-[12px] text-text-secondary mt-0.5">
                {inventoryFoods.length} món
              </p>
            </div>
          </button>

          {/* Cards for each location */}
          {state.locations.map((loc) => {
            const stats = locationStats[loc] || {
              total: 0,

              attention: 0,
            }

            const isSelected = selectedLocation === loc

            const LocIcon = getLocationIcon(loc)

            const iconTone =
              loc.toLowerCase().includes("mát") ||
              loc.toLowerCase().includes("tủ lạnh")
                ? "bg-category-beverage-bg text-category-beverage"
                : loc.toLowerCase().includes("đông")
                  ? "bg-category-prepared-bg text-category-prepared"
                  : loc.toLowerCase().includes("bếp") ||
                      loc.toLowerCase().includes("kệ")
                    ? "bg-category-dairy-bg text-category-dairy"
                    : "bg-surface-subtle text-text-secondary"

            return (
              <button
                key={loc}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleLocationChange(loc)}
                className={`storage-location-card flex flex-col justify-between p-3 rounded-corner-md border text-left transition-[color,background-color,border-color,box-shadow] cursor-pointer ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5 shadow-xs ring-2 ring-brand-primary/20"
                    : "border-border-primary/80 bg-surface-bg hover:border-brand-primary/40 hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`w-8 h-8 rounded-corner-md flex items-center justify-center ${iconTone}`}
                  >
                    <LocIcon size={16} />
                  </div>
                  <div className="flex items-center gap-1">
                    {stats.attention > 0 && (
                      <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-full border border-status-soon/30 bg-status-soon-bg text-[12px] font-medium text-status-soon">
                        {stats.attention} sắp HSD
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-heading truncate">
                    {loc}
                  </p>
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    {stats.total} món
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Horizontal Category Filter Chips */}
      <div className="hidden sm:block">
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
                onClick={() => handleCategoryChange(cat.v)}
                className={`min-h-11 md:min-h-8 shrink-0 rounded-corner-full px-3.5 py-1 text-xs font-semibold transition-[color,background-color,border-color,box-shadow] cursor-pointer select-none outline-none focus-visible:outline-2 focus-visible:outline-brand-primary ${
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
        <div className="flex items-center justify-between gap-3 mb-3 sm:items-start">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-heading tracking-normal">
              Danh sách món (
              {selectedLocation === "all" ? "Tất cả vị trí" : selectedLocation})
              {selectedCategory !== "all" &&
                ` · ${categoryOptions.find((c) => c.v === selectedCategory)?.label}`}
            </h3>
            <span className="mt-0.5 block text-xs text-text-secondary sm:hidden">
              {filteredFoods.length} kết quả
            </span>
          </div>
          <div className="min-w-0 shrink-0 sm:hidden">
            <FilterDropdown<Category | "all">
              label="Danh mục"
              value={selectedCategory}
              onChange={handleCategoryChange}
              options={categoryOptions}
            />
          </div>
          <span className="hidden shrink-0 pt-0.5 text-xs text-text-secondary sm:inline">
            {filteredFoods.length} kết quả
          </span>
        </div>

        {filteredFoods.length === 0 ? (
          <EmptyState
            className="storage-empty-state"
            icon={<SearchX size={32} />}
            title={
              query || onlySoon || selectedCategory !== "all"
                ? "Không tìm thấy thực phẩm"
                : selectedLocation === "all"
                  ? inventoryFoods.length === 0 && expiredFoods.length > 0
                    ? "Không có món còn hạn"
                    : "Chưa có thực phẩm trong kho"
                  : `Chưa có món tại ${selectedLocation}`
            }
            action={
              inventoryFoods.length === 0 &&
              expiredFoods.length > 0 &&
              onNavigateAttention ? (
                <Button
                  variant="danger"
                  size="small"
                  onClick={onNavigateAttention}
                >
                  Mở món cần chú ý
                </Button>
              ) : query || onlySoon || selectedCategory !== "all" ? (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setQuery("")
                    setOnlySoon(false)
                    handleCategoryChange("all")
                  }}
                >
                  Xóa bộ lọc
                </Button>
              ) : (
                <Button variant="primary" size="small" onClick={onAdd}>
                  Thêm thực phẩm
                </Button>
              )
            }
          />
        ) : (
          <Card className="divide-y divide-border-primary/50 overflow-hidden p-0">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                remindDays={remindDays}
                variant="grouped"
                onOpen={() => onOpenDetail(food.id)}
              />
            ))}
          </Card>
        )}
      </div>

      {/* Modal: Quản lý nơi bảo quản */}
      <LocationManagerModal
        isOpen={manageLocModal}
        onClose={() => setManageLocModal(false)}
        state={state}
        dispatch={dispatch}
        onAddLocation={onAddLocation}
        onRenameLocation={onRenameLocation}
        onRemoveLocation={onRemoveLocation}
      />

      {/* Modal: Thêm vị trí mới */}
      {newLocModal && (
        <Modal
          title="Thêm nơi bảo quản"
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
