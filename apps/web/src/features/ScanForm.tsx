import { type ChangeEvent, useEffect, useRef, useState } from "react"

import {
  BrowserMultiFormatReader,
  BrowserCodeReader,
  BarcodeFormat,
} from "@zxing/browser"

import type { ScanDateCandidate, ScanResult } from "../api/client"

import { inferCategory, CATEGORY_LABELS } from "../store/appStore"

import Button from "../components/ui/Button"

import Field from "../components/ui/Field"

import Icon from "../components/ui/Icon"

import { fmtDate } from "../lib/format"

import {
  MAX_OPTIMIZED_IMAGE_BYTES,
  optimizeScanImage,
} from "./image-optimization"

export type BarcodeData = {
  barcode: string

  barcode_format: string
}

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

function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext

    if (!AudioCtx) return

    const ctx = new AudioCtx()

    const osc = ctx.createOscillator()

    const gain = ctx.createGain()

    osc.type = "sine"

    osc.frequency.setValueAtTime(880, ctx.currentTime)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)

    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

    osc.connect(gain)

    gain.connect(ctx.destination)

    osc.start()

    osc.stop(ctx.currentTime + 0.12)

    setTimeout(() => {
      ctx.close().catch(() => {})
    }, 200)
  } catch {
    // Silent fallback if audio context is blocked
  }
}

