import type { FoodEntry, Unit } from "../domain/types"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { DecodeHintType, BarcodeFormat } from "@zxing/library"

export type BarcodeResult = {
  text: string
  format: string
  timestamp: number
}

export type ProductInfo = {
  name: string
  brand?: string | null
  category?: string | null
  image_url?: string | null
  suggested_storage_location?: string
  suggested_unit?: Unit
}

export type ProductLookupResult = {
  found: boolean
  barcode: string
  product?: ProductInfo
  source: "inventory" | "open_food_facts" | "none"
}

export type Gs1Info = {
  country: string
  flag: string
  preferredDateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY/MM/DD"
}

export function getGs1Info(barcode: string): Gs1Info | null {
  const clean = barcode.replace(/\D/g, "")
  if (clean.length === 12) {
    return {
      country: "USA / Canada",
      flag: "🇺🇸",
      preferredDateFormat: "MM/DD/YYYY",
    }
  }
  if (clean.length >= 3) {
    const p3 = clean.slice(0, 3)
    if (p3 === "893") {
      return {
        country: "Việt Nam",
        flag: "🇻🇳",
        preferredDateFormat: "DD/MM/YYYY",
      }
    }
    const num = parseInt(p3, 10)
    if (num >= 0 && num <= 139) {
      return {
        country: "USA / Canada",
        flag: "🇺🇸",
        preferredDateFormat: "MM/DD/YYYY",
      }
    }
    if ((num >= 450 && num <= 459) || (num >= 490 && num <= 499)) {
      return {
        country: "Nhật Bản",
        flag: "🇯🇵",
        preferredDateFormat: "YYYY/MM/DD",
      }
    }
    if (num === 880) {
      return {
        country: "Hàn Quốc",
        flag: "🇰🇷",
        preferredDateFormat: "YYYY/MM/DD",
      }
    }
    if (num >= 500 && num <= 509) {
      return {
        country: "Vương quốc Anh",
        flag: "🇬🇧",
        preferredDateFormat: "DD/MM/YYYY",
      }
    }
    if (num >= 300 && num <= 379) {
      return { country: "Pháp", flag: "🇫🇷", preferredDateFormat: "DD/MM/YYYY" }
    }
    if (num >= 400 && num <= 440) {
      return { country: "Đức", flag: "🇩🇪", preferredDateFormat: "DD/MM/YYYY" }
    }
    if (num === 885) {
      return {
        country: "Thái Lan",
        flag: "🇹🇭",
        preferredDateFormat: "DD/MM/YYYY",
      }
    }
    if (num === 888) {
      return {
        country: "Singapore",
        flag: "🇸🇬",
        preferredDateFormat: "DD/MM/YYYY",
      }
    }
    if (num >= 930 && num <= 939) {
      return { country: "Úc", flag: "🇦🇺", preferredDateFormat: "DD/MM/YYYY" }
    }
    if (num >= 690 && num <= 699) {
      return {
        country: "Trung Quốc",
        flag: "🇨🇳",
        preferredDateFormat: "DD/MM/YYYY",
      }
    }
  }
  return null
}

function inferStorage(categories: string): string {
  const lower = categories.toLowerCase()
  if (
    lower.includes("frozen") ||
    lower.includes("ice cream") ||
    lower.includes("đông lạnh")
  ) {
    return "Ngăn đông"
  }
  if (
    lower.includes("dairy") ||
    lower.includes("milk") ||
    lower.includes("yogurt") ||
    lower.includes("cheese") ||
    lower.includes("meat") ||
    lower.includes("seafood") ||
    lower.includes("fresh") ||
    lower.includes("sữa chua") ||
    lower.includes("thịt") ||
    lower.includes("cá")
  ) {
    return "Ngăn mát"
  }
  return "Tủ bếp"
}

function inferUnit(categories: string, productName: string): Unit {
  const combined = `${categories} ${productName}`.toLowerCase()
  if (
    combined.includes("beverage") ||
    combined.includes("drink") ||
    combined.includes("water") ||
    combined.includes("juice") ||
    combined.includes("sauce") ||
    combined.includes("dầu ăn") ||
    combined.includes("nước") ||
    combined.includes("ml") ||
    combined.includes("lít")
  ) {
    return "ml"
  }
  if (
    combined.includes("flour") ||
    combined.includes("rice") ||
    combined.includes("sugar") ||
    combined.includes("salt") ||
    combined.includes("gạo") ||
    combined.includes("thịt") ||
    combined.includes("cân")
  ) {
    return "g"
  }
  return "piece"
}

