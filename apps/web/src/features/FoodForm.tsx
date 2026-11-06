import { useRef, useState } from "react"

import { api } from "../api/client"

import { playBeep } from "../lib/barcode"

import type { Category, Food, Unit } from "../store/appStore"

import {
  CATEGORIES,
  today,
  UNITS,
  addDays,
  formatDate,
} from "../store/appStore"

import Button from "../components/ui/Button"

import Card from "../components/ui/Card"

import FieldError from "../components/ui/FieldError"

import {
  Barcode,
  Camera,
  Plus,
  ScanText,
  X,
  Bell,
  CalendarClock,
} from "../components/ui/Icon"

import InputField from "../components/ui/InputField"

import Modal from "../components/ui/Modal"

import SectionTitle from "../components/ui/SectionTitle"

import SelectField from "../components/ui/SelectField"

import GoogleReminderPicker, { formatGoogleDate } from "./GoogleReminderPicker"

export interface Draft {
  id?: string

  name: string

  quantity: string

  unit: Unit | ""

  category: Category | ""

  mfgDate: string

  opened_on?: string

  expDate: string

  location: string

  barcode?: string

  reviewAt?: string
}

export const emptyDraft = (): Draft => ({
  name: "",

  quantity: "1",

  unit: "cái",

  category: "other",

  mfgDate: "",

  opened_on: "",

  expDate: "",

  location: "",

  reviewAt: "",
})

export const draftFrom = (f: Food, keepQty = true): Draft => ({
  id: f.id,

  name: f.name,

  quantity: keepQty ? String(f.quantity) : "",

  unit: f.unit,

  category: f.category ?? "other",

  mfgDate: f.mfgDate ?? "",

  opened_on: f.opened_on ?? "",

  expDate: f.expDate ?? "",

  location: f.location ?? "",

  barcode: f.barcode ?? undefined,

  reviewAt: f.reviewAt ?? "",
})

export type Errors = Partial<Record<"name" | "quantity" | "unit" | "mfgDate" | "opened_on" | "expDate" | "save", string>>

const validDate = (v: string) =>
  !v ||
  (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v + "T00:00:00").getTime()))

export function validate(d: Draft): Errors {
  const e: Errors = {}

  if (!d.name.trim()) e.name = "Vui lòng nhập tên thực phẩm."

  const q = d.quantity.trim().replace(",", ".")

  if (!q) e.quantity = "Vui lòng nhập số lượng."
  else if (!/^\d+(\.\d{1,3})?$/.test(q))
    e.quantity = "Chỉ nhập số, ví dụ 2 hoặc 0.5."
  else if (Number(q) <= 0) e.quantity = "Số lượng phải lớn hơn 0."

  if (!d.unit) e.unit = "Vui lòng chọn đơn vị."

  if (!validDate(d.mfgDate)) e.mfgDate = "Ngày không hợp lệ."

  if (!validDate(d.opened_on ?? "")) e.opened_on = "Ngày không hợp lệ."

  if (!validDate(d.expDate)) e.expDate = "Ngày không hợp lệ."

  if (
    !e.mfgDate &&
    !e.expDate &&
    d.mfgDate &&
    d.expDate &&
    d.expDate < d.mfgDate
  )
    e.expDate = "Hạn sử dụng không thể trước ngày sản xuất."

  if (
    !e.opened_on &&
    !e.expDate &&
    d.opened_on &&
    d.expDate &&
    d.expDate < d.opened_on
  )
    e.expDate = "Hạn sử dụng không thể trước ngày mở bao bì."

  return e
}

export type FormMode = "manual" | "ocr" | "edit" | "readd"

const titles: Record<FormMode, string> = {
  manual: "Nhập thực phẩm",

  ocr: "Kiểm tra thông tin",

  edit: "Sửa thông tin",

  readd: "Thêm lại thực phẩm",
}

