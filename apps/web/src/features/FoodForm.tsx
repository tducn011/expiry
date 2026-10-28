import { useRef, useState } from "react"
import type { Category, Food, Unit } from "../store/appStore"
import { CATEGORIES, today, UNITS } from "../store/appStore"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import FieldError from "../components/ui/FieldError"
import { Plus, ScanText, X } from "../components/ui/Icon"
import InputField from "../components/ui/InputField"
import Modal from "../components/ui/Modal"
import SectionTitle from "../components/ui/SectionTitle"
import SelectField from "../components/ui/SelectField"

export interface Draft {
  id?: string
  name: string
  quantity: string
  unit: Unit | ""
  category: Category | ""
  mfgDate: string
  expDate: string
  location: string
}

export const emptyDraft = (): Draft => ({
  name: "",
  quantity: "1",
  unit: "cái",
  category: "other",
  mfgDate: "",
  expDate: "",
  location: "",
})

export const draftFrom = (f: Food, keepQty = true): Draft => ({
  id: f.id,
  name: f.name,
  quantity: keepQty ? String(f.quantity) : "",
  unit: f.unit,
  category: f.category ?? "other",
  mfgDate: f.mfgDate ?? "",
  expDate: f.expDate ?? "",
  location: f.location ?? "",
})

export type Errors = Partial<Record<"name" | "quantity" | "unit" | "mfgDate" | "expDate" | "save", string>>

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
  if (!validDate(d.expDate)) e.expDate = "Ngày không hợp lệ."
  if (
    !e.mfgDate &&
    !e.expDate &&
    d.mfgDate &&
    d.expDate &&
    d.expDate < d.mfgDate
  )
    e.expDate = "Hạn sử dụng không thể trước ngày sản xuất."
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
  capturedImage?: string
  locations: string[]
  onAddLocation: (n: string) => void
  onSubmit: (d: Draft) => Promise<void>
  onCancel: (dirty: boolean) => void
}) {
  const [d, setD] = useState<Draft>(initial)
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
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Ảnh nhãn đã chụp"
              className="size-20 shrink-0 rounded-corner-md object-cover border border-border-primary/50 shadow-xs"
            />
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
              Chưa nhận dạng được chữ tự động. Hãy nhìn ảnh và đối chiếu để nhập
              NSX, HSD. Chưa có gì được lưu cho tới khi bạn bấm &quot;Lưu thực
              phẩm&quot;.
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
        <SectionTitle>Ngày trên bao bì</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <InputField
              label="Ngày sản xuất (NSX)"
              type="date"
              value={d.mfgDate}
              onChange={set("mfgDate")}
              aria-describedby="e-mfg"
            />
            <FieldError id="e-mfg" msg={errors.mfgDate} />
          </div>
          <div>
            <InputField
              label="Hạn sử dụng (HSD)"
              type="date"
              value={d.expDate}
              onChange={set("expDate")}
              aria-describedby="e-exp"
              description={
                d.expDate
                  ? undefined
                  : 'Bỏ trống nếu chưa rõ — sẽ hiển thị "Chưa rõ HSD".'
              }
            />
            <FieldError id="e-exp" msg={errors.expDate} />
          </div>
        </div>
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
          autoFocus
        />
      </Modal>
    </div>
  )
}

export default FoodForm
