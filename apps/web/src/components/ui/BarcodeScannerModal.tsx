import { useEffect, useRef, useState } from "react"

import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser"

import Button from "./Button"

import { Camera, ImageUp, Sparkles } from "./Icon"

import Modal from "./Modal"

import {
  playBeep,
  createConfiguredReader,
  decodeBarcodeFromImage,
  type BarcodeResult,
} from "../../lib/barcode"

interface BarcodeScannerModalProps {
  isOpen: boolean

  onClose: () => void

  onDetected: (result: BarcodeResult) => void
}

export default function BarcodeScannerModal({
  isOpen,

  onClose,

  onDetected,
}: BarcodeScannerModalProps) {
  const isMediaSupported =
    typeof navigator !== "undefined" &&
    Boolean(
      navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function",
    )

  const isSecure = typeof window !== "undefined" ? window.isSecureContext : true

  const [mode, setMode] = useState<"camera" | "upload">(() =>
    isMediaSupported ? "camera" : "upload",
  )

  const [error, setError] = useState<string>("")

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")

  const [scanning, setScanning] = useState(false)

  const [uploadPreview, setUploadPreview] = useState<string>("")

  const [decodingUpload, setDecodingUpload] = useState(false)

  const [manualBarcode, setManualBarcode] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)

  const controlsRef = useRef<IScannerControls | null>(null)

  const codeReaderRef = useRef(createConfiguredReader())

  // Enumerate video input devices when supported

  useEffect(() => {
    if (!isOpen || !isMediaSupported) {
      if (!isMediaSupported) setMode("upload")

      return
    }

    BrowserMultiFormatReader.listVideoInputDevices()

      .then((devices) => {
        setVideoDevices(devices)

        if (devices.length > 0 && !selectedDeviceId) {
          // Prefer back/environment camera if available

          const backCamera = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("environment") ||
              d.label.toLowerCase().includes("sau"),
          )

          setSelectedDeviceId(
            backCamera ? backCamera.deviceId : devices[0].deviceId,
          )
        }
      })

      .catch(() => {
        setMode("upload")
      })
  }, [isOpen, isMediaSupported, selectedDeviceId])

  // Start continuous video decoding

  useEffect(() => {
    if (!isOpen || mode !== "camera") {
      if (controlsRef.current) {
        controlsRef.current.stop()

        controlsRef.current = null
      }

      setScanning(false)

      return
    }

    if (!isMediaSupported) {
      setMode("upload")

      return
    }

    let active = true

    setError("")

    setScanning(true)

    const startScan = async () => {
      try {
        if (!videoRef.current) return

        const reader = codeReaderRef.current

        const deviceId = selectedDeviceId || undefined

        const controls = await reader.decodeFromVideoDevice(
          deviceId,

          videoRef.current,

          (result, err) => {
            if (!active) return

            if (result && result.getText()) {
              playBeep()

              const formatStr = result.getBarcodeFormat
                ? String(result.getBarcodeFormat())
                : "EAN_13"

              onDetected({
                text: result.getText().trim(),

                format: formatStr,

                timestamp: Date.now(),
              })

              onClose()
            }

            if (err && !(err.name === "NotFoundException")) {
              // Ignore frame search misses
            }
          },
        )

        if (active) {
          controlsRef.current = controls
        } else {
          controls.stop()
        }
      } catch (err: unknown) {
        if (!active) return

        setScanning(false)

        const e = err as {
          name?: string

          message?: string
        }

        if (
          e.name === "NotAllowedError" ||
          e.name === "PermissionDeniedError"
        ) {
          setError(
            "Quyền truy cập Camera bị từ chối. Vui lòng cấp quyền trong trình duyệt hoặc chuyển sang 'Chụp / Tải ảnh'.",
          )
        } else if (
          e.name === "NotFoundError" ||
          e.name === "DevicesNotFoundError"
        ) {
          setError(
            "Không tìm thấy camera trên thiết bị. Bạn có thể chụp ảnh hoặc tải ảnh lên bên dưới.",
          )

          setMode("upload")
        } else if (
          e.name === "NotReadableError" ||
          e.name === "TrackStartError"
        ) {
          setError("Camera đang được ứng dụng khác sử dụng.")
        } else if (!isSecure) {
          setError(
            "Trình duyệt chặn stream camera trực tiếp qua mạng HTTP. Bạn có thể dùng nút 'Chụp ảnh' để quét mã vạch.",
          )

          setMode("upload")
        } else {
          setError(
            e.message ||
              "Không thể truy cập camera. Vui lòng thử chụp ảnh hoặc tải ảnh.",
          )

          setMode("upload")
        }
      }
    }

    const timer = setTimeout(startScan, 150)

    return () => {
      active = false

      clearTimeout(timer)

      if (controlsRef.current) {
        controlsRef.current.stop()

        controlsRef.current = null
      }

      setScanning(false)
    }
  }, [
    isOpen,

    mode,

    selectedDeviceId,

    isMediaSupported,

    isSecure,

    onDetected,

    onClose,
  ])

  // Handle image upload / snap multi-pass decoding

  const handleFile = async (file: File) => {
    setError("")

    setDecodingUpload(true)

    const imgUrl = URL.createObjectURL(file)

    setUploadPreview(imgUrl)

    try {
      const img = new Image()

      img.src = imgUrl

      await new Promise((res, rej) => {
        img.onload = res

        img.onerror = rej
      })

      // Run advanced multi-pass barcode decoding (Native BarcodeDetector + 7-pass Canvas ZXing)

      const result = await decodeBarcodeFromImage(img)

      if (result && result.text) {
        playBeep()

        onDetected(result)

        onClose()
      } else {
        setError(
          "Không nhận diện được mã vạch từ ảnh này. Bạn có thể chụp lại gần hơn, hoặc nhập dãy số bên dưới mã vạch.",
        )
      }
    } catch {
      setError(
        "Có lỗi khi phân tích ảnh. Bạn hãy thử ảnh khác hoặc nhập dãy số bên dưới mã vạch.",
      )
    } finally {
      setDecodingUpload(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) handleFile(file)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const clean = manualBarcode.replace(/\s+/g, "").trim()

    if (!clean) return

    playBeep()

    onDetected({
      text: clean,

      format:
        clean.length === 8 ? "EAN_8" : clean.length === 12 ? "UPC_A" : "EAN_13",

      timestamp: Date.now(),
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal title="Quét mã vạch sản phẩm" onClose={onClose}>
      <div className="barcode-scanner-container stack">
        <div
          className="segmented-tabs"
          style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
        >
          {isMediaSupported && (
            <Button
              type="button"
              size="sm"
              variant={mode === "camera" ? "primary" : "secondary"}
              onClick={() => {
                setError("")

                setMode("camera")
              }}
            >
              Camera trực tiếp
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant={mode === "upload" ? "primary" : "secondary"}
            onClick={() => {
              setError("")

              setMode("upload")
            }}
          >
            Chụp / Tải ảnh lên
          </Button>
        </div>

        {error && (
          <div
            className="note-box"
            role="alert"
            style={{
              color: "#991b1b",

              background: "#fee2e2",

              border: "1px solid #f87171",

              borderRadius: "6px",

              padding: "10px 14px",

              fontSize: "13px",

              marginBottom: "10px",
            }}
          >
            {error}
          </div>
        )}

        {!isMediaSupported && (
          <div
            style={{
              fontSize: "13px",

              background: "var(--surface-muted, #f3f4f6)",

              padding: "10px 14px",

              borderRadius: "6px",

              color: "var(--text-muted, #4b5563)",

              marginBottom: "10px",
            }}
          >
            <span
              style={{
                display: "inline-flex",

                alignItems: "center",

                gap: "6px",

                fontWeight: 600,

                color: "var(--brand-primary, #15803d)",
              }}
            >
              <Sparkles size={16} /> Mẹo:
            </span>{" "}
            Trình duyệt yêu cầu kết nối HTTPS hoặc localhost để mở stream video
            trực tiếp. Bạn có thể dùng nút <strong>Chụp ảnh từ Camera</strong>{" "}
            bên dưới để quét mã vạch nhanh bằng máy ảnh.
          </div>
        )}

        {mode === "camera" && isMediaSupported ? (
          <div
            className="scanner-viewport-wrapper"
            style={{
              position: "relative",

              width: "100%",

              minHeight: "260px",

              maxHeight: "360px",

              background: "#000",

              borderRadius: "8px",

              overflow: "hidden",

              display: "flex",

              justifyContent: "center",

              alignItems: "center",
            }}
          >
            <video
              ref={videoRef}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
              playsInline
              autoPlay
            />
            {/* Viewfinder Reticle Overlay */}
            <div
              className="viewfinder-overlay"
              style={{
                position: "absolute",

                width: "75%",

                height: "55%",

                border: "2px solid rgba(34, 197, 94, 0.8)",

                borderRadius: "12px",

                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.45)",

                pointerEvents: "none",

                display: "flex",

                flexDirection: "column",

                justifyContent: "center",

                alignItems: "center",
              }}
            >
              <div
                className="scan-laser"
                style={{
                  width: "100%",

                  height: "2px",

                  background: "#22c55e",

                  boxShadow: "0 0 8px #22c55e",

                  animation: "scanPulse 2s ease-in-out infinite alternate",
                }}
              />
            </div>
            {scanning && (
              <div
                style={{
                  position: "absolute",

                  bottom: "8px",

                  background: "rgba(0, 0, 0, 0.65)",

                  color: "#fff",

                  fontSize: "12px",

                  padding: "4px 8px",

                  borderRadius: "4px",
                }}
              >
                Căn chỉnh mã vạch vào khung xanh
              </div>
            )}
          </div>
        ) : (
          <div
            className="upload-fallback stack"
            style={{
              padding: "20px 16px",

              border: "2px dashed var(--border-color, #d1d5db)",

              borderRadius: "8px",

              textAlign: "center",

              background: "var(--surface-card, #ffffff)",
            }}
          >
            <p
              style={{ margin: "0 0 12px", fontWeight: 500, fontSize: "14px" }}
            >
              Chụp hoặc tải ảnh chứa mã vạch (EAN-13, QR Code, Code 128...)
            </p>

            <div
              style={{
                display: "flex",

                gap: "10px",

                justifyContent: "center",

                flexWrap: "wrap",
              }}
            >
              <label
                className="button primary"
                style={{
                  cursor: "pointer",

                  display: "inline-flex",

                  alignItems: "center",

                  gap: "6px",

                  padding: "10px 18px",

                  borderRadius: "6px",

                  fontSize: "14px",

                  fontWeight: 600,

                  backgroundColor: "var(--primary-color, #2563eb)",

                  color: "#ffffff",
                }}
              >
                <Camera size={16} /> Chụp ảnh từ Camera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleInputChange}
                  style={{ display: "none" }}
                  disabled={decodingUpload}
                />
              </label>

              <label
                className="button secondary"
                style={{
                  cursor: "pointer",

                  display: "inline-flex",

                  alignItems: "center",

                  gap: "6px",

                  padding: "10px 18px",

                  borderRadius: "6px",

                  fontSize: "14px",

                  fontWeight: 500,

                  border: "1px solid var(--border-color, #d1d5db)",

                  backgroundColor: "var(--surface-muted, #f9fafb)",
                }}
              >
                <ImageUp size={16} /> Chọn ảnh từ máy
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  style={{ display: "none" }}
                  disabled={decodingUpload}
                />
              </label>
            </div>

            {decodingUpload && (
              <p
                style={{
                  marginTop: "14px",

                  fontSize: "13px",

                  color: "var(--primary-color, #2563eb)",

                  fontWeight: 500,
                }}
              >
                ⏳ Đang phân tích mã vạch (thử góc xoay 90°/270° & tăng độ tương
                phản)...
              </p>
            )}

            {uploadPreview && !decodingUpload && (
              <div style={{ marginTop: "12px" }}>
                <img
                  src={uploadPreview}
                  alt="Ảnh mã vạch đã chọn"
                  style={{
                    maxHeight: "140px",

                    maxWidth: "100%",

                    borderRadius: "6px",

                    border: "1px solid #e5e7eb",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Manual Barcode Input Fallback */}
        <div
          style={{
            marginTop: "16px",

            padding: "14px",

            background: "var(--surface-muted, #f9fafb)",

            border: "1px solid var(--border-color, #e5e7eb)",

            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "13px",

              fontWeight: 600,

              marginBottom: "8px",

              color: "var(--text-color, #374151)",
            }}
          >
            ⌨️ Hoặc nhập dãy số mã vạch thủ công:
          </div>
          <form
            onSubmit={handleManualSubmit}
            style={{ display: "flex", gap: "8px" }}
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập 8 đến 13 chữ số dưới vạch (VD: 8935001710012)"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              style={{
                flex: 1,

                padding: "8px 12px",

                borderRadius: "6px",

                border: "1px solid var(--border-color, #d1d5db)",

                fontSize: "14px",
              }}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!manualBarcode.trim()}
            >
              Áp dụng
            </Button>
          </form>
          <div
            style={{
              fontSize: "11px",

              color: "var(--text-muted, #6b7280)",

              marginTop: "4px",
            }}
          >
            Mỗi mã vạch đều có dãy số in ngay dưới các sọc đen trắng trên bao
            bì.
          </div>
        </div>

        {videoDevices.length > 1 && mode === "camera" && isMediaSupported && (
          <div
            style={{
              marginTop: "8px",

              display: "flex",

              alignItems: "center",

              gap: "8px",
            }}
          >
            <label htmlFor="camera-select" style={{ fontSize: "13px" }}>
              Đổi camera:
            </label>
            <select
              id="camera-select"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              style={{
                fontSize: "13px",

                padding: "4px 8px",

                borderRadius: "4px",
              }}
            >
              {videoDevices.map((d, idx) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          style={{
            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            marginTop: "16px",
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Chuyển sang điền tay
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  )
}
