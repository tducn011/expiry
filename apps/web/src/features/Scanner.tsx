import { useEffect, useRef, useState } from "react"

import { api } from "../api/client"

import type { Category } from "../store/appStore"

import type { Draft } from "./FoodForm"

import {
  decodeBarcodeFromImage,
  lookupBarcode,
  parseGs1Barcode,
  extractBarcodeFromText,
} from "../lib/barcode"

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

  onReview: (img: string | string[], draft?: Draft) => void
}) {
  const [state, setState] = useState<ScanState>("idle")

  const [image, setImage] = useState<string>()
  const [images, setImages] = useState<string[]>([])
  const [batchProgress, setBatchProgress] = useState<{
    current: number
    total: number
  } | null>(null)

  const [detectedDraft, setDetectedDraft] = useState<Draft | undefined>(
    undefined,
  )

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

  async function recognize(img: string, file?: File | Blob) {
    setImage(img)

    setState("processing")

    setDetectedDraft(undefined)

    // Attempt client-side barcode detection from image

    let detectedBarcode: string | undefined

    let barcodeProductName: string | undefined

    let barcodeExpDate = ""

    let barcodeMfgDate = ""

    try {
      const htmlImg = new Image()

      htmlImg.src = img

      await new Promise((resolve) => {
        if (htmlImg.complete) resolve(true)
        else htmlImg.onload = () => resolve(true)
      })

      const barcodeRes = await decodeBarcodeFromImage(htmlImg)

      if (barcodeRes && barcodeRes.text) {
        detectedBarcode = barcodeRes.text

        // Check if barcode is GS1 encoding expiry/manufactured date directly
        const gs1 = parseGs1Barcode(detectedBarcode)

        if (gs1?.expiryDate) {
          barcodeExpDate = gs1.expiryDate
        }

        if (gs1?.manufacturedDate) {
          barcodeMfgDate = gs1.manufacturedDate
        }

        const prod = await lookupBarcode(detectedBarcode)

        if (prod.found && prod.product?.name) {
          barcodeProductName = prod.product.name
        } else {
          barcodeProductName = `Mã vạch ${detectedBarcode}`
        }
      }
    } catch {}

    try {
      let uploadFile: File | Blob

      if (file) {
        uploadFile = file
      } else {
        const res = await fetch(img)

        const blob = await res.blob()

        uploadFile = new File([blob], "capture.jpg", { type: "image/jpeg" })
      }

      const scanResult = await api.scan(uploadFile, detectedBarcode)

      const cand = scanResult.candidates

      if (!detectedBarcode && (cand.barcode || extractBarcodeFromText(scanResult.raw_text)?.code)) {
        detectedBarcode = cand.barcode || extractBarcodeFromText(scanResult.raw_text)?.code
        if (detectedBarcode) {
          const gs1 = parseGs1Barcode(detectedBarcode)
          if (gs1?.expiryDate && !barcodeExpDate) barcodeExpDate = gs1.expiryDate
          if (gs1?.manufacturedDate && !barcodeMfgDate) barcodeMfgDate = gs1.manufacturedDate

          const prod = await lookupBarcode(detectedBarcode)
          if (prod.found && prod.product?.name) {
            barcodeProductName = prod.product.name
          } else if (!barcodeProductName) {
            barcodeProductName = `Mã vạch ${detectedBarcode}`
          }
        }
      }

      const expDate = cand.expiry_date?.value || barcodeExpDate || ""

      const mfgDate = cand.manufactured_date?.value || barcodeMfgDate || ""

      const name = (barcodeProductName || cand.food_name?.trim() || (detectedBarcode ? `Mã vạch ${detectedBarcode}` : "")).trim()

      let category: Category | "" = ""

      const lowerName = name.toLowerCase()

      if (/thịt|bò|heo|lợn|gà|vịt|cá|tôm|cua|mực|hải sản/.test(lowerName)) {
        category = "meat_seafood"
      } else if (
        /rau|cải|cà|xà lách|dưa|nấm|táo|cam|chuối|xoài/.test(lowerName)
      ) {
        category = "fresh_produce"
      } else if (/sữa|trứng|phô mai|bơ|yogurt|sữa chua/.test(lowerName)) {
        category = "dairy_eggs"
      } else if (/trà|cà phê|nước|bia|rượu|nước ngọt|nước ép/.test(lowerName)) {
        category = "beverage"
      } else if (/gạo|mì|miến|đường|muối|mắm|tiêu|hạt/.test(lowerName)) {
        category = "dry_pantry"
      } else if (name) {
        category = "other"
      }

      const draft: Draft = {
        name,

        quantity: "1",

        unit: "cái",

        category,

        mfgDate,

        expDate,

        location: "",

        barcode: detectedBarcode,
      }

      setDetectedDraft(draft)

      if (name || expDate || detectedBarcode) {
        onReview(img, draft)
      } else {
        setState("unrecognized")
      }
    } catch {
      if (barcodeProductName || detectedBarcode) {
        const fallbackDraft: Draft = {
          name:
            barcodeProductName ||
            (detectedBarcode ? `Mã vạch ${detectedBarcode}` : ""),

          quantity: "1",

          unit: "cái",

          category: "other",

          mfgDate: barcodeMfgDate,

          expDate: barcodeExpDate,

          location: "",

          barcode: detectedBarcode,
        }

        setDetectedDraft(fallbackDraft)

        onReview(img, fallbackDraft)

        return
      }

      setState("unrecognized")
    }
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

    const dataUrl = c.toDataURL("image/jpeg", 0.85)

    c.toBlob(
      (blob) => {
        if (blob) {
          const f = new File([blob], "scan-capture.jpg", {
            type: "image/jpeg",
          })

          recognizeBatch([f])
        } else {
          recognize(dataUrl)
        }
      },

      "image/jpeg",

      0.85,
    )
  }

  async function recognizeBatch(files: File[]) {
    if (!files || files.length === 0) return
    setState("processing")
    setDetectedDraft(undefined)
    setBatchProgress({ current: 1, total: files.length })

    let finalExpDate = ""
    let finalMfgDate = ""
    let finalName = ""
    let finalBarcode: string | undefined = undefined
    let finalCategory: Category = "other"
    const loadedImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      setBatchProgress({ current: i + 1, total: files.length })
      const file = files[i]
      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.readAsDataURL(file)
      })
      loadedImages.push(dataUrl)

      let detectedBarcode: string | undefined
      let barcodeProductName: string | undefined
      let barcodeExpDate = ""
      let barcodeMfgDate = ""

      try {
        const htmlImg = new Image()
        htmlImg.src = dataUrl
        await new Promise((resolve) => {
          if (htmlImg.complete) resolve(true)
          else htmlImg.onload = () => resolve(true)
        })

        const barcodeRes = await decodeBarcodeFromImage(htmlImg)
        if (barcodeRes && barcodeRes.text) {
          detectedBarcode = barcodeRes.text
          const gs1 = parseGs1Barcode(detectedBarcode)
          if (gs1?.expiryDate) barcodeExpDate = gs1.expiryDate
          if (gs1?.manufacturedDate) barcodeMfgDate = gs1.manufacturedDate

          const prod = await lookupBarcode(detectedBarcode)
          if (prod.found && prod.product?.name) {
            barcodeProductName = prod.product.name
          } else {
            barcodeProductName = `Mã vạch ${detectedBarcode}`
          }
        }
      } catch {}

      try {
        const scanResult = await api.scan(file, detectedBarcode)
        const cand = scanResult.candidates
        if (!detectedBarcode && (cand.barcode || extractBarcodeFromText(scanResult.raw_text)?.code)) {
          detectedBarcode = cand.barcode || extractBarcodeFromText(scanResult.raw_text)?.code
          if (detectedBarcode) {
            const gs1 = parseGs1Barcode(detectedBarcode)
            if (gs1?.expiryDate && !barcodeExpDate) barcodeExpDate = gs1.expiryDate
            if (gs1?.manufacturedDate && !barcodeMfgDate) barcodeMfgDate = gs1.manufacturedDate

            const prod = await lookupBarcode(detectedBarcode)
            if (prod.found && prod.product?.name) {
              barcodeProductName = prod.product.name
            } else if (!barcodeProductName) {
              barcodeProductName = `Mã vạch ${detectedBarcode}`
            }
          }
        }

        if (!finalExpDate && cand.expiry_date?.value) {
          finalExpDate = cand.expiry_date.value
        }
        if (!finalMfgDate && cand.manufactured_date?.value) {
          finalMfgDate = cand.manufactured_date.value
        }
        if (!finalName && cand.food_name?.trim()) {
          finalName = cand.food_name.trim()
        }
      } catch (err) {
        console.warn(`Scan error on image ${i + 1}:`, err)
      }

      if (!finalBarcode && detectedBarcode) finalBarcode = detectedBarcode
      if (!finalExpDate && barcodeExpDate) finalExpDate = barcodeExpDate
      if (!finalMfgDate && barcodeMfgDate) finalMfgDate = barcodeMfgDate
      if (!finalName && barcodeProductName) finalName = barcodeProductName
    }

    setBatchProgress(null)
    setImages(loadedImages)
    setImage(loadedImages[0])

    if (finalName) {
      const lower = finalName.toLowerCase()
      if (/thịt|bò|heo|lợn|gà|vịt|cá|tôm|cua|mực|hải sản/.test(lower)) {
        finalCategory = "meat_seafood"
      } else if (/rau|cải|cà|xà lách|dưa|nấm|táo|cam|chuối|xoài/.test(lower)) {
        finalCategory = "fresh_produce"
      } else if (/sữa|trứng|phô mai|bơ|yogurt|sữa chua/.test(lower)) {
        finalCategory = "dairy_eggs"
      } else if (/trà|cà phê|nước|bia|rượu|nước ngọt|nước ép/.test(lower)) {
        finalCategory = "beverage"
      } else if (/gạo|mì|miến|đường|muối|mắm|tiêu|hạt/.test(lower)) {
        finalCategory = "dry_pantry"
      }
    }

    if (!finalName && finalBarcode) {
      finalName = `Mã vạch ${finalBarcode}`
    }

    const mergedDraft: Draft = {
      name: finalName,
      quantity: "1",
      unit: "cái",
      category: finalCategory,
      mfgDate: finalMfgDate,
      expDate: finalExpDate,
      location: "",
      barcode: finalBarcode,
    }

    setDetectedDraft(mergedDraft)

    if (finalExpDate || finalName || finalBarcode) {
      onReview(
        loadedImages.length > 1 ? loadedImages : loadedImages[0],
        mergedDraft,
      )
    } else {
      setState("unrecognized")
    }
  }

  function onFiles(fileList?: FileList | null) {
    if (!fileList || fileList.length === 0) return
    stop()
    recognizeBatch(Array.from(fileList))
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
              <p className="text-sm font-medium">
                {batchProgress && batchProgress.total > 1
                  ? `Đang đọc ảnh ${batchProgress.current}/${batchProgress.total}…`
                  : "Đang đọc nhãn…"}
              </p>
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
                Chưa tìm thấy ngày HSD trên góc chụp này
              </p>
              <p className="text-xs text-text-tertiary">
                Hãy đưa khu vực in ngày (HSD/EXP/NSX thường ở nắp hoặc đáy hộp)
                vào khung, hoặc bấm Kiểm tra để tự điền.
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
        {state === "unrecognized" && (image || images.length > 0) && (
          <>
            <Button
              variant="primary"
              iconStart={<ScanText size={18} />}
              onClick={() =>
                onReview(
                  images.length > 1 ? images : image || "",
                  detectedDraft,
                )
              }
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
            {image || images.length > 0
              ? "Chọn ảnh khác"
              : "Chọn 1 hoặc nhiều ảnh (Mã vạch + HSD)"}
          </Button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            onFiles(e.target.files)

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
