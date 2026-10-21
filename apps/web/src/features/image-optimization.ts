const MAX_IMAGE_EDGE = 1920

const MAX_IMAGE_BYTES = 1_000_000

const MIN_IMAGE_EDGE = 320

const JPEG_QUALITIES = [0.85, 0.75, 0.65, 0.55, 0.45, 0.35]

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "application/octet-stream",
  "",
])

type DecodedImage = {
  source: CanvasImageSource

  width: number

  height: number

  close: () => void
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file)

    return {
      source: bitmap,

      width: bitmap.width,

      height: bitmap.height,

      close: () => bitmap.close(),
    }
  }

  const objectUrl = URL.createObjectURL(file)

  const image = new Image()

  image.src = objectUrl

  try {
    await image.decode()
  } catch (error) {
    URL.revokeObjectURL(objectUrl)

    throw error
  }

  return {
    source: image,

    width: image.naturalWidth,

    height: image.naturalHeight,

    close: () => URL.revokeObjectURL(objectUrl),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Không thể tối ưu ảnh. Hãy thử chọn ảnh khác."))

          return
        }

        resolve(blob)
      },

      "image/jpeg",

      quality,
    )
  })
}

export async function optimizeScanImage(file: File): Promise<File> {
  const mediaType = file.type.toLowerCase()

  if (!file.size || !SUPPORTED_IMAGE_TYPES.has(mediaType)) {
    throw new Error("Chọn ảnh JPEG, PNG hoặc WebP để tiếp tục.")
  }

  const image = await decodeImage(file)

  try {
    const requiresJpegConversion =
      mediaType === "application/octet-stream" || mediaType === ""

    if (
      !requiresJpegConversion &&
      image.width <= MAX_IMAGE_EDGE &&
      image.height <= MAX_IMAGE_EDGE &&
      file.size < MAX_IMAGE_BYTES
    ) {
      return file
    }

    let scale = Math.min(
      1,

      MAX_IMAGE_EDGE / image.width,

      MAX_IMAGE_EDGE / image.height,
    )

    const canvas = document.createElement("canvas")

    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error("Không thể xử lý ảnh trên thiết bị này.")
    }

    while (true) {
      canvas.width = Math.max(1, Math.round(image.width * scale))

      canvas.height = Math.max(1, Math.round(image.height * scale))

      context.drawImage(image.source, 0, 0, canvas.width, canvas.height)

      for (const quality of JPEG_QUALITIES) {
        const blob = await canvasToBlob(canvas, quality)

        if (blob.size < MAX_IMAGE_BYTES) {
          const name = file.name.replace(/\.[^.]+$/, "") || "scan-image"

          return new File([blob], `${name}.jpg`, {
            type: "image/jpeg",

            lastModified: file.lastModified,
          })
        }
      }

      if (Math.max(canvas.width, canvas.height) <= MIN_IMAGE_EDGE) {
        throw new Error(
          "Không thể giảm ảnh xuống dưới 1 MB. Hãy thử chọn ảnh khác.",
        )
      }

      scale *= 0.8
    }
  } finally {
    image.close()
  }
}

export const MAX_OPTIMIZED_IMAGE_BYTES = MAX_IMAGE_BYTES