export default function ScanForm({
  onScan,

  onApply,

  onApplyBarcode,

  onClose,
}: {
  onScan?: (file: File) => Promise<ScanResult>

  onApply: (result: ScanResult, selectedDate: string | null) => void

  onApplyBarcode?: (data: BarcodeData) => void

  onClose: () => void
}) {
  const [tab, setTab] = useState<"barcode" | "ocr">("barcode")

  // --- Barcode Scanner State ---

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const readerRef = useRef<BrowserMultiFormatReader | null>(null)

  const controlsRef = useRef<{ stop: () => void } | null>(null)

  const [cameraStarting, setCameraStarting] = useState(false)

  const [cameraActive, setCameraActive] = useState(false)

  const [cameraError, setCameraError] = useState("")

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")

  const [manualCode, setManualCode] = useState("")

  const [scannedResult, setScannedResult] = useState<BarcodeData | null>(null)

  // --- OCR State ---

  const [file, setFile] = useState<File | null>(null)

  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  const libraryInputRef = useRef<HTMLInputElement | null>(null)

  const imageSelectionRef = useRef(0)

  const previewUrlRef = useRef<string | null>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [processingImage, setProcessingImage] = useState(false)

  const [result, setResult] = useState<ScanResult | null>(null)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const [pending, setPending] = useState(false)

  const [error, setError] = useState("")

  useEffect(
    () => () => {
      imageSelectionRef.current += 1

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    },

    [],
  )

  const replacePreview = (nextFile: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const nextUrl = nextFile ? URL.createObjectURL(nextFile) : null

    previewUrlRef.current = nextUrl

    setPreviewUrl(nextUrl)
  }

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0]

    event.currentTarget.value = ""

    if (!selectedFile) return

    const selectionId = ++imageSelectionRef.current

    setFile(null)

    replacePreview(null)

    setResult(null)

    setSelectedDate(null)

    setError("")

    setProcessingImage(true)

    void optimizeScanImage(selectedFile)

      .then((optimizedFile) => {
        if (selectionId !== imageSelectionRef.current) return

        setFile(optimizedFile)

        replacePreview(optimizedFile)
      })

      .catch((failure: unknown) => {
        if (selectionId !== imageSelectionRef.current) return

        setError(
          failure instanceof Error
            ? failure.message
            : "Không thể tối ưu ảnh. Hãy thử chọn ảnh khác.",
        )
      })

      .finally(() => {
        if (selectionId === imageSelectionRef.current) {
          setProcessingImage(false)
        }
      })
  }

  const stopCamera = () => {
    try {
      if (controlsRef.current) {
        controlsRef.current.stop()

        controlsRef.current = null
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream

        stream.getTracks().forEach((track) => track.stop())

        videoRef.current.srcObject = null
      }
    } catch {
      // Ignore cleanup error
    }

    setCameraActive(false)

    setCameraStarting(false)
  }

  // Camera initialization and continuous decode

  useEffect(() => {
    if (tab !== "barcode") {
      stopCamera()

      return
    }

    let active = true

    setCameraError("")

    setCameraStarting(true)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        "Trình duyệt không hỗ trợ truy cập camera. Bạn có thể nhập mã vạch bằng tay bên dưới.",
      )

      setCameraStarting(false)

      return
    }

    // List available video devices

    BrowserCodeReader.listVideoInputDevices()

      .then((devices) => {
        if (!active) return

        setVideoDevices(devices)

        if (devices.length > 0 && !selectedDeviceId) {
          // Prefer back/environment camera if available

          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("environment") ||
              d.label.toLowerCase().includes("sau"),
          )

          setSelectedDeviceId(backCam ? backCam.deviceId : devices[0].deviceId)
        }
      })

      .catch(() => {
        // Device listing error is not fatal; decodeFromVideoDevice handles standard camera
      })

    const reader = new BrowserMultiFormatReader()

    readerRef.current = reader

    const videoElem = videoRef.current

    if (!videoElem) {
      setCameraStarting(false)

      return
    }

    reader

      .decodeFromVideoDevice(
        selectedDeviceId || undefined,

        videoElem,

        (scanResult, _err, controls) => {
          if (!active) return

          controlsRef.current = controls

          if (scanResult) {
            playBeep()

            if (
              typeof navigator !== "undefined" &&
              typeof navigator.vibrate === "function"
            ) {
              try {
                navigator.vibrate(100)
              } catch {
                // Ignore vibration failure
              }
            }

            const formatName =
              BarcodeFormat[scanResult.getBarcodeFormat()] || "UNKNOWN"

            const barcodeData: BarcodeData = {
              barcode: scanResult.getText(),

              barcode_format: formatName,
            }

            stopCamera()

            setScannedResult(barcodeData)

            if (onApplyBarcode) {
              onApplyBarcode(barcodeData)
            }
          }
        },
      )

      .then((controls) => {
        if (!active) {
          controls.stop()

          return
        }

        controlsRef.current = controls

        setCameraActive(true)

        setCameraStarting(false)
      })

      .catch((err: unknown) => {
        if (!active) return

        setCameraStarting(false)

        setCameraActive(false)

        const errName = (err as Error)?.name || ""

        if (
          errName === "NotAllowedError" ||
          errName === "PermissionDeniedError"
        ) {
          setCameraError(
            "Quyền camera bị từ chối. Hãy cho phép camera trên thanh địa chỉ hoặc nhập mã bằng tay.",
          )
        } else if (
          errName === "NotFoundError" ||
          errName === "DevicesNotFoundError"
        ) {
          setCameraError(
            "Không tìm thấy camera trên thiết bị. Bạn có thể nhập mã vạch bằng tay.",
          )
        } else {
          setCameraError(
            "Không thể kích hoạt camera. Bạn có thể nhập mã vạch bằng tay hoặc chuyển sang quét ảnh.",
          )
        }
      })

    return () => {
      active = false

      stopCamera()
    }
  }, [tab, selectedDeviceId])

  const handleManualApply = () => {
    if (!manualCode.trim()) return

    const barcodeData: BarcodeData = {
      barcode: manualCode.trim(),

      barcode_format: "MANUAL",
    }

    stopCamera()

    if (onApplyBarcode) {
      onApplyBarcode(barcodeData)
    }
  }

  const handleClose = () => {
    stopCamera()

    onClose()
  }

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
    <section className="scan-assist stack" aria-label="Hỗ trợ quét thông tin">
      <div className="scan-assist-heading">
        <strong>Trợ lý quét thông tin</strong>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={handleClose}
          disabled={pending}
        >
          Đóng
        </Button>
      </div>

      <nav className="scan-tab-nav" aria-label="Chọn phương thức quét">
        <button
          type="button"
          className={`scan-tab-btn ${tab === "barcode" ? "active" : ""}`}
          onClick={() => {
            setTab("barcode")

            setError("")
          }}
        >
          <Icon name="camera" />
          <span>Quét mã vạch (Barcode)</span>
        </button>
        {onScan && (
          <button
            type="button"
            className={`scan-tab-btn ${tab === "ocr" ? "active" : ""}`}
            onClick={() => {
              setTab("ocr")

              stopCamera()
            }}
          >
            <Icon name="review" />
            <span>Quét nhãn ngày (OCR)</span>
          </button>
        )}
      </nav>

      {/* --- TAB 1: BARCODE CAMERA SCANNER --- */}
      {tab === "barcode" && (
        <div className="stack barcode-scanner-section">
          <p className="inline-hint">
            Hướng camera vào mã vạch (EAN-13, EAN-8, Code-128, QR Code) để nhận
            diện tự động.
          </p>

          {videoDevices.length > 1 && (
            <Field label="Chọn Camera">
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  stopCamera()

                  setSelectedDeviceId(e.target.value)
                }}
              >
                {videoDevices.map((d, index) => (
                  <option key={d.deviceId || index} value={d.deviceId}>
                    {d.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {!cameraError && (
            <div className="barcode-viewport" aria-label="Khung ngắm camera">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="barcode-video"
              />
              <div className="barcode-overlay">
                <div className="barcode-guide-box">
                  <div className="barcode-laser" />
                </div>
              </div>
            </div>
          )}

          {cameraStarting && !cameraError && (
            <p className="inline-hint" style={{ textAlign: "center" }}>
              Đang khởi động camera...
            </p>
          )}

          {scannedResult && (
            <div
              className="note-box"
              style={{ background: "var(--accent-subtle, #f0fdf4)" }}
            >
              <Icon name="check" />
              <span>
                Đã nhận diện: <strong>{scannedResult.barcode}</strong> (
                {scannedResult.barcode_format})
              </span>
            </div>
          )}

          {cameraError && (
            <p className="note-box" role="alert">
              {cameraError}
            </p>
          )}

          {/* Manual Barcode fallback */}
          <div
            className="stack"
            style={{
              marginTop: "8px",

              paddingTop: "12px",

              borderTop: "1px dashed var(--line-2)",
            }}
          >
            <span
              style={{
                fontSize: "0.875rem",

                fontWeight: 500,

                color: "var(--muted)",
              }}
            >
              Hoặc nhập mã vạch thủ công:
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Ví dụ: 8934673123456"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!manualCode.trim()}
                onClick={handleManualApply}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: OCR IMAGE SCANNER --- */}
      {tab === "ocr" && onScan && (
        <div className="stack ocr-scanner-section">
          <p className="inline-hint">
            Ảnh chỉ tạo gợi ý ngày và tên. Xem lại văn bản và chọn ngày trước
            khi áp dụng vào biểu mẫu; app không tự lưu món.
          </p>
          <Field
            as="fieldset"
            label="Ảnh bao bì"
            hint="Ảnh sẽ được thu nhỏ và nén dưới 1 MB trước khi tải lên."
          >
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,application/octet-stream"
              capture="environment"
              hidden
              disabled={pending || processingImage}
              onChange={handleImageSelection}
              aria-label="Chụp ảnh bao bì mới"
            />
            <input
              ref={libraryInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,application/octet-stream"
              hidden
              disabled={pending || processingImage}
              onChange={handleImageSelection}
              aria-label="Chọn ảnh bao bì từ thư viện"
            />
            <div className="row-actions scan-image-actions">
              <Button
                variant="secondary"
                disabled={pending || processingImage}
                onClick={() => cameraInputRef.current?.click()}
              >
                Chụp ảnh mới
              </Button>
              <Button
                variant="outline"
                disabled={pending || processingImage}
                onClick={() => libraryInputRef.current?.click()}
              >
                Chọn từ thư viện
              </Button>
            </div>
          </Field>
          {processingImage && (
            <p className="inline-hint" role="status">
              Đang tối ưu ảnh...
            </p>
          )}
          {previewUrl && file && (
            <figure className="scan-image-preview">
              <img src={previewUrl} alt="Ảnh bao bì đã chọn để quét" />
              <figcaption>
                Ảnh xem trước ·{" "}
                {(file.size / 1024).toLocaleString("vi-VN", {
                  maximumFractionDigits: 0,
                })}{" "}
                KB
              </figcaption>
            </figure>
          )}
          <div className="row-actions">
            <Button
              type="button"
              variant="secondary"
              loading={pending}
              disabled={!file || pending || processingImage}
              onClick={() => {
                if (!file || pending || processingImage) return

                if (
                  !file.size ||
                  file.size >= MAX_OPTIMIZED_IMAGE_BYTES ||
                  ![
                    "image/jpeg",

                    "image/jpg",

                    "image/pjpeg",

                    "image/png",

                    "image/webp",

                    "application/octet-stream",
                  ].includes(file.type.toLowerCase())
                ) {
                  setError("Chọn ảnh JPEG, PNG hoặc WebP nhỏ hơn 1 MB.")

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
            <div className="stack" style={{ gap: "8px" }}>
              <p className="note-box" role="alert">
                {error}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Chuyển sang điền tay
                </Button>
              </div>
            </div>
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
              {result.candidates.food_name && (
                <p>
                  Danh mục dự kiến:{" "}
                  <strong>
                    {CATEGORY_LABELS[
                      inferCategory(result.candidates.food_name)
                    ] || "Khác"}
                  </strong>{" "}
                  <span className="inline-hint">(suy luận tự động)</span>
                </p>
              )}
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
                  Không có ngày theo dõi đủ rõ để áp dụng. Bạn có thể tiếp tục
                  nhập tay.
                </p>
              )}
              {result.raw_text && (
                <details>
                  <summary>Văn bản đã đọc</summary>
                  <p>{result.raw_text}</p>
                </details>
              )}
              <div
                style={{
                  display: "flex",

                  gap: "8px",

                  flexWrap: "wrap",

                  marginTop: "12px",
                }}
              >
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => onApply(result, selectedDate)}
                >
                  Áp dụng gợi ý vào biểu mẫu
                </Button>
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Chuyển sang điền tay
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
