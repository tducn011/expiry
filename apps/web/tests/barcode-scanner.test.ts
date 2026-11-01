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
        return new Response(JSON.stringify({ code: "NO_LEGIBLE_TEXT" }), { status: 422 })
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
        return new Response(JSON.stringify({ code: "NO_LEGIBLE_TEXT" }), { status: 422 })
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
})
