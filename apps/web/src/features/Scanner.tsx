import { useEffect, useRef, useState } from "react"

import { api } from "../api/client"

import type { Category } from "../store/appStore"

import type { Draft } from "./FoodForm"

import {
  decodeBarcodeFromImage,
  lookupBarcode,
  parseGs1Barcode,
  extractBarcodeFromText,
  playBeep,
} from "../lib/barcode"

import Button from "../components/ui/Button"

import {
  ArrowLeft,
  Camera,
  CameraOff,
  ChevronRight,
  CircleCheck,
  ImageUp,
  Keyboard,
  Loader2,
  RefreshCw,
  ScanText,
  ShieldAlert,
  Sparkles,
} from "../components/ui/Icon"

import IconButton from "../components/ui/IconButton"

type ScanState =
  | "idle"
  | "requesting"
  | "ready"
  | "capturing"
  | "processing"
  | "step2_ready"
  | "unrecognized"
  | "denied"
  | "unavailable"

type Step1Data = {
  draft: Draft
  image: string
  file?: File | Blob
  detectedType: "product_only" | "date_only"
}

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
  const [step, setStep] = useState<1 | 2>(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)

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
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const libraryInputRef = useRef<HTMLInputElement>(null)
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

      setState(step === 2 && step1Data ? "step2_ready" : "ready")
    } catch (err) {
      const name = (err as DOMException)?.name
      setState(
        name === "NotAllowedError" || name === "SecurityError"
          ? "denied"
          : "unavailable",
      )
    }
  }

  const resetToStep1 = () => {
    setStep(1)
    setStep1Data(null)
    setImage(undefined)
    setImages([])
    setDetectedDraft(undefined)
    if (streamRef.current) {
      setState("ready")
    } else {
      start()
    }
  }

  const skipStep2 = () => {
    stop()
    if (step1Data) {
      onReview(step1Data.image, step1Data.draft)
    }
  }

  async function recognize(img: string, file?: File | Blob) {
    setImage(img)
    setState("processing")
    setDetectedDraft(undefined)

    // 1. Attempt client-side barcode detection from image
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

      if (
        !detectedBarcode &&
        (cand.barcode || extractBarcodeFromText(scanResult.raw_text)?.code)
      ) {
        detectedBarcode =
          cand.barcode || extractBarcodeFromText(scanResult.raw_text)?.code
        if (detectedBarcode) {
          const gs1 = parseGs1Barcode(detectedBarcode)
          if (gs1?.expiryDate && !barcodeExpDate)
            barcodeExpDate = gs1.expiryDate
          if (gs1?.manufacturedDate && !barcodeMfgDate)
            barcodeMfgDate = gs1.manufacturedDate

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
      const name = (
        barcodeProductName ||
        cand.food_name?.trim() ||
        (detectedBarcode ? `Mã vạch ${detectedBarcode}` : "")
      ).trim()

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

      const currentDraft: Draft = {
        name,
        quantity: "1",
        unit: "cái",
        category,
        mfgDate,
        expDate,
        location: "",
        barcode: detectedBarcode,
      }

      // --- 2-STEP SEQUENTIAL SCANNING LOGIC ---
      if (step === 1) {
        const hasDate = Boolean(expDate)
        const hasProduct = Boolean(name || detectedBarcode)

        if (hasDate && hasProduct) {
          // Both date and product name/barcode resolved in photo 1!
          playBeep()
          stop()
          setDetectedDraft(currentDraft)
          onReview(img, currentDraft)
          return
        }

        if (hasProduct && !hasDate) {
          // Found product/barcode (e.g. Pepsi can body), prompt for Step 2 (can bottom HSD)
          playBeep()
          setStep1Data({
            draft: currentDraft,
            image: img,
            file,
            detectedType: "product_only",
          })
          setStep(2)
          setState("step2_ready")
          return
        }

        if (hasDate && !hasProduct) {
          // Found date (e.g. can bottom HSD), prompt for Step 2 (can front/barcode)
          playBeep()
          setStep1Data({
            draft: currentDraft,
            image: img,
            file,
            detectedType: "date_only",
          })
          setStep(2)
          setState("step2_ready")
          return
        }

        setState("unrecognized")
      } else if (step === 2 && step1Data) {
        // Step 2 captured! Merge Step 1 + Step 2 seamlessly
        const finalName =
          step1Data.draft.name ||
          name ||
          (step1Data.draft.barcode
            ? `Mã vạch ${step1Data.draft.barcode}`
            : detectedBarcode
              ? `Mã vạch ${detectedBarcode}`
              : "")
        const finalBarcode =
          step1Data.draft.barcode || detectedBarcode || undefined
        const finalExpDate = step1Data.draft.expDate || expDate || ""
        const finalMfgDate = step1Data.draft.mfgDate || mfgDate || ""
        const finalCategory =
          step1Data.draft.category && step1Data.draft.category !== "other"
            ? step1Data.draft.category
            : category || "other"

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

        playBeep()
        stop()
        setDetectedDraft(mergedDraft)
        onReview([step1Data.image, img], mergedDraft)
      }
    } catch {
      if (step === 1 && (barcodeProductName || detectedBarcode)) {
        playBeep()
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
        setStep1Data({
          draft: fallbackDraft,
          image: img,
          file,
          detectedType: "product_only",
        })
        setStep(2)
        setState("step2_ready")
        return
      }

      if (step === 2 && step1Data) {
        // If step 2 failed to read date, gracefully review with step 1 product
        stop()
        onReview(step1Data.image, step1Data.draft)
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

    const dataUrl = c.toDataURL("image/jpeg", 0.85)

    c.toBlob(
      (blob) => {
        if (blob) {
          const f = new File([blob], `scan-step${step}.jpg`, {
            type: "image/jpeg",
          })
          recognize(dataUrl, f)
        } else {
          recognize(dataUrl)
        }
      },
      "image/jpeg",
      0.85,
    )
  }

  async function onSingleFile(file: File) {
    const dataUrl = await new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.readAsDataURL(file)
    })
    recognize(dataUrl, file)
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
        if (
          !detectedBarcode &&
          (cand.barcode || extractBarcodeFromText(scanResult.raw_text)?.code)
        ) {
          detectedBarcode =
            cand.barcode || extractBarcodeFromText(scanResult.raw_text)?.code
          if (detectedBarcode) {
            const gs1 = parseGs1Barcode(detectedBarcode)
            if (gs1?.expiryDate && !barcodeExpDate)
              barcodeExpDate = gs1.expiryDate
            if (gs1?.manufacturedDate && !barcodeMfgDate)
              barcodeMfgDate = gs1.manufacturedDate

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
      } else if (
        /rau|cải|cà|xà lách|dưa|nấm|táo|cam|chuối|xoài/.test(lower)
      ) {
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
      playBeep()
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
    if (fileList.length === 1) {
      onSingleFile(fileList[0])
    } else {
      stop()
      recognizeBatch(Array.from(fileList))
    }
  }

  const leave = (fn: () => void) => () => {
    stop()
    fn()
  }

  const live =
    state === "ready" ||
    state === "capturing" ||
    (state === "step2_ready" && Boolean(streamRef.current))

  return (
    <div className="flex min-h-[85vh] flex-col rounded-corner-lg bg-surface-darkest text-white shadow-xl overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 pt-5 pb-3">
        <IconButton
          variant="neutral"
          aria-label="Quay lại"
          icon={<ArrowLeft size={22} />}
          onClick={leave(onBack)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold truncate">
              Quét nhãn thực phẩm
            </h1>
            <span className="rounded-full bg-brand-primary/25 border border-brand-primary/40 px-2.5 py-0.5 text-xs font-semibold text-brand-secondary">
              {step === 1 ? "Bước 1/2" : "Bước 2/2"}
            </span>
          </div>
          <p className="text-xs text-text-tertiary truncate">
            {step === 1
              ? "Bước 1: Hướng vào Mã vạch hoặc Mặt trước sản phẩm"
              : step1Data?.detectedType === "product_only"
                ? "Bước 2: Hướng vào Đáy lon, Nắp hộp hoặc Cổ chai để quét HSD"
                : "Bước 2: Hướng vào Mã vạch hoặc Mặt trước để nhận diện tên"}
          </p>
        </div>
      </header>

      {/* 2-Step Sequential Scan Stepper Progress */}
      <div className="flex items-center justify-between px-6 py-2.5 border-y border-white/10 bg-white/5 text-xs">
        <div
          className={`flex items-center gap-1.5 ${
            step1Data
              ? "text-status-good font-medium"
              : step === 1
                ? "text-brand-secondary font-semibold"
                : "text-text-tertiary"
          }`}
        >
          {step1Data ? (
            <CircleCheck size={15} className="text-status-good shrink-0" />
          ) : (
            <span className="size-2 rounded-full bg-brand-secondary shrink-0" />
          )}
          <span className="truncate">1. Mã vạch / Tên</span>
          {step1Data?.draft?.name && (
            <span className="max-w-[110px] truncate text-status-good/90 font-normal">
              ({step1Data.draft.name})
            </span>
          )}
        </div>

        <ChevronRight size={14} className="text-text-tertiary shrink-0" />

        <div
          className={`flex items-center gap-1.5 ${
            step === 2
              ? "text-brand-secondary font-semibold"
              : "text-text-tertiary"
          }`}
        >
          <span
            className={`size-2 rounded-full shrink-0 ${
              step === 2
                ? "bg-brand-secondary animate-pulse"
                : "bg-white/20"
            }`}
          />
          <span className="truncate">2. Hạn sử dụng</span>
        </div>
      </div>

      {/* Viewfinder Preview */}
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

        {/* Reticle Focus Area */}
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

        {/* Status Messages & Overlay */}
        <div
          className="relative z-10 flex max-w-sm flex-col items-center gap-3 rounded-corner-lg p-5 text-center bg-black/60 backdrop-blur-xs shadow-lg mx-4"
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
              <p className="text-xs text-text-tertiary">
                Bấm bật camera hoặc dùng nút chụp ảnh điện thoại bên dưới.
              </p>
            </>
          )}

          {state === "requesting" && (
            <>
              <Loader2
                size={32}
                className="animate-spin text-brand-secondary"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">Đang mở camera…</p>
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
                  : step === 2
                    ? "Đang đọc ngày HSD (Lần 2)…"
                    : "Đang đọc thông tin sản phẩm…"}
              </p>
            </>
          )}

          {state === "step2_ready" && step1Data && (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-1.5 text-status-good font-semibold text-sm">
                <CircleCheck size={18} />
                <span>
                  {step1Data.detectedType === "product_only"
                    ? "Đã nhận diện sản phẩm!"
                    : "Đã đọc ngày HSD!"}
                </span>
              </div>

              {step1Data.detectedType === "product_only" ? (
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm text-brand-secondary truncate max-w-[240px]">
                    {step1Data.draft.name}
                  </p>
                  {step1Data.draft.barcode && (
                    <p className="text-text-tertiary text-[11px]">
                      Mã: {step1Data.draft.barcode}
                    </p>
                  )}
                  <p className="mt-2 text-amber-300 font-medium leading-relaxed">
                    👉 Lật đáy lon hoặc nắp hộp để quét ngày HSD
                  </p>
                </div>
              ) : (
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm text-brand-secondary">
                    HSD: {step1Data.draft.expDate}
                  </p>
                  {step1Data.draft.mfgDate && (
                    <p className="text-text-tertiary text-[11px]">
                      NSX: {step1Data.draft.mfgDate}
                    </p>
                  )}
                  <p className="mt-2 text-amber-300 font-medium leading-relaxed">
                    👉 Hướng vào Mã vạch / Mặt trước để lấy tên sản phẩm
                  </p>
                </div>
              )}
            </div>
          )}

          {state === "unrecognized" && (
            <>
              <ScanText
                size={32}
                aria-hidden="true"
                className="text-brand-secondary"
              />
              <p className="text-sm font-medium">
                Chưa nhận diện được góc chụp này
              </p>
              <p className="text-xs text-text-tertiary">
                Hãy đưa mã vạch hoặc khu vực in ngày (HSD/NSX) vào giữa khung,
                hoặc bấm Kiểm tra để tự điền.
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
                Cho phép camera trong cài đặt trình duyệt, hoặc dùng nút chụp ảnh
                bên dưới.
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
              <p className="text-sm font-medium">Camera trực tiếp chưa khả dụng</p>
              <p className="text-xs text-text-tertiary">
                Hãy dùng nút &quot;Chụp từ máy ảnh điện thoại&quot; bên dưới.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Mobile-Friendly Control Panel */}
      <div className="flex flex-col items-center gap-3 px-6 py-2">
        {/* STEP 2 ACTIONS */}
        {step === 2 && step1Data && state !== "processing" && (
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {live ? (
              <Button
                variant="primary"
                iconStart={<Camera size={20} />}
                onClick={capture}
                disabled={state === "capturing"}
              >
                {step1Data.detectedType === "product_only"
                  ? "Chụp ngày HSD (Đáy lon)"
                  : "Chụp mã vạch / Mặt trước"}
              </Button>
            ) : (
              <Button
                variant="primary"
                iconStart={<Camera size={20} />}
                onClick={() => cameraInputRef.current?.click()}
              >
                {step1Data.detectedType === "product_only"
                  ? "📸 Chụp ngày HSD (Đáy lon)"
                  : "📸 Chụp mã vạch / Mặt trước"}
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                variant="neutral"
                className="flex-1 text-xs"
                iconStart={<ScanText size={16} />}
                onClick={skipStep2}
              >
                Bỏ qua & Xem lại
              </Button>
              <Button
                variant="neutral"
                className="flex-1 text-xs"
                iconStart={<RefreshCw size={16} />}
                onClick={resetToStep1}
              >
                Quét lại từ đầu
              </Button>
            </div>
          </div>
        )}

        {/* STEP 1 ACTIONS */}
        {step === 1 && state !== "processing" && (
          <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-sm">
            {live ? (
              <>
                <Button
                  variant="primary"
                  iconStart={<Camera size={18} />}
                  onClick={capture}
                  disabled={state === "capturing"}
                >
                  Chụp ảnh Bước 1
                </Button>
                <Button
                  variant="neutral"
                  onClick={() => {
                    stop()
                    setState("idle")
                  }}
                >
                  Tắt camera
                </Button>
              </>
            ) : (
              <>
                {(state === "idle" || state === "denied") && (
                  <Button
                    variant="primary"
                    iconStart={<Camera size={18} />}
                    onClick={start}
                  >
                    Bật camera trực tiếp
                  </Button>
                )}
                <Button
                  variant="neutral"
                  iconStart={<Camera size={18} />}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  📸 Chụp từ máy ảnh
                </Button>
                <Button
                  variant="neutral"
                  iconStart={<ImageUp size={18} />}
                  onClick={() => libraryInputRef.current?.click()}
                >
                  🖼️ Thư viện ảnh
                </Button>
              </>
            )}
          </div>
        )}

        {/* Unrecognized Actions */}
        {state === "unrecognized" && (image || images.length > 0) && (
          <div className="flex gap-2 w-full max-w-sm">
            <Button
              variant="primary"
              className="flex-1"
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
              className="flex-1"
              iconStart={<RefreshCw size={18} />}
              onClick={resetToStep1}
            >
              Quét lại
            </Button>
          </div>
        )}

        {/* Native Mobile Camera File Input (triggers device camera app directly) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onSingleFile(f)
            e.target.value = ""
          }}
        />

        {/* Gallery / Multi-photo file input */}
        <input
          ref={libraryInputRef}
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

      {/* Manual Input Fallback */}
      <div className="px-6 pt-2 pb-5">
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