export function FoodForm({
  mode,

  initial,

  capturedImage,

  locations,

  onAddLocation,

  onSubmit,

  onCancel,
}: {
  mode: FormMode

  initial: Draft

  capturedImage?: string | string[]

  locations: string[]

  onAddLocation: (n: string) => void

  onSubmit: (d: Draft) => Promise<void>

  onCancel: (dirty: boolean) => void
}) {
  const [d, setD] = useState<Draft>(initial)

  const [showReminderPicker, setShowReminderPicker] = useState<boolean>(
    () => !!initial.reviewAt,
  )

  const [capturedImages, setCapturedImages] = useState<string[]>(() =>
    Array.isArray(capturedImage)
      ? capturedImage
      : capturedImage
        ? [capturedImage]
        : [],
  )

  const [selectedImgIdx, setSelectedImgIdx] = useState(0)

  const currentImg = capturedImages[selectedImgIdx] || capturedImages[0]

  const [scanningHsd, setScanningHsd] = useState(false)

  const scanHsdInputRef = useRef<HTMLInputElement>(null)

  const handleScanHsdPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    e.target.value = ""

    setScanningHsd(true)

    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader()

        r.onload = () => resolve(String(r.result))

        r.readAsDataURL(file)
      })

      const result = await api.scan(file)

      const cand = result.candidates

      const exp = cand.expiry_date?.value || ""

      const mfg = cand.manufactured_date?.value || ""

      if (exp) {
        setD((p) => ({ ...p, expDate: exp, mfgDate: mfg || p.mfgDate }))

        setErrors((p) => ({ ...p, expDate: undefined, mfgDate: undefined }))
      } else if (mfg) {
        setD((p) => ({ ...p, mfgDate: mfg }))

        setErrors((p) => ({ ...p, mfgDate: undefined }))
      }

      setCapturedImages((prev) => [...prev, dataUrl])

      setSelectedImgIdx(capturedImages.length)

      playBeep()
    } catch {
      setErrors((p) => ({
        ...p,

        expDate:
          "Chưa đọc được ngày từ ảnh này, vui lòng nhập tay hoặc chụp lại gần hơn.",
      }))
    } finally {
      setScanningHsd(false)
    }
  }

  const [errors, setErrors] = useState<Errors>({})

  const [saving, setSaving] = useState(false)

  const [newLocModal, setNewLocModal] = useState(false)

  const [newLocName, setNewLocName] = useState("")

  const submitting = useRef(false)

  const dirty = JSON.stringify(d) !== JSON.stringify(initial)

  const set = (k: keyof Draft) => (v: string) => {
    setD((p) => ({ ...p, [k]: v }))

    setErrors((p) => ({ ...p, [k]: undefined, save: undefined }))
  }

  async function save() {
    if (submitting.current) return

    const e = validate(d)

    setErrors(e)

    if (Object.keys(e).length) return

    submitting.current = true

    setSaving(true)

    try {
      await onSubmit({ ...d, quantity: d.quantity.replace(",", ".") })
    } catch {
      setErrors({
        save: "Chưa lưu được. Thông tin của bạn vẫn được giữ, hãy thử lại.",
      })
    } finally {
      submitting.current = false

      setSaving(false)
    }
  }

  const expPast = d.expDate && !errors.expDate && d.expDate < today()

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pt-2">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          {titles[mode]}
        </h1>
        <button
          type="button"
          onClick={() => onCancel(dirty)}
          aria-label="Hủy bỏ"
          className="p-1 rounded-corner-md text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      {mode === "ocr" && (
        <Card className="flex items-start gap-4 border-brand-primary/30 bg-brand-tertiary/60">
          {currentImg ? (
            <div className="flex flex-col gap-1.5 shrink-0 items-center">
              <img
                src={currentImg}
                alt="Ảnh nhãn đã chụp"
                className="size-20 shrink-0 rounded-corner-md object-cover border border-border-primary/50 shadow-xs"
              />
              {capturedImages.length > 1 && (
                <div className="flex items-center gap-1 justify-center pt-0.5">
                  {capturedImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImgIdx(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === selectedImgIdx
                          ? "bg-brand-primary w-3.5"
                          : "bg-border-secondary hover:bg-text-secondary w-1.5"
                      }`}
                      aria-label={`Xem ảnh ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-corner-md bg-brand-primary text-white">
              <ScanText size={24} aria-hidden="true" />
            </div>
          )}
          <div className="flex flex-col gap-1 text-xs md:text-sm">
            <p className="font-semibold text-text-primary">
              Đối chiếu với ảnh nhãn
            </p>
            <p className="text-text-secondary leading-relaxed">
              {d.expDate || d.name
                ? "Đã tự động điền thông tin trích xuất từ nhãn. Vui lòng đối chiếu với ảnh bên cạnh trước khi lưu."
                : "Chưa nhận dạng được ngày tự động trên góc chụp này (thường do chữ in kim ma trận điểm hoặc góc chụp). Hãy nhìn ảnh bên cạnh để đối chiếu nhập NSX, HSD."}
            </p>
          </div>
        </Card>
      )}

      {mode === "readd" && (
        <p className="text-xs md:text-sm text-text-secondary">
          Hãy xác nhận lại số lượng và hạn sử dụng của lần mua mới này.
        </p>
      )}

      <Card className="flex flex-col gap-4">
        <div>
          <InputField
            label="Tên thực phẩm *"
            placeholder="Ví dụ: Sữa tươi, Trứng gà, Rau cải..."
            value={d.name}
            onChange={set("name")}
            aria-invalid={!!errors.name}
            aria-describedby="e-name"
            autoFocus
          />
          {d.barcode && (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
              <Barcode size={14} className="text-brand-primary shrink-0" />
              <span>
                Mã vạch:{" "}
                <strong className="font-mono text-text-primary">
                  {d.barcode}
                </strong>
              </span>
            </div>
          )}
          <FieldError id="e-name" msg={errors.name} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <InputField
              label="Số lượng *"
              inputMode="decimal"
              value={d.quantity}
              onChange={set("quantity")}
              aria-invalid={!!errors.quantity}
              aria-describedby="e-qty"
            />
            <FieldError id="e-qty" msg={errors.quantity} />
          </div>
          <div>
            <SelectField
              label="Đơn vị *"
              options={UNITS.map((u) => ({ value: u, label: u }))}
              value={d.unit}
              onChange={set("unit")}
            />
            <FieldError id="e-unit" msg={errors.unit} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-text-primary block mb-1.5">
              Danh mục
            </label>
            <SelectField
              options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
              value={d.category}
              onChange={set("category")}
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-sm font-semibold text-text-primary">
                Nơi bảo quản
              </label>
              <button
                type="button"
                onClick={() => setNewLocModal(true)}
                className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
              >
                + Thêm vị trí mới
              </button>
            </div>
            <SelectField
              options={[
                { value: "", label: "Chọn nơi bảo quản..." },

                ...locations.map((loc) => ({ value: loc, label: loc })),
              ]}
              value={d.location}
              onChange={set("location")}
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <SectionTitle>Ngày trên bao bì</SectionTitle>
          <Button
            type="button"
            size="sm"
            variant="neutral"
            iconStart={<Camera size={16} />}
            loading={scanningHsd}
            onClick={() => scanHsdInputRef.current?.click()}
          >
            {scanningHsd ? "Đang đọc HSD..." : "Quét HSD (Đáy lon / Nắp)"}
          </Button>
          <input
            ref={scanHsdInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleScanHsdPhoto}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <InputField
              label="Ngày sản xuất (NSX)"
              type="date"
              value={d.mfgDate}
              onChange={set("mfgDate")}
              aria-describedby="e-mfg"
            />
            <FieldError id="e-mfg" msg={errors.mfgDate} />
            {/* Icon tùy chỉnh nhắc nhở ngay dưới NSX */}
            <div className="mt-1.5 flex items-center">
              <button
                type="button"
                onClick={() => setShowReminderPicker((v) => !v)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
                  d.reviewAt
                    ? "bg-[#0b57d0]/10 text-[#0b57d0] dark:text-blue-400 border border-[#0b57d0]/30 hover:bg-[#0b57d0]/20 font-semibold"
                    : showReminderPicker
                      ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/40 shadow-xs"
                      : "text-text-secondary hover:text-brand-primary hover:bg-surface-secondary border border-transparent hover:border-border-primary/40"
                }`}
                title="Tùy chỉnh nhắc nhở"
                aria-expanded={showReminderPicker}
              >
                <Bell
                  size={14}
                  className={
                    d.reviewAt
                      ? "text-[#0b57d0] dark:text-blue-400"
                      : "text-text-secondary"
                  }
                />
                <span>
                  {d.reviewAt
                    ? `Nhắc lại: ${formatGoogleDate(d.reviewAt)}`
                    : "Tùy chỉnh nhắc nhở"}
                </span>
              </button>
            </div>
          </div>
          <div>
            <InputField
              label="Ngày mở bao bì"
              type="date"
              value={d.opened_on || ""}
              onChange={set("opened_on")}
              aria-describedby="e-opened"
            />
            <FieldError id="e-opened" msg={errors.opened_on} />
          </div>
          <div>
            <InputField
              label="Hạn sử dụng (HSD)"
              type="date"
              value={d.expDate}
              onChange={set("expDate")}
              aria-describedby="e-exp"
            />
            <FieldError id="e-exp" msg={errors.expDate} />
          </div>
        </div>

        {/* Khung Tùy chỉnh nhắc nhở (Google Calendar style) chỉ hiện ra khi ấn vào icon */}
        {showReminderPicker && (
          <div className="mt-2 pt-4 border-t border-border-primary/60 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-[#0b57d0] dark:text-blue-400" />
                <span className="text-sm font-semibold text-text-primary">
                  Tùy chỉnh nhắc nhở
                </span>
                {d.reviewAt && (
                  <span className="text-xs font-medium text-[#0b57d0] dark:text-blue-400 bg-[#0b57d0]/10 px-2 py-0.5 rounded-full">
                    Đã bật lịch nhắc
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowReminderPicker(false)}
                className="text-xs text-text-secondary hover:text-text-primary underline cursor-pointer"
              >
                Thu gọn
              </button>
            </div>

            <GoogleReminderPicker
              value={d.reviewAt}
              onChange={(date: string) =>
                setD((p) => ({ ...p, reviewAt: date }))
              }
              onClear={() => {
                setD((p) => ({ ...p, reviewAt: "" }))

                setShowReminderPicker(false)
              }}
            />

            {/* Gợi ý chọn nhanh */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-xs text-text-secondary font-medium mr-1">
                Gợi ý nhanh:
              </span>
              {[1, 2, 3, 5, 7].map((num) => {
                const targetDate = addDays(today(), num)

                const isSelected = d.reviewAt === targetDate

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() =>
                      setD((p) => ({
                        ...p,

                        reviewAt: isSelected ? "" : targetDate,
                      }))
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0b57d0] text-white shadow-xs"
                        : "bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-tertiary border border-border-primary/50"
                    }`}
                  >
                    +{num} ngày
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {expPast && (
          <p className="text-xs text-status-soon font-medium">
            HSD đã qua so với hôm nay. Bạn vẫn có thể lưu — món này sẽ được xếp
            vào mục Cần chú ý.
          </p>
        )}
      </Card>

      {errors.save && <FieldError msg={errors.save} />}

      <div className="flex items-center justify-end gap-3 pb-8">
        <Button variant="neutral" onClick={() => onCancel(dirty)}>
          Hủy
        </Button>
        <Button variant="primary" loading={saving} onClick={save}>
          {mode === "edit" ? "Lưu thay đổi" : "Lưu thực phẩm"}
        </Button>
      </div>

      {/* Add Location Modal */}
      <Modal
        isOpen={newLocModal}
        onClose={() => setNewLocModal(false)}
        title="Thêm nơi bảo quản mới"
        size="small"
        footer={
          <>
            <Button variant="neutral" onClick={() => setNewLocModal(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              disabled={!newLocName.trim()}
              onClick={() => {
                const name = newLocName.trim()

                if (name) {
                  onAddLocation(name)

                  setD((p) => ({ ...p, location: name }))

                  setNewLocName("")

                  setNewLocModal(false)
                }
              }}
            >
              Thêm
            </Button>
          </>
        }
      >
        <InputField
          label="Tên vị trí"
          placeholder="Ví dụ: Tủ lạnh mini, Kệ gia vị..."
          value={newLocName}
          onChange={setNewLocName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()

              const name = newLocName.trim()

              if (name) {
                onAddLocation(name)

                setD((p) => ({ ...p, location: name }))

                setNewLocName("")

                setNewLocModal(false)
              }
            }
          }}
          autoFocus
        />
      </Modal>
    </div>
  )
}

export default FoodForm
