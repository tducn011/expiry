import { useEffect, useRef, useState } from "react"
import Button from "../components/ui/Button"
import {
  ArrowLeft,
  Camera,
  CameraOff,
  ImageUp,
  Keyboard,
  Loader2,
  RefreshCw,
  ScanText,
  ShieldAlert,
} from "../components/ui/Icon"
import IconButton from "../components/ui/IconButton"

type ScanState = "idle" | "requesting" | "ready" | "capturing" | "processing" | "unrecognized" | "denied" | "unavailable"

const corners = [
  "left-0 top-0 border-l-4 border-t-4 rounded-tl-corner-md",
  "right-0 top-0 border-r-4 border-t-4 rounded-tr-corner-md",
  "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-corner-md",
  "right-0 bottom-0 border-r-4 border-b-4 rounded-br-corner-md",
]

export function Scanner({
  onBack,
  onManual,
  onReview,
}: {
  onBack: () => void
  onManual: () => void
  onReview: (img: string) => void
}) {
  const [state, setState] = useState<ScanState>("idle")
  const [image, setImage] = useState<string>()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const timer = useRef<number | undefined>(undefined)

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => {
    return () => {
      stop()
      window.clearTimeout(timer.current)
    }
  }, [])

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) return setState("unavailable")
    setImage(undefined)
    setState("requesting")
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      streamRef.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play().catch(() => {})
      }
      setState("ready")
    } catch (err) {
      const name = (err as DOMException)?.name
      setState(
        name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : "unavailable",
      )
    }
  }

  function recognize(img: string) {
    setImage(img)
    setState("processing")
    timer.current = window.setTimeout(() => setState("unrecognized"), 900)
  }

  function capture() {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    setState("capturing")
    const c = document.createElement("canvas")
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext("2d")?.drawImage(v, 0, 0)
    stop()
    recognize(c.toDataURL("image/jpeg", 0.8))
  }

  function onFile(f?: File) {
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      stop()
      recognize(String(r.result))
    }
    r.readAsDataURL(f)
  }

  const leave = (fn: () => void) => () => {
    stop()
    fn()
  }

  const live = state === "ready" || state === "capturing"

  return (
    <div className="flex min-h-[85vh] flex-col rounded-corner-lg bg-surface-darkest text-white shadow-xl overflow-hidden">
      <header className="flex items-center gap-3 px-6 pt-5 pb-3">
        <IconButton
          variant="neutral"
          aria-label="Quay lại"
          icon={<ArrowLeft size={22} />}
          onClick={leave(onBack)}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold truncate">
            Quét nhãn thực phẩm
          </h1>
          <p className="text-xs text-text-tertiary">
            Đưa ngày sản xuất hoặc hạn sử dụng vào khung hình.
          </p>
        </div>
      </header>

      <div className="relative mx-6 my-4 flex min-h-80 flex-1 items-center justify-center overflow-hidden rounded-corner-lg bg-surface-dark">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 size-full object-cover ${
            live ? "" : "hidden"
          }`}
          aria-label="Xem trước camera"
        />
        {image && !live && (
          <img
            src={image}
            alt="Ảnh nhãn đã chụp"
            className="absolute inset-0 size-full object-cover opacity-50"
          />
        )}
        <div
          className="pointer-events-none absolute inset-x-[10%] top-1/2 h-2/5 -translate-y-1/2"
          aria-hidden="true"
        >
          {corners.map((c) => (
            <span
              key={c}
              className={`absolute size-10 border-brand-secondary ${c}`}
            />
          ))}
          {live && (
            <span className="absolute inset-x-4 top-1/2 h-0.5 animate-pulse bg-brand-secondary shadow-sm" />
          )}
        </div>

        <div
          className="relative z-10 flex max-w-xs flex-col items-center gap-3 rounded-corner-lg p-5 text-center bg-black/40 backdrop-blur-xs"
          aria-live="polite"
        >
          {state === "idle" && (
            <>
              <Camera
                size={32}
                aria-hidden="true"
                className="text-brand-secondary"
              />
              <p className="text-sm font-medium">Camera chưa bật</p>
            </>
          )}
          {state === "requesting" && (
            <>
              <Loader2
                size={32}
                className="animate-spin text-brand-secondary"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">Đang xin quyền dùng camera…</p>
            </>
          )}
          {state === "capturing" && (
            <p className="text-sm font-medium">Đang chụp…</p>
          )}
          {state === "processing" && (
            <>
              <Loader2
                size={32}
                className="animate-spin text-brand-secondary"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">Đang đọc nhãn…</p>
            </>
          )}
          {state === "unrecognized" && (
            <>
              <ScanText
                size={32}
                aria-hidden="true"
                className="text-brand-secondary"
              />
              <p className="text-sm font-medium">
                Chưa nhận dạng được chữ trên nhãn
              </p>
              <p className="text-xs text-text-tertiary">
                Bạn có thể dùng ảnh này để đối chiếu và tự nhập thông tin.
              </p>
            </>
          )}
          {state === "denied" && (
            <>
              <ShieldAlert
                size={32}
                aria-hidden="true"
                className="text-status-expired"
              />
              <p className="text-sm font-medium">Chưa có quyền dùng camera</p>
              <p className="text-xs text-text-tertiary">
                Cho phép camera trong cài đặt trình duyệt, hoặc chọn ảnh có sẵn.
              </p>
            </>
          )}
          {state === "unavailable" && (
            <>
              <CameraOff
                size={32}
                aria-hidden="true"
                className="text-status-expired"
              />
              <p className="text-sm font-medium">Không dùng được camera</p>
              <p className="text-xs text-text-tertiary">
                Hãy chọn ảnh nhãn có sẵn hoặc nhập bằng tay.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 px-6 py-2">
        {(state === "idle" || state === "denied") && (
          <Button
            variant="primary"
            iconStart={<Camera size={18} />}
            onClick={start}
          >
            Bật camera
          </Button>
        )}
        {live && (
          <Button
            variant="primary"
            iconStart={<Camera size={18} />}
            onClick={capture}
            disabled={state === "capturing"}
          >
            Chụp
          </Button>
        )}
        {live && (
          <Button
            variant="neutral"
            onClick={() => {
              stop()
              setState("idle")
            }}
          >
            Tắt camera
          </Button>
        )}
        {state === "unrecognized" && image && (
          <>
            <Button
              variant="primary"
              iconStart={<ScanText size={18} />}
              onClick={() => onReview(image)}
            >
              Kiểm tra thông tin
            </Button>
            <Button
              variant="neutral"
              iconStart={<RefreshCw size={18} />}
              onClick={start}
            >
              Quét lại
            </Button>
          </>
        )}
        {state !== "processing" && state !== "requesting" && !live && (
          <Button
            variant="neutral"
            iconStart={<ImageUp size={18} />}
            onClick={() => fileRef.current?.click()}
          >
            {image ? "Chọn ảnh khác" : "Chọn ảnh từ máy"}
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            onFile(e.target.files?.[0])
            e.target.value = ""
          }}
        />
      </div>

      <div className="px-6 pt-3 pb-6">
        <Button
          variant="neutral"
          block
          iconStart={<Keyboard size={18} />}
          onClick={leave(onManual)}
        >
          Nhập bằng tay
        </Button>
      </div>
    </div>
  )
}

export default Scanner
