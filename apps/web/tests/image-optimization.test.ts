import { afterEach, describe, expect, it, vi } from "vitest"

import {
  MAX_OPTIMIZED_IMAGE_BYTES,
  optimizeScanImage,
} from "../src/features/image-optimization"

function makeFile(
  name = "package.png",

  type = "image/png",

  size = 2_000_000,
) {
  return new File([new Uint8Array(size)], name, { type })
}

function mockImageTools({
  width,

  height,

  outputSize,
}: {
  width: number

  height: number

  outputSize: (quality: number, canvasWidth: number) => number
}) {
  const close = vi.fn()

  const drawImage = vi.fn()

  let canvasWidth = 0

  let canvasHeight = 0

  const toBlob = vi.fn(
    (
      callback: BlobCallback,

      _type?: string,

      quality?: number,
    ) => {
      callback(
        new Blob([new Uint8Array(outputSize(quality ?? 1, canvasWidth))]),
      )
    },
  )

  vi.stubGlobal(
    "createImageBitmap",

    vi.fn(async () => ({ width, height, close })),
  )

  vi.stubGlobal("document", {
    createElement: vi.fn(() => ({
      set width(value: number) {
        canvasWidth = value
      },

      get width() {
        return canvasWidth
      },

      set height(value: number) {
        canvasHeight = value
      },

      get height() {
        return canvasHeight
      },

      getContext: vi.fn(() => ({ drawImage })),

      toBlob,
    })),
  })

  return { close, drawImage, toBlob }
}

afterEach(() => {
  vi.unstubAllGlobals()

  vi.restoreAllMocks()
})

describe("optimizeScanImage", () => {
  it("resizes large camera photos and returns a JPEG smaller than 1 MB", async () => {
    const { close, drawImage, toBlob } = mockImageTools({
      width: 4000,

      height: 3000,

      outputSize: () => 450_000,
    })

    const optimized = await optimizeScanImage(
      makeFile("camera-photo.png", "image/png", 20_000_000),
    )

    expect(optimized.type).toBe("image/jpeg")

    expect(optimized.name).toBe("camera-photo.jpg")

    expect(optimized.size).toBeLessThan(MAX_OPTIMIZED_IMAGE_BYTES)

    expect(toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/jpeg",
      0.85,
    )

    expect(drawImage).toHaveBeenCalledWith(
      expect.anything(),

      0,

      0,

      1920,

      1440,
    )

    expect(close).toHaveBeenCalledOnce()
  })

  it("reduces JPEG quality and dimensions until the result is below the limit", async () => {
    const { toBlob } = mockImageTools({
      width: 1920,

      height: 1080,

      outputSize: (quality, canvasWidth) =>
        canvasWidth > 1500 ? 1_100_000 - (0.85 - quality) * 100_000 : 600_000,
    })

    const optimized = await optimizeScanImage(
      makeFile("large.jpg", "image/jpeg"),
    )

    expect(optimized.size).toBeLessThan(MAX_OPTIMIZED_IMAGE_BYTES)

    expect(toBlob.mock.calls.length).toBeGreaterThan(1)
  })

  it("keeps small supported images unchanged", async () => {
    const { toBlob } = mockImageTools({
      width: 1200,

      height: 800,

      outputSize: () => 100_000,
    })

    const file = makeFile("small.webp", "image/webp", 500_000)

    await expect(optimizeScanImage(file)).resolves.toBe(file)

    expect(toBlob).not.toHaveBeenCalled()
  })

  it("decodes octet-stream uploads and converts them to JPEG", async () => {
    mockImageTools({
      width: 800,
      height: 600,
      outputSize: () => 300_000,
    })

    const optimized = await optimizeScanImage(
      makeFile("camera-upload", "application/octet-stream", 500_000),
    )

    expect(optimized.type).toBe("image/jpeg")
    expect(optimized.name).toBe("camera-upload.jpg")
    expect(optimized.size).toBeLessThan(MAX_OPTIMIZED_IMAGE_BYTES)
  })

  it("rejects unsupported files with actionable guidance", async () => {
    await expect(
      optimizeScanImage(makeFile("document.pdf", "application/pdf")),
    ).rejects.toThrow("Chọn ảnh JPEG, PNG hoặc WebP")
  })
})