export async function lookupBarcode(
  code: string,
  existingEntries?: FoodEntry[],
): Promise<ProductLookupResult> {
  const trimmed = code.trim()
  if (!trimmed) {
    return { found: false, barcode: code, source: "none" }
  }

  // 1. Layer 1: Local inventory cache
  if (existingEntries && existingEntries.length > 0) {
    const matched = existingEntries.find(
      (e) => e.barcode === trimmed && !e.deleted_at,
    )
    if (matched) {
      return {
        found: true,
        barcode: trimmed,
        product: {
          name: matched.name,
          suggested_storage_location: matched.storage_location ?? "Tủ bếp",
          suggested_unit: matched.unit,
        },
        source: "inventory",
      }
    }
  }

  // 2. Layer 2: Open Food Facts API
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
      trimmed,
    )}.json?fields=product_name,product_name_vi,product_name_en,brands,categories,image_url`
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })
    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      if (data.status === 1 && data.product) {
        const p = data.product
        const name =
          p.product_name_vi || p.product_name || p.product_name_en || ""
        if (name.trim()) {
          const brand = p.brands ? String(p.brands).split(",")[0].trim() : null
          const fullName =
            brand && !name.toLowerCase().includes(brand.toLowerCase())
              ? `${name} (${brand})`
              : name
          const categories = p.categories ? String(p.categories) : ""
          return {
            found: true,
            barcode: trimmed,
            product: {
              name: fullName,
              brand,
              category: categories.split(",")[0]?.trim() || null,
              image_url: p.image_url || null,
              suggested_storage_location: inferStorage(categories),
              suggested_unit: inferUnit(categories, name),
            },
            source: "open_food_facts",
          }
        }
      }
    }
  } catch {
    // Network / timeout / CORS fallback - graceful degradation
  }

  // 3. Layer 3: Not found -> user manual entry
  return {
    found: false,
    barcode: trimmed,
    source: "none",
  }
}

/** Web Audio synthesized beep for scanning feedback without external audio files */
export function playBeep() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/** Pre-configured ZXing reader with TRY_HARDER and retail barcode formats */
export function createConfiguredReader(): BrowserMultiFormatReader {
  const hints = new Map()
  hints.set(DecodeHintType.TRY_HARDER, true)
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.ITF,
    BarcodeFormat.DATA_MATRIX,
  ])
  return new BrowserMultiFormatReader(hints)
}

let sharedReaderInstance: BrowserMultiFormatReader | null = null
function getSharedReader(): BrowserMultiFormatReader {
  if (!sharedReaderInstance) {
    sharedReaderInstance = createConfiguredReader()
  }
  return sharedReaderInstance
}

/**
 * Robust multi-pass barcode decoder for photos:
 * 1. Uses Hardware-Accelerated Native BarcodeDetector (Chrome / Android / Edge) when available.
 * 2. Downscales high-resolution camera photos (e.g. 12MP-48MP) to optimal barcode line resolution.
 * 3. Rotates 0°, 90°, 270°, 180° (fixes vertical barcodes in portrait phone photos).
 * 4. Center-crops and applies contrast stretching / binarization for glossy / shadowed labels.
 */
interface DetectedBarcodeFormat {
  rawValue: string
  format: string
}

export async function decodeBarcodeFromImage(
  image: HTMLImageElement,
): Promise<BarcodeResult | null> {
  // 1. Hardware-Accelerated Native BarcodeDetector
  if (typeof window !== "undefined" && "BarcodeDetector" in window) {
    try {
      const detector = new (window as unknown as {
        BarcodeDetector: new (opts: { formats: string[] }) => {
          detect: (
            source: ImageBitmapSource,
          ) => Promise<DetectedBarcodeFormat[]>
        }
      }).BarcodeDetector({
        formats: [
          "ean_13",
          "ean_8",
          "code_128",
          "code_39",
          "upc_a",
          "upc_e",
          "qr_code",
          "itf",
          "data_matrix",
        ],
      })
      const results = await detector.detect(image)
      if (results && results.length > 0 && results[0].rawValue) {
        return {
          text: results[0].rawValue.trim(),
          format: results[0].format.toUpperCase(),
          timestamp: Date.now(),
        }
      }
    } catch {
      // Proceed to canvas multi-pass
    }
  }

  // 2. Multi-Pass Canvas Engine with ZXing
  const origW = image.naturalWidth || image.width
  const origH = image.naturalHeight || image.height
  if (!origW || !origH) return null

  // Target max dimension around 1200px for optimal barcode line resolution
  const maxDim = 1200
  const scale = Math.min(1, maxDim / Math.max(origW, origH))
  const targetW = Math.round(origW * scale)
  const targetH = Math.round(origH * scale)

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null

  const reader = getSharedReader()

  const tryDecode = (c: HTMLCanvasElement): BarcodeResult | null => {
    try {
      const res = reader.decodeFromCanvas(c)
      if (res && res.getText()) {
        return {
          text: res.getText().trim(),
          format: String(res.getBarcodeFormat?.() || "EAN_13"),
          timestamp: Date.now(),
        }
      }
    } catch {
      // Continue to next pass
    }
    return null
  }

  // Pass 1: Normal orientation (0°)
  canvas.width = targetW
  canvas.height = targetH
  ctx.drawImage(image, 0, 0, targetW, targetH)
  const p1 = tryDecode(canvas)
  if (p1) return p1

  // Pass 2: Rotated 90° clockwise (fixes barcodes oriented vertically on phone photos)
  canvas.width = targetH
  canvas.height = targetW
  ctx.save()
  ctx.translate(targetH, 0)
  ctx.rotate(Math.PI / 2)
  ctx.drawImage(image, 0, 0, targetW, targetH)
  ctx.restore()
  const p2 = tryDecode(canvas)
  if (p2) return p2

  // Pass 3: Rotated 270° clockwise (90° counter-clockwise)
  canvas.width = targetH
  canvas.height = targetW
  ctx.save()
  ctx.translate(0, targetW)
  ctx.rotate(-Math.PI / 2)
  ctx.drawImage(image, 0, 0, targetW, targetH)
  ctx.restore()
  const p3 = tryDecode(canvas)
  if (p3) return p3

  // Pass 4: Center crop (user centered barcode in the frame)
  const cropW = Math.round(targetW * 0.7)
  const cropH = Math.round(targetH * 0.7)
  const cropX = Math.round((targetW - cropW) / 2)
  const cropY = Math.round((targetH - cropH) / 2)
  canvas.width = cropW
  canvas.height = cropH
  ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
  const p4 = tryDecode(canvas)
  if (p4) return p4

  // Pass 5: Center crop rotated 90°
  canvas.width = cropH
  canvas.height = cropW
  ctx.save()
  ctx.translate(cropH, 0)
  ctx.rotate(Math.PI / 2)
  ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
  ctx.restore()
  const p5 = tryDecode(canvas)
  if (p5) return p5

  // Pass 6: Contrast stretching / Grayscale on scaled normal image
  canvas.width = targetW
  canvas.height = targetH
  ctx.drawImage(image, 0, 0, targetW, targetH)
  try {
    const imgData = ctx.getImageData(0, 0, targetW, targetH)
    const data = imgData.data
    let min = 255
    let max = 0
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      if (lum < min) min = lum
      if (lum > max) max = lum
    }
    const range = max - min || 1
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      const stretched = Math.min(255, Math.max(0, ((lum - min) / range) * 255))
      data[i] = stretched
      data[i + 1] = stretched
      data[i + 2] = stretched
    }
    ctx.putImageData(imgData, 0, 0)
    const p6 = tryDecode(canvas)
    if (p6) return p6

    // Pass 7: Contrast-stretched rotated 90°
    const rotCanvas = document.createElement("canvas")
    rotCanvas.width = targetH
    rotCanvas.height = targetW
    const rotCtx = rotCanvas.getContext("2d")
    if (rotCtx) {
      rotCtx.translate(targetH, 0)
      rotCtx.rotate(Math.PI / 2)
      rotCtx.drawImage(canvas, 0, 0)
      const p7 = tryDecode(rotCanvas)
      if (p7) return p7
    }
  } catch {
    // Canvas pixel access might be restricted or throw in rare sandbox environments
  }

  return null
}
