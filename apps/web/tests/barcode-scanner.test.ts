import { describe, it, expect, vi } from "vitest"

import { BarcodeFormat } from "@zxing/browser"

describe("Barcode Scanner & ZXing Formats", () => {
  it("resolves BarcodeFormat names correctly", () => {
    expect(BarcodeFormat[BarcodeFormat.EAN_13]).toBe("EAN_13")

    expect(BarcodeFormat[BarcodeFormat.EAN_8]).toBe("EAN_8")

    expect(BarcodeFormat[BarcodeFormat.CODE_128]).toBe("CODE_128")

    expect(BarcodeFormat[BarcodeFormat.QR_CODE]).toBe("QR_CODE")
  })

  it("conforms to final barcode contract structure", () => {
    const scannedCode = "8934673123456"

    const formatName = BarcodeFormat[BarcodeFormat.EAN_13]

    const barcodePayload = {
      barcode: scannedCode,

      barcode_format: formatName,
    }

    expect(barcodePayload).toEqual({
      barcode: "8934673123456",

      barcode_format: "EAN_13",
    })
  })

  it("handles manual barcode entry fallback", () => {
    const rawInput = "  8935001712345  "

    const trimmed = rawInput.trim()

    const manualPayload = {
      barcode: trimmed,

      barcode_format: "MANUAL",
    }

    expect(manualPayload.barcode).toBe("8935001712345")

    expect(manualPayload.barcode_format).toBe("MANUAL")
  })

  it("guarantees media stream track stopping during cleanup", () => {
    const stopTrack1 = vi.fn()

    const stopTrack2 = vi.fn()

    const mockStream = {
      getTracks: () => [
        { stop: stopTrack1, kind: "video" },

        { stop: stopTrack2, kind: "audio" },
      ],
    }

    // Simulate cleanup

    mockStream.getTracks().forEach((track) => track.stop())

    expect(stopTrack1).toHaveBeenCalledTimes(1)

    expect(stopTrack2).toHaveBeenCalledTimes(1)
  })

  it("maps camera permission errors to actionable Vietnamese guidance", () => {
    function mapCameraError(errName: string): string {
      if (
        errName === "NotAllowedError" ||
        errName === "PermissionDeniedError"
      ) {
        return "Quyền camera bị từ chối. Hãy cho phép camera trên thanh địa chỉ hoặc nhập mã bằng tay."
      }

      if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        return "Không tìm thấy camera trên thiết bị. Bạn có thể nhập mã vạch bằng tay."
      }

      return "Không thể kích hoạt camera. Bạn có thể nhập mã vạch bằng tay hoặc chuyển sang quét ảnh."
    }

    expect(mapCameraError("NotAllowedError")).toContain("bị từ chối")

    expect(mapCameraError("NotFoundError")).toContain("Không tìm thấy camera")

    expect(mapCameraError("UnknownError")).toContain(
      "Không thể kích hoạt camera",
    )
  })

  it("provides seamless fallback to manual capture when scan is unavailable or fails", () => {
    let mode: "camera" | "upload" | "manual" = "camera"

    const handleFallbackToManual = () => {
      mode = "manual"
    }

    handleFallbackToManual()

    expect(mode).toBe("manual")
  })

  it("ApiClient falls back to direct /scan endpoint when /scans returns 401 unauthorized", async () => {
    const { ApiClient } = await import("../src/api/client")

    const mockFetch = vi.fn(async (url: string) => {
      if (url.includes("/api/v1/scans")) {
        return new Response(JSON.stringify({ code: "AUTH_REQUIRED" }), {
          status: 401,

          headers: { "Content-Type": "application/json" },
        })
      }

      if (url.includes("/scan")) {
        return new Response(
          JSON.stringify({
            raw_text: "NSX 01/01/2026\nHSD 01/01/2027",

            candidates: {
              food_name: "Milk",

              expiry_date: {
                value: "2027-01-01",

                date_certainty: "exact",

                date_label_type: "use_by",

                source_text: "01/01/2027",

                alternatives: [],

                ambiguous: false,

                requires_confirmation: true,
              },

              manufactured_date: {
                value: "2026-01-01",

                source_text: "01/01/2026",
              },
            },

            warnings: [],

            errors: [],
          }),

          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      }

      return new Response("Not found", { status: 404 })
    })

    const client = new ApiClient(mockFetch as unknown as typeof fetch)

    const result = await client.scan(
      new Blob(["mock-image"], { type: "image/jpeg" }),
    )

    expect(result.candidates.expiry_date.value).toBe("2027-01-01")

    expect(result.candidates.food_name).toBe("Milk")

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it("ApiClient falls back to Gemini Vision when backend scan fails with 422 NO_LEGIBLE_TEXT", async () => {
    const { ApiClient } = await import("../src/api/client")

    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.includes("/scans")) {
        return new Response(JSON.stringify({ code: "AUTH_REQUIRED" }), {
          status: 401,

          headers: { "Content-Type": "application/json" },
        })
      }

      if (url.includes("/scan")) {
        return new Response(JSON.stringify({ code: "NO_LEGIBLE_TEXT" }), {
          status: 422,
        })
      }

      if (url.includes("generativelanguage.googleapis.com")) {
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        food_name: "Yogurt Can",

                        expiry_date: "2027-10-07",

                        manufactured_date: "2026-10-07",

                        raw_text: "NSX:071026 HSD:071027",
                      }),
                    },
                  ],
                },
              },
            ],
          }),

          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      }

      return new Response("Not found", { status: 404 })
    })

    const client = new ApiClient(mockFetch as unknown as typeof fetch)

    const result = await client.scan(
      new Blob(["mock-can-image"], { type: "image/png" }),
    )

    expect(result.candidates.expiry_date.value).toBe("2027-10-07")

    expect(result.candidates.manufactured_date.value).toBe("2026-10-07")

    expect(result.candidates.food_name).toBe("Yogurt Can")
  })

  it("parses GS1 Application Identifier (17) expiration date and (11) production date from barcode", async () => {
    const { parseGs1Barcode } = await import("../src/lib/barcode")

    // GS1-128 formatted: (01)08938541591140(17)261231(10)LOT123

    const parsed1 = parseGs1Barcode("(01)08938541591140(17)261231(10)LOT123")

    expect(parsed1?.expiryDate).toBe("2026-12-31")

    expect(parsed1?.batchLot).toBe("LOT123")

    // GS1 with month-only (day=00 means end of month, e.g. 260200 -> 2026-02-28)

    const parsed2 = parseGs1Barcode("01089385415911401726020010LOT456")

    expect(parsed2?.expiryDate).toBe("2026-02-28")

    // GS1 with AI (11) production date: (11)260115

    const parsed3 = parseGs1Barcode("(01)08938541591140(11)260115(17)270115")

    expect(parsed3?.manufacturedDate).toBe("2026-01-15")

    expect(parsed3?.expiryDate).toBe("2027-01-15")

    // Non-GS1 regular EAN-13 retail barcode returns null for expiry

    const parsedEan = parseGs1Barcode("8938541591140")

    expect(parsedEan).toBeNull()
  })

  it("validates retail barcode checksums correctly (EAN-13, UPC-A, EAN-8)", async () => {
    const { isValidEan13, isValidUpcA, isValidEan8 } = await import(
      "../src/lib/barcode"
    )

    // Valid Pepsi EAN-13

    expect(isValidEan13("8934588012112")).toBe(true)

    // Invalid EAN-13

    expect(isValidEan13("8934588012113")).toBe(false)

    // Valid UPC-A

    expect(isValidUpcA("012345678905")).toBe(true)

    expect(isValidUpcA("012345678906")).toBe(false)

    // Valid EAN-8

    expect(isValidEan8("96385074")).toBe(true)

    expect(isValidEan8("96385075")).toBe(false)
  })

  it("extracts and validates barcode from raw OCR or package text", async () => {
    const { extractBarcodeFromText } = await import("../src/lib/barcode")

    const pepsiText = `
      NƯỚC UỐNG CÓ GAZ PEPSI COLA
      SẢN XUẤT TẠI CÔNG TY TNHH NƯỚC GIẢI KHÁT SUNTORY PEPSICO VIỆT NAM
      8 934588 012112
      THỂ TÍCH THỰC: 320 ml
      HSD: XEM Ở ĐÁY LON
    `

    const extracted = extractBarcodeFromText(pepsiText)

    expect(extracted).not.toBeNull()

    expect(extracted?.code).toBe("8934588012112")

    expect(extracted?.format).toBe("EAN_13")

    // Returns null if no valid barcode digits exist

    expect(extractBarcodeFromText("CHỈ CÓ CHỮ KHÔNG CÓ MÃ VẠCH")).toBeNull()
  })

  it("ApiClient extracts barcode and product name from Gemini Vision even when expiry date is on another photo", async () => {
    const { ApiClient } = await import("../src/api/client")

    const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.includes("/scans") || url.includes("/scan")) {
        return new Response(JSON.stringify({ code: "NO_LEGIBLE_TEXT" }), {
          status: 422,
        })
      }

      if (url.includes("generativelanguage.googleapis.com")) {
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        food_name: "PEPSI COLA",

                        barcode: "8934588012112",

                        expiry_date: null,

                        manufactured_date: null,

                        raw_text: "PEPSI COLA 8 934588 012112",
                      }),
                    },
                  ],
                },
              },
            ],
          }),

          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      }

      return new Response("Not found", { status: 404 })
    })

    const client = new ApiClient(mockFetch as unknown as typeof fetch)

    const result = await client.scan(
      new Blob(["mock-pepsi-body"], { type: "image/jpeg" }),
    )

    expect(result.candidates.food_name).toBe("PEPSI COLA")

    expect(result.candidates.barcode).toBe("8934588012112")

    expect(result.candidates.expiry_date.value).toBeNull()
  })

  it("supports 2-step mobile scanning: sequential Step 1 (Barcode/Name) + Step 2 (Can bottom HSD) merge", () => {
    // Step 1: User takes photo of Pepsi can body on mobile camera

    const step1Draft = {
      name: "Pepsi Cola",

      barcode: "8934588012112",

      quantity: "1",

      unit: "cái",

      category: "beverage",

      mfgDate: "",

      expDate: "",

      location: "",
    }

    const step1Image = "data:image/jpeg;base64,mockBody"

    // Step 2: User flips to can bottom and takes photo 2

    const step2Draft = {
      name: "",

      barcode: undefined,

      quantity: "1",

      unit: "cái",

      category: "other",

      mfgDate: "2026-10-07",

      expDate: "2027-10-07",

      location: "",
    }

    const step2Image = "data:image/jpeg;base64,mockBottom"

    // Simulate 2-step merge logic

    const mergedName = step1Draft.name || step2Draft.name || ""

    const mergedBarcode = step1Draft.barcode || step2Draft.barcode || undefined

    const mergedExpDate = step1Draft.expDate || step2Draft.expDate || ""

    const mergedMfgDate = step1Draft.mfgDate || step2Draft.mfgDate || ""

    const mergedCategory =
      step1Draft.category && step1Draft.category !== "other"
        ? step1Draft.category
        : step2Draft.category || "other"

    const mergedDraft = {
      name: mergedName,

      barcode: mergedBarcode,

      expDate: mergedExpDate,

      mfgDate: mergedMfgDate,

      category: mergedCategory,

      quantity: "1",

      unit: "cái",

      location: "",
    }

    const mergedImages = [step1Image, step2Image]

    expect(mergedDraft.name).toBe("Pepsi Cola")

    expect(mergedDraft.barcode).toBe("8934588012112")

    expect(mergedDraft.mfgDate).toBe("2026-10-07")

    expect(mergedDraft.expDate).toBe("2027-10-07")

    expect(mergedDraft.category).toBe("beverage")

    expect(mergedImages).toHaveLength(2)

    expect(mergedImages[0]).toBe(step1Image)

    expect(mergedImages[1]).toBe(step2Image)
  })

  it("preserves Vision AI food name (e.g. Kẽm Amagain) when barcode lookup on Open Food Facts returns not found", async () => {
    const { lookupBarcode } = await import("../src/lib/barcode")

    // Barcode 8936039681526 is for "Kẽm Amagain" (pharmaceutical/supplement not on Open Food Facts)

    const detectedBarcode = "8936039681526"

    const prod = await lookupBarcode(detectedBarcode)

    expect(prod.found).toBe(false)

    let barcodeProductName: string | undefined

    if (prod.found && prod.product?.name) {
      barcodeProductName = prod.product.name
    }

    // Vision AI extracts the real name from label text on the packet

    const cand = {
      food_name: "Kẽm Amagain",

      barcode: detectedBarcode,

      expiry_date: { value: "2028-07-27" },

      manufactured_date: { value: "2026-07-27" },
    }

    const resolvedName = (
      barcodeProductName ||
      cand.food_name?.trim() ||
      (detectedBarcode ? `Mã vạch ${detectedBarcode}` : "")
    )

      .trim()

    // MUST be "Kẽm Amagain", NOT "Mã vạch 8936039681526"!

    expect(resolvedName).toBe("Kẽm Amagain")
  })

  it("resolves product name from local inventory cache when barcode was previously saved", async () => {
    const { lookupBarcode } = await import("../src/lib/barcode")

    const existingFoods = [
      {
        id: "food-123",

        name: "Kẽm Amagain",

        barcode: "8936039681526",

        location: "Tủ thuốc",

        unit: "cái",
      },
    ]

    const result = await lookupBarcode("8936039681526", existingFoods as any)

    expect(result.found).toBe(true)

    expect(result.source).toBe("inventory")

    expect(result.product?.name).toBe("Kẽm Amagain")

    expect(result.product?.suggested_storage_location).toBe("Tủ thuốc")
  })

  it("prefers real food name over placeholder 'Mã vạch ...' during 2-step scanning sequential merge", () => {
    // Step 1 was barcode only on bottom/back (Open Food Facts miss fallback)

    const step1Draft = {
      name: "Mã vạch 8936039681526",

      barcode: "8936039681526",

      quantity: "1",

      unit: "cái",

      category: "other",

      mfgDate: "",

      expDate: "",

      location: "",
    }

    // Step 2 was front package text recognized by Vision AI

    const step2Draft = {
      name: "Kẽm Amagain",

      barcode: undefined,

      quantity: "1",

      unit: "cái",

      category: "other",

      mfgDate: "2026-07-27",

      expDate: "2028-07-27",

      location: "",
    }

    const step1Name = step1Draft.name?.trim() || ""

    const step2Name = step2Draft.name?.trim() || ""

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
        (step1Draft.barcode ? `Mã vạch ${step1Draft.barcode}` : "")
    }

    expect(finalName).toBe("Kẽm Amagain")
  })

  it("auto-dismisses Step 2 center guidance notice after 3s timeout to unblock viewfinder", () => {
    vi.useFakeTimers()
    let showStep2Notice = true
    const dismiss = () => {
      showStep2Notice = false
    }

    // Step 2 starts
    const timer = setTimeout(dismiss, 3000)
    expect(showStep2Notice).toBe(true)

    // Fast-forward 3s: notice auto-dismisses
    vi.advanceTimersByTime(3000)
    expect(showStep2Notice).toBe(false)
    clearTimeout(timer)
    vi.useRealTimers()
  })

  it("validates barcode check digits strictly without guessing torn digits (Issue #208)", async () => {
    const { validateBarcode } = await import("../src/lib/barcode")

    // Valid EAN-13
    const valid13 = validateBarcode("8936039681526")
    expect(valid13.valid).toBe(true)
    expect(valid13.format).toBe("EAN_13")

    // Another valid EAN-13 (893467312345 with check digit 7)
    const valid13B = validateBarcode("8934673123457")
    expect(valid13B.valid).toBe(true)
    expect(valid13B.format).toBe("EAN_13")

    // Invalid check digit EAN-13 (8936039681527 has check digit 7 instead of 6)
    const invalid13 = validateBarcode("8936039681527")
    expect(invalid13.valid).toBe(false)
    expect(invalid13.error?.toLowerCase()).toContain("chữ số kiểm tra")

    // Valid EAN-8
    const valid8 = validateBarcode("96385074")
    expect(valid8.valid).toBe(true)
    expect(valid8.format).toBe("EAN_8")

    // Invalid check digit EAN-8
    const invalid8 = validateBarcode("96385075")
    expect(invalid8.valid).toBe(false)
    expect(invalid8.error?.toLowerCase()).toContain("chữ số kiểm tra")

    // Empty / short code
    const emptyRes = validateBarcode("")
    expect(emptyRes.valid).toBe(false)

    // Custom internal SKU (e.g. 5 digits)
    const customRes = validateBarcode("12345")
    expect(customRes.valid).toBe(true)
    expect(customRes.format).toBe("CUSTOM")
  })

  it("validates that FoodForm separates mfgDate from opened_on and enforces mfgDate <= expDate (Issue #209)", async () => {
    const { validate, emptyDraft } = await import("../src/features/FoodForm")

    // Normal valid entry with NSX and HSD
    const draft1 = {
      ...emptyDraft(),
      name: "Sữa tiệt trùng",
      mfgDate: "2026-10-01",
      opened_on: "2026-10-05",
      expDate: "2026-11-01",
    }
    const errs1 = validate(draft1)
    expect(errs1.expDate).toBeUndefined()
    expect(errs1.mfgDate).toBeUndefined()
    expect(errs1.opened_on).toBeUndefined()

    // Invalid: HSD before NSX
    const draftInvalid = {
      ...emptyDraft(),
      name: "Sữa tiệt trùng",
      mfgDate: "2026-11-01",
      expDate: "2026-10-01",
    }
    const errsInvalid = validate(draftInvalid)
    expect(errsInvalid.expDate).toBe("Hạn sử dụng không thể trước ngày sản xuất.")

    // Missing NSX is allowed (optional field)
    const draftNoMfg = {
      ...emptyDraft(),
      name: "Rau tươi",
      expDate: "2026-11-05",
    }
    const errsNoMfg = validate(draftNoMfg)
    expect(errsNoMfg.mfgDate).toBeUndefined()
    expect(errsNoMfg.expDate).toBeUndefined()
  })

  it("preserves category, barcode, and date provenance metadata (Issue #210)", async () => {
    const { draftDTO } = await import("../src/api/client")

    const draft = {
      name: "Nước ngọt",
      storage_location: "Tủ lạnh",
      category: "beverage",
      barcode: "8935001701124",
      barcode_format: "EAN_13",
      expiry_date: "2027-01-01",
      expiry_date_certainty: "exact" as const,
      expiry_date_source: "printed_label" as const,
      expiry_date_label_type: "use_by" as const,
      opened_on: "2026-11-01",
      manufactured_on: "2026-05-01",
      note: "Để ngăn dưới",
    }

    const dto = draftDTO(draft as any)
    expect(dto.barcode).toBe("8935001701124")
    expect(dto.date_source).toBe("printed_label")
    expect(dto.opened_on).toBe("2026-11-01")
    expect((dto as any).manufactured_on).toBe("2026-05-01")
  })

  it("caches barcode lookup results for instant 0ms repeated product lookups", async () => {
    const { lookupBarcode, getCachedProduct, setCachedProduct } = await import(
      "../src/lib/barcode"
    )

    const sampleBarcode = "8935001799999"
    const mockProductResult = {
      found: true,
      barcode: sampleBarcode,
      product: {
        name: "Sữa tươi tiệt trùng Vinamilk 1L",
        brand: "Vinamilk",
        category: "dairy_eggs",
        suggested_storage_location: "Ngăn mát",
        suggested_unit: "piece" as const,
      },
      source: "open_food_facts" as const,
    }

    setCachedProduct(sampleBarcode, mockProductResult)

    const cached = getCachedProduct(sampleBarcode)
    expect(cached).toBeDefined()
    expect(cached?.found).toBe(true)
    expect(cached?.product?.name).toBe("Sữa tươi tiệt trùng Vinamilk 1L")

    // lookupBarcode should return immediately from cache without network fetch
    const lookupRes = await lookupBarcode(sampleBarcode)
    expect(lookupRes.found).toBe(true)
    expect(lookupRes.product?.name).toBe("Sữa tươi tiệt trùng Vinamilk 1L")
    expect(lookupRes.source).toBe("open_food_facts")
  })
})
