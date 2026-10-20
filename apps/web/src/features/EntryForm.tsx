import { useRef, useState } from "react"
import type {
  CreatePayload,
  DateCertainty,
  DateLabelType,
  DateSource,
  EntryDraft,
  FoodEntry,
  Unit,
} from "../domain/types"
import { scanToEntryDraft, type ScanResult } from "../api/client"
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
import Modal, { ModalActions, RetryAction } from "../components/ui/Modal"
import Segmented from "../components/ui/Segmented"
import Select from "../components/ui/Select"
import ScanForm from "./ScanForm"

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
  barcode?: string
  barcode_format?: string
}

/** UI-03 create and UI-08 metadata edit; basics can be saved before optional dates. */
export default function EntryForm({
  entry,
  initial,
  initialStep = 0,
  onClose,
  onCreate,
  onUpdate,
  onScan,
  active = true,
  canRetry = false,
  retryPending = false,
  retryError = "",
  onRetry,
}: {
  entry?: FoodEntry
  initial?: CreatePayload | null
  initialStep?: 0 | 1
  onClose: () => void
  onCreate?: (p: CreatePayload) => void | Promise<void>
  onUpdate?: (p: EntryDraft) => void | Promise<void>
  onScan?: (file: File) => Promise<ScanResult>
  active?: boolean
  canRetry?: boolean
  retryPending?: boolean
  retryError?: string
  onRetry?: () => void
}) {
  const base = entry ?? initial
  const submitInFlight = useRef(false)
  const [step, setStep] = useState<0 | 1>(initialStep)
  const [scanOpen, setScanOpen] = useState(false)
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
  const quantityFormatValid = /^\d+(?:\.\d{1,3})?$/.test(form.quantity)
  const errors: Record<string, string>[] = [
    {
      name: form.name.trim() ? "" : "Nhập tên thực phẩm.",
      quantity: entry
        ? ""
        : !form.quantity
          ? "Lượng phải lớn hơn 0."
          : !quantityFormatValid || !Number.isFinite(qty)
            ? "Nhập lượng dạng số, tối đa 3 chữ số thập phân."
            : qty > 999999999.999
              ? "Lượng tối đa là 999.999.999,999."
              : qty <= 0
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
    if (submitInFlight.current || canRetry || retryPending) return
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
    submitInFlight.current = true
    let result: void | Promise<void>
    try {
      result = entry
        ? onUpdate?.(draft)
        : onCreate?.({ ...draft, initial_quantity: qty, unit: form.unit })
    } catch (error) {
      submitInFlight.current = false
      throw error
    }
    if (result && typeof result.then === "function") {
      void result.then(
        () => {
          submitInFlight.current = false
        },
        () => {
          submitInFlight.current = false
        },
      )
    } else {
      submitInFlight.current = false
    }
  }
  const steps = ["Cơ bản", "Ngày & ghi chú"]

  return (
    <Modal
      size="wide"
      layout="form"
      eyebrow={entry ? "THÔNG TIN BẢN GHI" : "BẢN GHI MỚI"}
      title={entry ? "Sửa thực phẩm" : "Thêm thực phẩm"}
      onClose={onClose}
      active={active}
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
          <RetryAction
            canRetry={canRetry}
            pending={retryPending}
            error={retryError}
            onRetry={onRetry ?? (() => {})}
          />
          {step === 0 ? (
            <div className="form-grid" key="basic">
              {!entry && (
                <div className="span-2 stack">
                  <p className="inline-hint">
                    Tên, lượng và đơn vị là đủ để lưu. Ngày và vị trí có thể bổ
                    sung sau.
                  </p>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setScanOpen((open) => !open)}
                    >
                      {scanOpen ? "Đóng quét mã / nhãn" : "Quét mã vạch / nhãn"}
                    </Button>
                    {scanOpen && (
                      <ScanForm
                        onScan={onScan}
                        onClose={() => setScanOpen(false)}
                        onApplyBarcode={(barcodeData) => {
                          setForm((current) => ({
                            ...current,
                            barcode: barcodeData.barcode,
                            barcode_format: barcodeData.barcode_format,
                            note: current.note
                              ? current.note.includes(barcodeData.barcode)
                                ? current.note
                                : `${current.note} (Mã vạch: ${barcodeData.barcode})`
                              : `Mã vạch: ${barcodeData.barcode}`,
                          }))
                          setScanOpen(false)
                        }}
                        onApply={(result, selectedDate) => {
                          const mapped = scanToEntryDraft(
                            result,
                            selectedDate,
                          )
                          setForm((current) => ({
                            ...current,
                            name: mapped.name || current.name,
                            ...(mapped.expiry_date === null
                              ? {}
                              : {
                                  expiry_date: mapped.expiry_date,
                                  certainty: mapped.expiry_date_certainty,
                                  source:
                                    mapped.expiry_date_source ||
                                    "package_label",
                                  label:
                                    mapped.expiry_date_label_type ||
                                    "unknown",
                                }),
                          }))
                          setStep(1)
                          setScanOpen(false)
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
              {form.barcode && (
                <div className="span-2">
                  <div className="barcode-badge">
                    <Icon name="barcode" />
                    <span>
                      Mã vạch: <strong>{form.barcode}</strong> ({form.barcode_format || "1D"})
                    </span>
                    <button
                      type="button"
                      className="barcode-remove-btn"
                      onClick={() =>
                        setForm((curr) => ({
                          ...curr,
                          barcode: undefined,
                          barcode_format: undefined,
                        }))
                      }
                      title="Bỏ mã vạch"
                      aria-label="Bỏ mã vạch"
                    >
                      ×
                    </button>
                  </div>
                </div>
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
                      max="999999999.999"
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
                  <Button variant="outline" onClick={next}>
                    {entry ? "Ngày & ghi chú →" : "Bổ sung ngày →"}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="cta"
                  disabled={canRetry || retryPending}
                >
                  {entry
                    ? "Lưu thay đổi"
                    : step === 0
                      ? "Lưu ngay"
                      : "Hoàn tất & lưu"}
                </Button>
              </>
            }
          />
        </footer>
      </form>
    </Modal>
  )
}
