import { useState } from "react"
import type {
  CreatePayload,
  DateCertainty,
  DateLabelType,
  DateSource,
  EntryDraft,
  FoodEntry,
  Unit,
} from "../mockApi"
import {
  certaintyLabel,
  fmtQty,
  labelTypeLabel,
  locations,
  sourceLabel,
  unitLabel,
} from "../lib/format"
import Button from "../components/ui/Button"
import DatePicker from "../components/ui/DatePicker"
import Field from "../components/ui/Field"
import Icon from "../components/ui/Icon"
import Modal, { ModalActions } from "../components/ui/Modal"
import Segmented from "../components/ui/Segmented"
import Select from "../components/ui/Select"

type FormState = {
  name: string
  quantity: string
  unit: Unit
  storage_location: string
  certainty: DateCertainty
  expiry_date: string
  source: DateSource
  label: DateLabelType
  opened_on: string
  note: string
}

/** UI-03 create and UI-08 metadata edit; basics can be saved before optional dates. */
export default function EntryForm({
  entry,
  initial,
  initialStep = 0,
  onClose,
  onCreate,
  onUpdate,
}: {
  entry?: FoodEntry
  initial?: CreatePayload | null
  initialStep?: 0 | 1
  onClose: () => void
  onCreate?: (p: CreatePayload) => void
  onUpdate?: (p: EntryDraft) => void
}) {
  const base = entry ?? initial
  const [step, setStep] = useState<0 | 1>(initialStep)
  const [tried, setTried] = useState([false, false])
  const [form, setForm] = useState<FormState>({
    name: base?.name ?? "",
    quantity: initial ? String(initial.initial_quantity) : "",
    unit: base?.unit ?? "piece",
    storage_location: base?.storage_location ?? "",
    certainty: base?.expiry_date_certainty ?? "unknown",
    expiry_date: base?.expiry_date ?? "",
    source:
      base?.expiry_date_source && base.expiry_date_source !== "user_estimate"
        ? base.expiry_date_source
        : "package_label",
    label: base?.expiry_date_label_type ?? "unknown",
    opened_on: base?.opened_on ?? "",
    note: base?.note ?? "",
  })
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))
  const qty = Number(form.quantity)
  const errors: Record<string, string>[] = [
    {
      name: form.name.trim() ? "" : "Nhập tên thực phẩm.",
      quantity: entry
        ? ""
        : !form.quantity || qty <= 0
          ? "Lượng phải lớn hơn 0."
          : form.unit === "piece" && !Number.isInteger(qty)
            ? "Đơn vị “cái” chỉ nhận số nguyên."
            : "",
    },
    {
      expiry_date:
        form.certainty !== "unknown" && !form.expiry_date
          ? "Chọn ngày theo dõi."
          : "",
    },
  ]
  const stepValid = (i: number) => Object.values(errors[i]).every((e) => !e)
  const show = (i: number, k: string) => (tried[i] ? errors[i][k] : "")
  const next = () => {
    setTried((t) => t.map((v, i) => (i === step ? true : v)))
    if (stepValid(step)) setStep(1)
  }
  const submit = () => {
    setTried([true, true])
    if (!stepValid(0)) {
      setStep(0)
      return
    }
    if (!stepValid(1)) {
      setStep(1)
      return
    }
    const unknown = form.certainty === "unknown"
    const draft: EntryDraft = {
      name: form.name.trim(),
      storage_location: form.storage_location.trim() || null,
      expiry_date: unknown ? null : form.expiry_date,
      expiry_date_certainty: form.certainty,
      expiry_date_source: unknown
        ? null
        : form.certainty === "estimated"
          ? "user_estimate"
          : form.source,
      expiry_date_label_type: unknown ? null : form.label,
      opened_on: form.opened_on || null,
      note: form.note.trim() || null,
    }
    entry
      ? onUpdate?.(draft)
      : onCreate?.({ ...draft, initial_quantity: qty, unit: form.unit })
  }
  const steps = ["Cơ bản", "Ngày & ghi chú"]

  return (
    <Modal
      size="wide"
      layout="form"
      eyebrow={entry ? "THÔNG TIN BẢN GHI" : "BẢN GHI MỚI"}
      title={entry ? "Sửa thực phẩm" : "Thêm thực phẩm"}
      onClose={onClose}
    >
      <form
        className="stepped-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <ol className="stepper">
          {steps.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                aria-current={i === step ? "step" : undefined}
                className={i === step ? "active" : i < step ? "done" : ""}
                onClick={() => (i === 0 ? setStep(0) : next())}
              >
                <span>{i < step ? <Icon name="check" /> : i + 1}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>
        <div className="form-body">
          {step === 0 ? (
            <div className="form-grid" key="basic">
              {!entry && (
                <p className="inline-hint span-2">
                  Tên, lượng và đơn vị là đủ để lưu. Ngày và vị trí có thể bổ
                  sung sau.
                </p>
              )}
              <div className="span-2">
                <Field label="Tên thực phẩm *" error={show(0, "name")}>
                  <input
                    autoFocus
                    maxLength={200}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ví dụ: Sữa tươi"
                  />
                </Field>
              </div>
              {entry ? (
                <div className="readonly-row span-2">
                  <span>Lượng còn</span>
                  <strong>
                    {fmtQty(entry.remaining_quantity)} {unitLabel[entry.unit]}
                  </strong>
                  <small>
                    Lượng chỉ đổi qua Đã dùng, Đã bỏ hoặc Kiểm lại. Đơn vị cố
                    định sau khi tạo.
                  </small>
                </div>
              ) : (
                <>
                  <Field label="Số lượng ban đầu *" error={show(0, "quantity")}>
                    <input
                      inputMode="decimal"
                      type="number"
                      min="0.001"
                      step={form.unit === "piece" ? 1 : 0.001}
                      value={form.quantity}
                      onChange={(e) => set("quantity", e.target.value)}
                      placeholder="0"
                    />
                  </Field>
                  <Field
                    as="fieldset"
                    label="Đơn vị *"
                    hint="Không đổi được sau khi lưu."
                  >
                    <Segmented
                      size="compact"
                      options={unitLabel}
                      value={form.unit}
                      onChange={(u) => set("unit", u)}
                    />
                  </Field>
                </>
              )}
              <div className="span-2">
                <Field label="Vị trí" hint="Không bắt buộc.">
                  <input
                    maxLength={100}
                    value={form.storage_location}
                    onChange={(e) => set("storage_location", e.target.value)}
                    placeholder="Ngăn mát, tủ bếp..."
                  />
                </Field>
                <div className="chips location-chips" aria-label="Vị trí gợi ý">
                  {locations.map((l) => (
                    <button
                      type="button"
                      key={l}
                      aria-pressed={form.storage_location === l}
                      className={form.storage_location === l ? "active" : ""}
                      onClick={() => set("storage_location", l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="form-grid" key="date">
              <div className="span-2">
                <Field as="fieldset" label="Thông tin ngày">
                  <Segmented
                    options={certaintyLabel}
                    value={form.certainty}
                    onChange={(c) => set("certainty", c)}
                  />
                </Field>
              </div>
              {form.certainty === "unknown" ? (
                <p className="inline-hint span-2">
                  Món sẽ nằm trong nhóm “Chưa có ngày”. Bạn có thể thêm ngày
                  sau.
                </p>
              ) : (
                <div className="span-2 row-3">
                  <Field label="Ngày theo dõi *" error={show(1, "expiry_date")}>
                    <DatePicker
                      aria-label="Ngày theo dõi"
                      value={form.expiry_date}
                      onChange={(value) => set("expiry_date", value)}
                      aria-invalid={Boolean(show(1, "expiry_date"))}
                    />
                  </Field>
                  <Field label="Nguồn ngày">
                    <Select<DateSource>
                      aria-label="Nguồn ngày"
                      disabled={form.certainty === "estimated"}
                      value={
                        form.certainty === "estimated"
                          ? "user_estimate"
                          : form.source
                      }
                      onChange={(source) => set("source", source)}
                      options={
                        form.certainty === "estimated"
                          ? [
                              {
                                value: "user_estimate",
                                label: sourceLabel.user_estimate,
                              },
                            ]
                          : [
                              {
                                value: "package_label",
                                label: sourceLabel.package_label,
                              },
                              {
                                value: "user_reentered",
                                label: sourceLabel.user_reentered,
                              },
                            ]
                      }
                    />
                  </Field>
                  <Field label="Loại nhãn">
                    <Select<DateLabelType>
                      aria-label="Loại nhãn"
                      value={form.label}
                      onChange={(label) => set("label", label)}
                      options={(Object.keys(
                        labelTypeLabel,
                      ) as DateLabelType[]).map((label) => ({
                        value: label,
                        label: labelTypeLabel[label],
                      }))}
                    />
                  </Field>
                </div>
              )}
              <Field label="Ngày mở" hint="Không đổi ngày theo dõi.">
                <DatePicker
                  aria-label="Ngày mở"
                  value={form.opened_on}
                  onChange={(value) => set("opened_on", value)}
                />
              </Field>
              <Field label="Ghi chú" hint={`${form.note.length}/1000`}>
                <input
                  maxLength={1000}
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Không bắt buộc"
                />
              </Field>
            </div>
          )}
        </div>
        <footer className="modal-footer">
          <ModalActions
            start={
              step === 0 ? (
                <Button variant="ghost" onClick={onClose}>
                  Hủy
                </Button>
              ) : (
                <Button variant="ghost" icon="back" onClick={() => setStep(0)}>
                  Quay lại
                </Button>
              )
            }
            end={
              <>
                {step === 0 && (
                  <Button variant="secondary" onClick={next}>
                    {entry ? "Ngày & ghi chú" : "Thêm ngày"}
                  </Button>
                )}
                <Button type="submit" variant="primary">
                  {entry
                    ? "Lưu thay đổi"
                    : step === 0
                      ? "Lưu ngay"
                      : "Lưu thực phẩm"}
                </Button>
              </>
            }
          />
        </footer>
      </form>
    </Modal>
  )
}
