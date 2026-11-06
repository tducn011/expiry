import { useEffect, useState } from "react"

import Button from "../components/ui/Button"

import InputField from "../components/ui/InputField"

import Modal from "../components/ui/Modal"

import { Barcode, Lightbulb, Search, Sparkles } from "lucide-react"

import { lookupBarcode, validateBarcode } from "../lib/barcode"

import type { Food } from "../store/appStore"

export interface BarcodeDraft {
  name: string

  barcode: string
}

export interface ManualBarcodeModalProps {
  isOpen: boolean

  onClose: () => void

  existingFoods?: Food[]

  onSelect: (draft: BarcodeDraft) => void

  onSkip?: () => void
}

export function ManualBarcodeModal({
  isOpen,

  onClose,

  existingFoods,

  onSelect,

  onSkip,
}: ManualBarcodeModalProps) {
  const [code, setCode] = useState("")

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [foundName, setFoundName] = useState<string | null>(null)

  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setCode("")

      setLoading(false)

      setError(null)

      setFoundName(null)

      setInfoMessage(null)
    }
  }, [isOpen])

  const handleLookup = async (inputCode: string) => {
    const trimmed = inputCode.trim()

    if (!trimmed) {
      setError("Vui lòng nhập mã số vạch.")

      return
    }

    const check = validateBarcode(trimmed)

    if (!check.valid) {
      setError(check.error || "Mã số vạch không đúng định dạng.")

      setFoundName(null)

      setInfoMessage(null)

      return
    }

    setError(null)

    setLoading(true)

    try {
      const res = await lookupBarcode(trimmed, existingFoods as any)

      if (res.found && res.product?.name) {
        setFoundName(res.product.name)

        setInfoMessage(
          `Đã tìm thấy sản phẩm: ${res.product.name}${
            res.product.brand ? ` (${res.product.brand})` : ""
          }`,
        )
      } else {
        setFoundName(null)

        setInfoMessage(
          "Mã hợp lệ nhưng chưa có trong danh mục. Bạn có thể tự đặt tên cho sản phẩm sau khi bấm tiếp tục.",
        )
      }
    } catch {
      setFoundName(null)

      setInfoMessage(
        "Không thể tra cứu trực tuyến lúc này (ngoại tuyến). Bạn vẫn có thể tiếp tục và đặt tên cho sản phẩm.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    const trimmed = code.trim()

    if (!trimmed) {
      setError("Vui lòng nhập mã vạch.")

      return
    }

    const check = validateBarcode(trimmed)

    if (!check.valid) {
      setError(check.error || "Mã số vạch không đúng định dạng.")

      return
    }

    let finalName = foundName

    if (!finalName) {
      try {
        setLoading(true)

        const res = await lookupBarcode(trimmed, existingFoods as any)

        if (res.found && res.product?.name) {
          finalName = res.product.name
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }

    onSelect({
      name: finalName || `Mã vạch ${trimmed}`,

      barcode: trimmed,
    })

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập mã số vạch thủ công"
      description="Nhập chuỗi số GTIN/EAN in dưới vạch sản phẩm (ví dụ EAN-13 có 13 chữ số) khi bao bì bị mờ hoặc rách."
      size="compact"
      footer={
        <div className="flex flex-col-reverse sm:flex-row w-full justify-between gap-2">
          {onSkip ? (
            <Button
              variant="neutral"
              onClick={() => {
                onClose()

                onSkip()
              }}
            >
              Bỏ qua mã & nhập tên
            </Button>
          ) : (
            <Button variant="neutral" onClick={onClose}>
              Đóng
            </Button>
          )}
          <Button
            variant="primary"
            disabled={!code.trim() || loading}
            onClick={handleApply}
          >
            Tiếp tục vào biểu mẫu
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <InputField
              label="Số mã vạch (EAN / GTIN / UPC)"
              type="text"
              inputMode="numeric"
              placeholder="Ví dụ: 8936039681526"
              value={code}
              autoFocus
              onChange={(valOrEvent: any) => {
                const raw =
                  typeof valOrEvent === "string"
                    ? valOrEvent
                    : (valOrEvent?.target?.value ?? "")

                const val = raw.replace(/[^\d]/g, "")

                setCode(val)

                setError(null)

                setInfoMessage(null)

                setFoundName(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()

                  handleLookup(code)
                }
              }}
              description="Các số từ 0-9 in rõ bên dưới các vạch đen trắng."
            />
          </div>
          <Button
            variant="secondary"
            iconStart={<Search size={16} />}
            disabled={!code.trim() || loading}
            onClick={() => handleLookup(code)}
          >
            {loading ? "Tra cứu…" : "Tra cứu"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-corner-md text-red-700 dark:text-red-300 text-xs leading-relaxed">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-brand-tertiary/60 border border-brand-primary/20 rounded-corner-md text-text-primary text-xs leading-relaxed flex items-start gap-2">
            <Sparkles
              size={16}
              className="text-brand-primary shrink-0 mt-0.5"
            />
            <div>{infoMessage}</div>
          </div>
        )}

        <div className="flex items-start gap-2 text-[11px] text-text-tertiary leading-relaxed bg-bg-secondary p-3 rounded-corner-md">
          <Lightbulb size={14} className="shrink-0 mt-0.5 text-amber-500" />
          <div>
            <strong>Mẹo:</strong> Nếu chữ số bị rách mất một phần, bạn không cần
            đoán số còn thiếu — hãy bấm nút{" "}
            <em>&quot;Bỏ qua mã & nhập tên&quot;</em> để tiếp tục thêm món ăn
            bình thường.
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ManualBarcodeModal
