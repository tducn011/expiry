import { useState } from "react"

import type { ScanDateCandidate, ScanResult } from "../api/client"

import Button from "../components/ui/Button"

import Field from "../components/ui/Field"

import { fmtDate } from "../lib/format"

const warningLabels: Record<string, string> = {
  AMBIGUOUS_EXPIRY_DATE:
    "Ngày theo dõi có nhiều cách đọc. Hãy so sánh các phương án với nhãn gốc.",

  AMBIGUOUS_MANUFACTURED_DATE:
    "Ngày sản xuất có nhiều cách đọc. Hãy kiểm tra lại trên nhãn gốc.",

  UNLABELLED_DATE:
    "Không thể xác định ý nghĩa của ngày chưa có nhãn. Hãy nhập ngày theo dõi bằng tay nếu cần.",
}

function warningMessage(warning: string) {
  const code = warning.split(":", 1)[0]

  return (
    warningLabels[code] ||
    "Có điểm cần kiểm tra trên ảnh nhãn. Hãy đối chiếu thông tin với bao bì gốc trước khi áp dụng."
  )
}

export default function ScanForm({
  onScan,

  onApply,

  onClose,
}: {
  onScan: (file: File) => Promise<ScanResult>

  onApply: (result: ScanResult, selectedDate: string | null) => void

  onClose: () => void
}) {
  const [file, setFile] = useState<File | null>(null)

  const [result, setResult] = useState<ScanResult | null>(null)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const [pending, setPending] = useState(false)

  const [error, setError] = useState("")

  const candidate: ScanDateCandidate | undefined =
    result?.candidates.expiry_date

  const choices =
    candidate && candidate.date_label_type !== "manufactured"
      ? [
          ...new Set(
            [candidate.value, ...candidate.alternatives].filter(
              (value): value is string => Boolean(value),
            ),
          ),
        ]
      : []

  return (
    <section className="scan-assist stack" aria-label="Quét nhãn bao bì">
      <div className="scan-assist-heading">
        <strong>Gợi ý từ ảnh nhãn</strong>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onClose}
          disabled={pending}
        >
          Đóng
        </Button>
      </div>
      <p className="inline-hint">
        Ảnh chỉ tạo gợi ý. Xem lại văn bản và chọn ngày trước khi áp dụng vào
        biểu mẫu; app không tự lưu món.
      </p>
      <Field label="Ảnh bao bì" hint="JPEG, PNG hoặc WebP, tối đa 5 MB.">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={pending}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null)

            setResult(null)

            setSelectedDate(null)

            setError("")
          }}
        />
      </Field>
      <div className="row-actions">
        <Button
          type="button"
          variant="secondary"
          loading={pending}
          disabled={!file || pending}
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

            void onScan(file)

              .then((value) => {
                setResult(value)

                setSelectedDate(value.candidates.expiry_date.value)
              })

              .catch((failure: unknown) =>
                setError(
                  failure instanceof Error
                    ? failure.message
                    : "Không thể quét ảnh. Bạn có thể nhập tay.",
                ),
              )

              .finally(() => setPending(false))
          }}
        >
          Đọc ảnh
        </Button>
      </div>
      {error && (
        <p className="note-box" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="stack scan-review">
          <strong>Đối chiếu gợi ý trước khi áp dụng</strong>
          {result.warnings.map((warning, index) => (
            <p className="note-box" key={`w-${index}`}>
              {warningMessage(warning)}
            </p>
          ))}
          {result.errors.map((message, index) => (
            <p className="note-box" key={`e-${index}`}>
              {message}
            </p>
          ))}
          <p>
            Tên đọc được:{" "}
            {result.candidates.food_name ||
              "Chưa nhận diện; bạn có thể nhập tay."}
          </p>
          <p>
            Ngày sản xuất đọc được:{" "}
            {result.candidates.manufactured_date.value
              ? `${fmtDate(result.candidates.manufactured_date.value)} · ${result.candidates.manufactured_date.source_text}`
              : "Chưa nhận diện"}
            . Ngày này không được dùng làm ngày theo dõi hoặc ngày mở.
          </p>
          <p>
            Ngày theo dõi: {candidate?.source_text || "Chưa nhận diện"}
            {candidate?.ambiguous ? " · Có nhiều cách đọc" : ""}
          </p>
          {choices.length > 0 ? (
            <Field as="fieldset" label="Chọn ngày để đưa vào biểu mẫu">
              <div className="chips">
                {choices.map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={selectedDate === value}
                    className={selectedDate === value ? "active" : ""}
                    onClick={() => setSelectedDate(value)}
                  >
                    {fmtDate(value)}
                    {candidate?.value === value
                      ? " · gợi ý chính"
                      : " · phương án khác"}
                  </button>
                ))}
              </div>
            </Field>
          ) : (
            <p className="inline-hint">
              Không có ngày theo dõi đủ rõ để áp dụng. Bạn có thể tiếp tục nhập
              tay.
            </p>
          )}
          {result.raw_text && (
            <details>
              <summary>Văn bản đã đọc</summary>
              <p>{result.raw_text}</p>
            </details>
          )}
          <Button
            type="button"
            variant="primary"
            onClick={() => onApply(result, selectedDate)}
          >
            Áp dụng gợi ý vào biểu mẫu
          </Button>
        </div>
      )}
    </section>
  )
}
