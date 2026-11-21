import { useEffect, useRef, useState } from "react"

import { api } from "../api/client"

import type { Category, Food } from "../store/appStore"

import type { Draft } from "./FoodForm"

import { prepareScanImage } from "./image-optimization"

import {
  decodeBarcodeFromImage,
  lookupBarcode,
  parseGs1Barcode,
  extractBarcodeFromText,
  playBeep,
  type ProductLookupResult,
} from "../lib/barcode"

import Button from "../components/ui/Button"

import ManualBarcodeModal from "./ManualBarcodeModal"

import { Barcode } from "lucide-react"

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
} from "lucide-react"

import IconButton from "../components/ui/IconButton"

type ScanState = "idle" | "requesting" | "ready" | "capturing" | "processing" | "step2_ready" | "unrecognized" | "denied" | "unavailable"

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

  existingFoods,
}: {
  onBack: () => void

  onManual: (draft?: Draft, image?: string | string[]) => void

  onReview: (img: string | string[], draft?: Draft) => void

  existingFoods?: Food[]
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

  const [showStep2Notice, setShowStep2Notice] = useState(true)

  const [showManualBarcode, setShowManualBarcode] = useState(false)

  const [fileError, setFileError] = useState("")

  const scanGeneration = useRef(0)

  const videoRef = useRef<HTMLVideoElement>(null)

  const streamRef = useRef<MediaStream | null>(null)

  const libraryInputRef = useRef<HTMLInputElement>(null)

  const timer = useRef<number | undefined>(undefined)

  const isLiveScanningRef = useRef(false)

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())

    streamRef.current = null

    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => {
    return () => {
      scanGeneration.current++

      stop()

      window.clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    if (state === "step2_ready" && step1Data && showStep2Notice) {
      const t = window.setTimeout(() => {
        setShowStep2Notice(false)
      }, 3000)

      return () => window.clearTimeout(t)
    }
  }, [state, step1Data, showStep2Notice])

  // Real-time continuous live frame barcode detection (instant auto-scan)

  useEffect(() => {
    if (state !== "ready" && state !== "step2_ready") return

    let isCancelled = false

    let isProcessingFrame = false

    const hasNativeBarcodeDetector =
      typeof window !== "undefined" && "BarcodeDetector" in window

    const detector = hasNativeBarcodeDetector
      ? new (window as any).BarcodeDetector({
          formats: [
            "ean_13",

            "ean_8",

            "code_128",

            "code_39",

            "upc_a",

            "upc_e",

            "qr_code",
          ],
        })
      : null

    const checkFrame = async () => {
      if (isCancelled || isProcessingFrame || isLiveScanningRef.current) return

      const v = videoRef.current

      if (!v || v.readyState < 2 || !v.videoWidth || !v.videoHeight) return

      isProcessingFrame = true

      try {
        let detectedCode: string | null = null

        if (detector) {
          const detections = await detector.detect(v)

          if (detections && detections.length > 0 && detections[0].rawValue) {
            detectedCode = detections[0].rawValue.trim()
          }
        } else {
          const sampleW = 480

          const sampleH =
            Math.round((v.videoHeight / v.videoWidth) * sampleW) || 360

          const c = document.createElement("canvas")

          c.width = sampleW

          c.height = sampleH

          const ctx = c.getContext("2d", { willReadFrequently: true })

          if (ctx) {
            ctx.drawImage(v, 0, 0, sampleW, sampleH)

            const htmlImg = new Image()

            htmlImg.src = c.toDataURL("image/jpeg", 0.7)

            const barcodeRes = await decodeBarcodeFromImage(htmlImg).catch(
              () => null,
            )

            if (barcodeRes && barcodeRes.text) {
              detectedCode = barcodeRes.text.trim()
            }
          }
        }

        if (detectedCode && !isCancelled && !isLiveScanningRef.current) {
          isLiveScanningRef.current = true

          playBeep()

          capture(detectedCode)
        }
      } catch {
      } finally {
        isProcessingFrame = false
      }
    }

    const intervalId = window.setInterval(checkFrame, 280)

    return () => {
      isCancelled = true

      window.clearInterval(intervalId)
    }
  }, [state, step, step1Data])

  async function start() {
    scanGeneration.current++
    setFileError("")

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
    scanGeneration.current++
    setFileError("")

    isLiveScanningRef.current = false

    setStep(1)

    setShowStep2Notice(true)

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
    scanGeneration.current++

    stop()

    if (step1Data) {
      onReview(step1Data.image, step1Data.draft)
    }
  }

  async function recognize(
    img: string,

    file?: File | Blob,

    preDetectedBarcode?: string,

    generation = ++scanGeneration.current,
  ) {
    if (generation !== scanGeneration.current) return

    setImage(img)

    setState("processing")

    setDetectedDraft(undefined)

    // 1. Attempt client-side barcode detection from image (if not pre-detected)

    let detectedBarcode: string | undefined = preDetectedBarcode

    let barcodeProductName: string | undefined

    let barcodeExpDate = ""

    let barcodeMfgDate = ""

    if (!detectedBarcode) {
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
        }
      } catch {}
    }

    if (generation !== scanGeneration.current) return

    if (detectedBarcode) {
      // Check if barcode is GS1 encoding expiry/manufactured date directly

      const gs1 = parseGs1Barcode(detectedBarcode)

      if (gs1?.expiryDate) barcodeExpDate = gs1.expiryDate

      if (gs1?.manufacturedDate) barcodeMfgDate = gs1.manufacturedDate
    }

    try {
      let uploadFile: File | Blob

      if (file) {
        uploadFile = file
      } else {
        const res = await fetch(img)

        const blob = await res.blob()

        uploadFile = new File([blob], "capture.jpg", { type: "image/jpeg" })
      }

      if (generation !== scanGeneration.current) return

      // Parallelize product metadata lookup & backend OCR scanning for maximum speed

      const lookupPromise: Promise<ProductLookupResult | null> = detectedBarcode
        ? lookupBarcode(detectedBarcode, existingFoods as any).catch(() => ({
            found: false,

            barcode: detectedBarcode!,

            source: "none" as const,
          }))
        : Promise.resolve(null)

      const scanPromise = api.scan(uploadFile, detectedBarcode)

      const [lookupRes, scanResult] = await Promise.all([
        lookupPromise,

        scanPromise,
      ])

      if (generation !== scanGeneration.current) return

      if (lookupRes?.found && lookupRes.product?.name) {
        barcodeProductName = lookupRes.product.name
      }

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

          const prod = await lookupBarcode(
            detectedBarcode,

            existingFoods as any,
          )

          if (prod.found && prod.product?.name) {
            barcodeProductName = prod.product.name
          }
        }
      }

      if (generation !== scanGeneration.current) return

      const expDate = cand.expiry_date?.value || barcodeExpDate || ""

      const mfgDate = cand.manufactured_date?.value || barcodeMfgDate || ""

      const name = (
        barcodeProductName ||
        cand.food_name?.trim() ||
        (detectedBarcode ? `Mã vạch ${detectedBarcode}` : "")
      )

        .trim()

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

        unit: "",

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

          setShowStep2Notice(true)

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

          setShowStep2Notice(true)

          setState("step2_ready")

          return
        }

        setState("unrecognized")
      } else if (step === 2 && step1Data) {
        // Step 2 captured! Merge Step 1 + Step 2 seamlessly

        const step1Name = step1Data.draft.name?.trim() || ""

        const step2Name = name?.trim() || ""

        const isStep1Placeholder = !step1Name || step1Name.startsWith("Mã vạch")

        const isStep2Placeholder = !step2Name || step2Name.startsWith("Mã vạch")

        let finalName = ""

        if (!isStep1Placeholder) {
          finalName = step1Name
        } else if (!isStep2Placeholder) {
          finalName = step2Name
        } else {
          finalName =
            step1Name ||
            step2Name ||
            (step1Data.draft.barcode
              ? `Mã vạch ${step1Data.draft.barcode}`
              : detectedBarcode
                ? `Mã vạch ${detectedBarcode}`
                : "")
        }

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

          unit: "",

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
      if (generation !== scanGeneration.current) return

      if (step === 1 && (barcodeProductName || detectedBarcode)) {
        playBeep()

        const fallbackDraft: Draft = {
          name:
            barcodeProductName ||
            (detectedBarcode ? `Mã vạch ${detectedBarcode}` : ""),

          quantity: "1",

          unit: "",

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

      isLiveScanningRef.current = false

      setState("unrecognized")
    }
  }

  function capture(preDetectedBarcode?: string) {
    const v = videoRef.current

    if (!v || !v.videoWidth) return

    const generation = ++scanGeneration.current

    setState("capturing")

    // Optimize frame resolution: max 1200px dimension preserves full OCR precision while reducing upload payload

    const maxDim = 1200

    const origW = v.videoWidth

    const origH = v.videoHeight

    const scale = Math.min(1, maxDim / Math.max(origW, origH))

    const targetW = Math.round(origW * scale)

    const targetH = Math.round(origH * scale)

    const c = document.createElement("canvas")

    c.width = targetW

    c.height = targetH

    c.getContext("2d")?.drawImage(v, 0, 0, targetW, targetH)

    const dataUrl = c.toDataURL("image/jpeg", 0.8)

    c.toBlob(
      (blob) => {
        if (generation !== scanGeneration.current) return

        if (blob) {
          const f = new File([blob], `scan-step${step}.jpg`, {
            type: "image/jpeg",
          })

          recognize(dataUrl, f, preDetectedBarcode, generation)
        } else {
          recognize(dataUrl, undefined, preDetectedBarcode, generation)
        }
      },

      "image/jpeg",

      0.8,
    )
  }

  async function onSingleFile(file: File) {
    const generation = ++scanGeneration.current
    stop()
    setState("processing")
    setFileError("")
    setImage(undefined)
    setImages([])

    try {
      const prepared = await prepareScanImage(file)
      if (generation !== scanGeneration.current) return
      await recognize(prepared.image, prepared.file, undefined, generation)
    } catch (error) {
      if (generation !== scanGeneration.current) return
      setFileError(
        error instanceof Error
          ? error.message
          : "Không xử lý được ảnh. Hãy thử chọn ảnh khác.",
      )
      setState("unrecognized")
    }
  }

  async function recognizeBatch(files: File[]) {
    if (!files || files.length === 0) return

    const generation = ++scanGeneration.current

    setFileError("")
    setImage(undefined)
    setImages([])

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
      if (generation !== scanGeneration.current) return

      setBatchProgress({ current: i + 1, total: files.length })

      let prepared: Awaited<ReturnType<typeof prepareScanImage>>
      try {
        prepared = await prepareScanImage(files[i])
      } catch (error) {
        if (generation !== scanGeneration.current) return
        setBatchProgress(null)
        setFileError(
          error instanceof Error
            ? error.message
            : "Không xử lý được ảnh. Hãy thử chọn ảnh khác.",
        )
        setState("unrecognized")
        return
      }

      if (generation !== scanGeneration.current) return
      const { file, image: dataUrl } = prepared

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
        }
      } catch {}

      try {
        const lookupPromise: Promise<ProductLookupResult | null> =
          detectedBarcode
            ? lookupBarcode(detectedBarcode, existingFoods as any).catch(
                () => ({
                  found: false,

                  barcode: detectedBarcode!,

                  source: "none" as const,
                }),
              )
            : Promise.resolve(null)

        const scanPromise = api.scan(file, detectedBarcode)

        const [lookupRes, scanResult] = await Promise.all([
          lookupPromise,

          scanPromise,
        ])

        if (generation !== scanGeneration.current) return

        if (lookupRes?.found && lookupRes.product?.name) {
          barcodeProductName = lookupRes.product.name
        }

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

            const prod = await lookupBarcode(
              detectedBarcode,

              existingFoods as any,
            )

            if (prod.found && prod.product?.name) {
              barcodeProductName = prod.product.name
            }
          }
        }

        if (!finalExpDate && cand.expiry_date?.value) {
          finalExpDate = cand.expiry_date.value
        }

        if (!finalMfgDate && cand.manufactured_date?.value) {
          finalMfgDate = cand.manufactured_date.value
        }

        if (cand.food_name?.trim()) {
          if (!finalName || finalName.startsWith("Mã vạch")) {
            finalName = cand.food_name.trim()
          }
        }
      } catch (err) {
        console.warn(`Scan error on image ${i + 1}:`, err)
      }

      if (generation !== scanGeneration.current) return

      if (!finalBarcode && detectedBarcode) finalBarcode = detectedBarcode

      if (!finalExpDate && barcodeExpDate) finalExpDate = barcodeExpDate

      if (!finalMfgDate && barcodeMfgDate) finalMfgDate = barcodeMfgDate

      if (
        barcodeProductName &&
        (!finalName || finalName.startsWith("Mã vạch"))
      ) {
        finalName = barcodeProductName
      }
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

      unit: "",

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
    scanGeneration.current++

    stop()

    fn()
  }

  const live =
    state === "ready" ||
    state === "capturing" ||
    (state === "step2_ready" && Boolean(streamRef.current))

  return (
    <div className="flex h-full w-full max-w-[560px] mx-auto flex-col rounded-none md:rounded-[18px] bg-white border-0 md:border md:border-border-primary p-4 sm:p-6 shadow-none md:shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] text-text-primary overflow-y-auto md:overflow-hidden justify-between gap-3 sm:gap-4 md:h-[680px]">
      {/* Header (Figma Node 711:399) */}
      <div className="flex items-center gap-3 w-full shrink-0">
        <button
          type="button"
          onClick={leave(onBack)}
          aria-label="Quay lại"
          className="font-semibold text-text-heading text-[20px] p-3 -ml-3 rounded-[8px] hover:bg-surface-subtle transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[22px] font-semibold text-text-heading truncate">
          Chụp nhãn
        </h1>
      </div>

      {/* 2-Step Sequential Scan Stepper (Figma Node 711:402) */}
      <div className="border-b border-border-subtle pb-3 flex items-center justify-between text-[13px] w-full shrink-0">
        <div
          className={`flex items-center gap-1.5 ${
            step1Data
              ? "text-status-ok font-semibold"
              : step === 1
                ? "text-brand-primary font-semibold"
                : "text-text-tertiary font-medium"
          }`}
        >
          {step1Data ? (
            <CircleCheck size={16} className="text-status-ok shrink-0" />
          ) : (
            <span
              className={`size-2 rounded-full shrink-0 ${
                step === 1 ? "bg-brand-primary" : "bg-text-tertiary/40"
              }`}
            />
          )}
          <span>1. Mã vạch / Tên</span>
          {step1Data?.draft?.name && (
            <span className="max-w-[120px] truncate text-status-ok font-normal">
              ({step1Data.draft.name})
            </span>
          )}
        </div>

        <span className="text-text-tertiary font-normal">&gt;</span>

        <div
          className={`flex items-center gap-1.5 ${
            step === 2
              ? "text-brand-primary font-semibold"
              : "text-text-tertiary font-medium"
          }`}
        >
          <span
            className={`size-2 rounded-full shrink-0 ${
              step === 2
                ? "bg-brand-primary animate-pulse"
                : "bg-text-tertiary/40"
            }`}
          />
          <span>2. Hạn sử dụng</span>
        </div>
      </div>

      {/* Viewfinder Area (Responsive flex-1 on mobile and desktop) */}
      <div className="bg-brand-tertiary flex flex-1 min-h-[260px] md:min-h-[340px] flex-col items-center justify-center relative rounded-[16px] overflow-hidden w-full">
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
            className="absolute inset-0 size-full object-cover opacity-60"
          />
        )}

        {/* Reticle Focus Area (only when live) */}
        {live && (
          <>
            <div
              className="pointer-events-none absolute inset-x-[12%] top-1/2 h-[55%] -translate-y-1/2"
              aria-hidden="true"
            >
              {corners.map((c) => (
                <span
                  key={c}
                  className={`absolute size-8 border-brand-primary ${c}`}
                />
              ))}
              <span className="absolute inset-x-3 top-1/2 h-0.5 animate-pulse bg-brand-primary/80 shadow-xs" />
            </div>

            {state === "ready" && (
              <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-white/95 border border-border-primary/40 backdrop-blur-sm px-3 py-1 text-[12px] font-medium text-brand-primary shadow-xs">
                <Sparkles
                  size={16}
                  className="animate-pulse text-brand-primary"
                />
                <span>Tự động nhận diện tức thì</span>
              </div>
            )}
          </>
        )}

        {/* Floating Status Card inside Viewfinder (Figma Node 711:407) */}
        {(state === "idle" ||
          state === "requesting" ||
          state === "capturing" ||
          state === "processing" ||
          (state === "step2_ready" && Boolean(step1Data) && showStep2Notice) ||
          state === "unrecognized" ||
          state === "denied" ||
          state === "unavailable") && (
          <div
            className="bg-white border border-border-primary flex flex-col gap-2 items-center justify-center px-5 py-4 relative rounded-[14px] shadow-[0px_3px_8px_0px_rgba(0,0,0,0.06)] shrink-0 w-[280px] text-center z-10 transition-opacity duration-200"
            aria-live="polite"
            onClick={() => {
              if (state === "step2_ready") setShowStep2Notice(false)
            }}
          >
            {state === "idle" && (
              <>
                <Camera
                  size={24}
                  aria-hidden="true"
                  className="text-text-heading shrink-0"
                />
                <p className="text-[16px] font-semibold text-text-heading leading-normal whitespace-nowrap">
                  Camera chưa bật
                </p>
              </>
            )}

            {state === "requesting" && (
              <>
                <Loader2
                  size={24}
                  className="animate-spin text-brand-primary shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[16px] font-semibold text-text-heading">
                  Đang mở camera…
                </p>
              </>
            )}

            {state === "capturing" && (
              <>
                <Loader2
                  size={24}
                  className="animate-spin text-brand-primary shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[16px] font-semibold text-text-heading">
                  Đang chụp…
                </p>
              </>
            )}

            {state === "processing" && (
              <>
                <Loader2
                  size={24}
                  className="animate-spin text-brand-primary shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[16px] font-semibold text-text-heading">
                  {batchProgress && batchProgress.total > 1
                    ? `Đang đọc ảnh ${batchProgress.current}/${batchProgress.total}…`
                    : step === 2
                      ? "Đang đọc ngày HSD (Lần 2)…"
                      : "Đang đọc thông tin sản phẩm…"}
                </p>
              </>
            )}

            {state === "step2_ready" && step1Data && (
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="flex items-center gap-1.5 text-status-ok font-semibold text-sm">
                  <CircleCheck size={16} />
                  <span>
                    {step1Data.detectedType === "product_only"
                      ? "Đã nhận diện sản phẩm!"
                      : "Đã đọc ngày HSD!"}
                  </span>
                </div>

                {step1Data.detectedType === "product_only" ? (
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-sm text-text-heading truncate max-w-[240px]">
                      {step1Data.draft.name}
                    </p>
                    {step1Data.draft.barcode && (
                      <p className="text-text-tertiary text-[12px]">
                        Mã: {step1Data.draft.barcode}
                      </p>
                    )}
                    <p className="mt-1 text-brand-primary font-medium text-[12px] leading-normal">
                      Lật đáy lon hoặc nắp hộp để quét ngày HSD
                    </p>
                  </div>
                ) : (
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-sm text-text-heading">
                      HSD: {step1Data.draft.expDate}
                    </p>
                    {step1Data.draft.mfgDate && (
                      <p className="text-text-tertiary text-[12px]">
                        NSX: {step1Data.draft.mfgDate}
                      </p>
                    )}
                    <p className="mt-1 text-brand-primary font-medium text-[12px] leading-normal">
                      Hướng vào mã vạch hoặc mặt trước để lấy tên sản phẩm
                    </p>
                  </div>
                )}
              </div>
            )}

            {state === "unrecognized" && (
              <>
                <ScanText
                  size={24}
                  aria-hidden="true"
                  className="text-brand-primary shrink-0"
                />
                <p className="text-[16px] font-semibold text-text-heading">
                  Chưa thấy ngày HSD
                </p>
                <p className="text-[12px] text-text-tertiary leading-normal">
                  Hạn sử dụng trên lon/hộp thường in riêng ở{" "}
                  <strong>đáy lon</strong> hoặc <strong>nắp hộp</strong>.
                </p>
              </>
            )}

            {state === "denied" && (
              <>
                <ShieldAlert
                  size={24}
                  aria-hidden="true"
                  className="text-status-soon shrink-0"
                />
                <p className="text-[16px] font-semibold text-text-heading">
                  Chưa có quyền dùng camera
                </p>
                <p className="text-[12px] text-text-tertiary leading-normal">
                  Cho phép camera trong cài đặt trình duyệt hoặc chọn ảnh từ
                  máy.
                </p>
              </>
            )}

            {state === "unavailable" && (
              <>
                <CameraOff
                  size={24}
                  aria-hidden="true"
                  className="text-status-soon shrink-0"
                />
                <p className="text-[16px] font-semibold text-text-heading">
                  Không mở được camera
                </p>
                <p className="text-[12px] text-text-tertiary leading-normal">
                  Camera chưa khả dụng trên thiết bị. Bạn có thể chọn ảnh từ máy
                  hoặc nhập tay.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Control Panel (Figma Node 711:410, 711:413, 711:416) */}
      <div className="flex flex-col gap-2.5 sm:gap-3 w-full shrink-0 mt-auto md:mt-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {fileError && (
          <p
            role="alert"
            className="text-sm text-center text-status-expired font-medium"
          >
            {fileError}
          </p>
        )}

        {/* STEP 2 ACTIONS */}
        {step === 2 && step1Data && state !== "processing" && (
          <>
            {live ? (
              <button
                type="button"
                className="h-[52px] bg-brand-primary hover:bg-brand-hover active:bg-brand-dark text-white rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                onClick={() => capture()}
                disabled={state === "capturing"}
              >
                <Camera size={20} />
                <span>
                  {step1Data.detectedType === "product_only"
                    ? "Chụp ngày HSD (Đáy lon)"
                    : "Chụp mã vạch / Mặt trước"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="h-[52px] bg-brand-primary hover:bg-brand-hover active:bg-brand-dark text-white rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs"
                onClick={() => libraryInputRef.current?.click()}
              >
                <ImageUp size={20} />
                <span>
                  {step1Data.detectedType === "product_only"
                    ? "Chọn ảnh HSD (Đáy lon)"
                    : "Chọn ảnh mã vạch / Mặt trước"}
                </span>
              </button>
            )}

            <button
              type="button"
              className="h-[52px] bg-white border border-brand-primary hover:bg-brand-primary/5 active:bg-brand-primary/10 text-brand-primary rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs"
              onClick={skipStep2}
            >
              <Keyboard size={20} />
              <span>Bỏ qua HSD & Nhập tay</span>
            </button>

            <div className="flex gap-2.5 sm:gap-3 w-full">
              <button
                type="button"
                className="h-[48px] sm:h-[52px] flex-1 bg-white border border-border-primary hover:border-brand-primary/60 hover:bg-surface-hover active:bg-brand-primary/10 rounded-[16px] text-text-primary text-[16px] sm:text-[16px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                onClick={resetToStep1}
              >
                <RefreshCw size={16} />
                <span>Quét lại từ đầu</span>
              </button>
              <button
                type="button"
                className="h-[48px] sm:h-[52px] flex-1 bg-white border border-border-primary hover:border-brand-primary/60 hover:bg-surface-hover active:bg-brand-primary/10 rounded-[16px] text-text-primary text-[16px] sm:text-[16px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                onClick={() => libraryInputRef.current?.click()}
              >
                <ImageUp size={16} />
                <span>Chọn ảnh khác</span>
              </button>
            </div>
          </>
        )}

        {/* STEP 1 ACTIONS */}
        {step === 1 && state !== "processing" && (
          <>
            {live ? (
              <>
                <button
                  type="button"
                  className="h-[52px] bg-brand-primary hover:bg-brand-hover active:bg-brand-dark text-white rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  onClick={() => capture()}
                  disabled={state === "capturing"}
                >
                  <Camera size={20} />
                  <span>Chụp nhãn</span>
                </button>

                <button
                  type="button"
                  className="h-[52px] bg-white border border-brand-primary hover:bg-brand-primary/5 active:bg-brand-primary/10 text-brand-primary rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs"
                  onClick={leave(() => {
                    const currentDraft = step1Data?.draft || detectedDraft
                    const currentImg = step1Data?.image || image
                    onManual(currentDraft, currentImg)
                  })}
                >
                  <Keyboard size={20} />
                  <span>Nhập tay</span>
                </button>

                <div className="flex gap-2.5 sm:gap-3 w-full">
                  <button
                    type="button"
                    className="h-[48px] sm:h-[52px] flex-1 bg-white border border-border-primary hover:border-brand-primary/60 hover:bg-surface-hover active:bg-brand-primary/10 rounded-[16px] text-text-primary text-[16px] sm:text-[16px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    onClick={() => {
                      stop()
                      setState("idle")
                    }}
                  >
                    <span>Tắt camera</span>
                  </button>
                  <button
                    type="button"
                    className="h-[48px] sm:h-[52px] flex-1 bg-white border border-border-primary hover:border-brand-primary/60 hover:bg-surface-hover active:bg-brand-primary/10 rounded-[16px] text-text-primary text-[16px] sm:text-[16px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    onClick={() => setShowManualBarcode(true)}
                  >
                    <Barcode size={16} />
                    <span>Nhập mã vạch</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {state === "unavailable" ? (
                  <button
                    type="button"
                    className="h-[52px] bg-brand-primary hover:bg-brand-hover active:bg-brand-dark text-white rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs"
                    onClick={() => libraryInputRef.current?.click()}
                  >
                    <ImageUp size={20} />
                    <span>Chọn ảnh từ máy</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="h-[52px] bg-brand-primary hover:bg-brand-hover active:bg-brand-dark text-white rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    onClick={start}
                    disabled={state === "requesting"}
                  >
                    <Camera size={20} />
                    <span>Bật camera</span>
                  </button>
                )}

                <button
                  type="button"
                  className="h-[52px] bg-white border border-brand-primary hover:bg-brand-primary/5 active:bg-brand-primary/10 text-brand-primary rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs"
                  onClick={leave(() => {
                    const currentDraft = step1Data?.draft || detectedDraft
                    const currentImg = step1Data?.image || image
                    onManual(currentDraft, currentImg)
                  })}
                >
                  <Keyboard size={20} />
                  <span>Nhập tay</span>
                </button>

                <div className="flex gap-2.5 sm:gap-3 w-full">
                  <button
                    type="button"
                    className="h-[48px] sm:h-[52px] flex-1 bg-white border border-border-primary hover:border-brand-primary/60 hover:bg-surface-hover active:bg-brand-primary/10 rounded-[16px] text-text-primary text-[16px] sm:text-[16px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    onClick={() => libraryInputRef.current?.click()}
                  >
                    <ImageUp size={16} />
                    <span>Thư viện ảnh</span>
                  </button>
                  <button
                    type="button"
                    className="h-[48px] sm:h-[52px] flex-1 bg-white border border-border-primary hover:border-brand-primary/60 hover:bg-surface-hover active:bg-brand-primary/10 rounded-[16px] text-text-primary text-[16px] sm:text-[16px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    onClick={() => setShowManualBarcode(true)}
                  >
                    <Barcode size={16} />
                    <span>Nhập mã vạch</span>
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Unrecognized Actions */}
        {state === "unrecognized" && (
          <>
            {image && (
              <button
                type="button"
                className="h-[52px] bg-brand-primary hover:bg-brand-hover active:bg-brand-dark text-white rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs"
                onClick={() => {
                  setStep1Data({
                    draft: detectedDraft || {
                      name: "",
                      quantity: "1",
                      unit: "",
                      category: "other",
                      mfgDate: "",
                      expDate: "",
                      location: "",
                    },
                    image,
                    detectedType: "product_only",
                  })
                  setStep(2)
                  setState("step2_ready")
                  if (!live) {
                    libraryInputRef.current?.click()
                  }
                }}
              >
                <ImageUp size={20} />
                <span>Chụp thêm góc HSD (Đáy lon / Nắp hộp)</span>
              </button>
            )}

            <button
              type="button"
              className="h-[52px] bg-white border border-brand-primary hover:bg-brand-primary/5 active:bg-brand-primary/10 text-brand-primary rounded-[16px] text-[16px] font-medium flex items-center justify-center gap-2 w-full transition-colors cursor-pointer shadow-xs"
              onClick={() =>
                onReview(
                  images.length > 1 ? images : image || "",
                  detectedDraft,
                )
              }
            >
              <ScanText size={20} />
              <span>Kiểm tra thông tin đã nhận</span>
            </button>

            <div className="flex gap-2.5 sm:gap-3 w-full">
              <button
                type="button"
                className="h-[48px] sm:h-[52px] flex-1 bg-white border border-border-primary hover:border-brand-primary/60 hover:bg-surface-hover active:bg-brand-primary/10 rounded-[16px] text-text-primary text-[16px] sm:text-[16px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                onClick={resetToStep1}
              >
                <RefreshCw size={16} />
                <span>Quét lại từ đầu</span>
              </button>
              <button
                type="button"
                className="h-[48px] sm:h-[52px] flex-1 bg-white border border-border-primary hover:border-brand-primary/60 hover:bg-surface-hover active:bg-brand-primary/10 rounded-[16px] text-text-primary text-[16px] sm:text-[16px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                onClick={leave(() => {
                  const currentDraft = step1Data?.draft || detectedDraft
                  const currentImg = step1Data?.image || image
                  onManual(currentDraft, currentImg)
                })}
              >
                <Keyboard size={16} />
                <span>Nhập tay</span>
              </button>
            </div>
          </>
        )}

        {/* Gallery / File input (triggers device picker / library) */}
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

      {showManualBarcode && (
        <ManualBarcodeModal
          isOpen={showManualBarcode}
          onClose={() => setShowManualBarcode(false)}
          existingFoods={existingFoods}
          onSelect={(barcodeDraft) => {
            setShowManualBarcode(false)

            const draft: Draft = {
              name: barcodeDraft.name,
              barcode: barcodeDraft.barcode,
              quantity: "1",
              unit: "",
              category: "other",
              mfgDate: "",
              expDate: "",
              location: "",
            }

            setStep1Data({
              image: "",
              draft,
              detectedType: "product_only",
            })

            setStep(2)
            setShowStep2Notice(true)
          }}
          onSkip={() => {
            setShowManualBarcode(false)
            onManual?.()
          }}
        />
      )}
    </div>
  )
}

export default Scanner
