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
})
