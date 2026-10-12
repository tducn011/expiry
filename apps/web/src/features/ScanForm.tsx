import { useState } from "react"
import type { CreatePayload } from "../domain/types"
import type { ScanCandidate, ScanResult } from "../api/client"
import Button from "../components/ui/Button"
import Field from "../components/ui/Field"
import Modal, { ModalActions } from "../components/ui/Modal"
import { fmtDate } from "../lib/format"

export default function ScanForm({
  onScan,
  onReview,
  onClose,
}: {
  onScan: (file: File) => Promise<ScanResult>
  onReview: (draft: CreatePayload) => void
  onClose: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const review = (candidate?: ScanCandidate) => {
    const date = candidate?.expiry_date || candidate?.parsed_date || null
    const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null
    const certainty = !validDate
      ? "unknown"
      : candidate?.ambiguous
        ? "estimated"
        : "exact"
    onReview({
      name: candidate?.food_name || "",
      initial_quantity: 0,
      unit: "piece",
      storage_location: null,
      expiry_date: validDate,
      expiry_date_certainty: certainty,
      expiry_date_source:
        certainty === "unknown"
          ? null
          : certainty === "estimated"
            ? "user_estimate"
            : "package_label",
      expiry_date_label_type:
        candidate?.date_label_type === "use_by" ||
        candidate?.date_label_type === "best_before"
          ? candidate.date_label_type
          : null,
      opened_on: null,
      note: null,
    })
  }
  return (
    <Modal
      title="Quét thông tin trên bao bì"
      eyebrow="GỢI Ý NHẬP LIỆU"
      layout="form"
      onClose={() => {
        if (!pending) onClose()
      }}
    >
      <div className="form-body stack">
        <p className="inline-hint">
          Kết quả chỉ là gợi ý. Đối chiếu nhãn, nhập lượng và kiểm tra thông tin
          trước khi bấm lưu vào kho.
        </p>
        <Field label="Ảnh bao bì" hint="JPEG, PNG hoặc WebP, tối đa 5 MB.">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setResult(null)
              setError("")
            }}
          />
        </Field>
        <Button
          variant="primary"
          loading={pending}
          disabled={!file}
          onClick={() => {
            if (!file || pending) return
            if (
              !file.size ||
              file.size > 5 * 1024 * 1024 ||
              !["image/jpeg", "image/png", "image/webp"].includes(file.type)
            ) {
              setError("Chọn ảnh JPEG, PNG hoặc WebP không quá 5 MB.")
              return
            }
            setPending(true)
            setError("")
            onScan(file)
              .then(setResult)
              .catch((error) =>
                setError(
                  error instanceof Error
                    ? error.message
                    : "Không thể quét ảnh. Bạn có thể nhập tay.",
                ),
              )
              .finally(() => setPending(false))
          }}
        >
          Đọc ảnh
        </Button>
        {error && (
          <p className="note-box" role="alert">
            {error}
          </p>
        )}
        {result && (
          <div className="stack">
            <p>
              {result.candidates.length
                ? "Chọn gợi ý để kiểm tra và chỉnh sửa:"
                : "Chưa đọc được ngày rõ ràng. Bạn vẫn có thể nhập tay."}
            </p>
            {result.warnings.map((warning, i) => (
              <p className="note-box" key={i}>
                {warning}
              </p>
            ))}
            {result.candidates.map((candidate, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => review(candidate)}
              >
                {candidate.food_name || "Ngày trên bao bì"} ·{" "}
                {fmtDate(
                  candidate.expiry_date || candidate.parsed_date || null,
                )}
                {candidate.ambiguous ? " · Cần kiểm tra" : ""}
              </Button>
            ))}
            {result.raw_text && (
              <details>
                <summary>Văn bản đã đọc</summary>
                <p>{result.raw_text}</p>
              </details>
            )}
          </div>
        )}
      </div>
      <footer className="modal-footer">
        <ModalActions
          start={
            <Button variant="ghost" onClick={onClose} disabled={pending}>
              Hủy
            </Button>
          }
          end={
            <Button
              variant="secondary"
              onClick={() => review()}
              disabled={pending}
            >
              Nhập tay
            </Button>
          }
        />
      </footer>
    </Modal>
  )
}
