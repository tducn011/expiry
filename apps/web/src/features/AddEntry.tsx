import { useState } from "react"

import Button from "../components/ui/Button"

import Card from "../components/ui/Card"

import {
  Barcode,
  Camera,
  Keyboard,
  ScanText,
  Sparkles,
} from "../components/ui/Icon"

import PageHeader from "../components/ui/PageHeader"

import ManualBarcodeModal, { type BarcodeDraft } from "./ManualBarcodeModal"

import type { Food } from "../store/appStore"

export interface AddEntryProps {
  onScan: () => void

  onManual: () => void

  onBarcodeSelect?: (draft: BarcodeDraft) => void

  existingFoods?: Food[]

  onBack?: () => void
}

export function AddEntry({
  onScan,

  onManual,

  onBarcodeSelect,

  existingFoods,

  onBack,
}: AddEntryProps) {
  const [showBarcodeModal, setShowBarcodeModal] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="Thêm thực phẩm"
        subtitle="Chọn cách nhập thông tin thuận tiện nhất cho bạn"
        onBack={onBack}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          onClick={onScan}
          className="flex flex-col justify-between gap-6 cursor-pointer border-brand-primary/30 transition-all hover:border-brand-primary hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex flex-col gap-3">
            <div className="flex size-12 items-center justify-center rounded-corner-md bg-brand-primary text-white shadow-xs">
              <Camera size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Quét thông minh
              </h2>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Quét mã vạch và nhận diện HSD tự động bằng AI qua camera 2 bước.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            iconStart={<ScanText size={18} />}
            onClick={onScan}
          >
            Quét bằng camera
          </Button>
        </Card>

        <Card
          onClick={() => setShowBarcodeModal(true)}
          className="flex flex-col justify-between gap-6 cursor-pointer border-border-primary transition-all hover:border-brand-primary hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex flex-col gap-3">
            <div className="flex size-12 items-center justify-center rounded-corner-md bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs">
              <Barcode size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Nhập mã vạch số
              </h2>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Nhập chuỗi số GTIN/EAN khi bao bì rách, mờ hoặc mất nét vạch.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            iconStart={<Barcode size={18} />}
            onClick={() => setShowBarcodeModal(true)}
          >
            Nhập số vạch
          </Button>
        </Card>

        <Card
          onClick={onManual}
          className="flex flex-col justify-between gap-6 cursor-pointer border-border-primary transition-all hover:border-brand-primary hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex flex-col gap-3">
            <div className="flex size-12 items-center justify-center rounded-corner-md bg-brand-tertiary text-brand-primary shadow-xs">
              <Keyboard size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Nhập bằng tay
              </h2>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Tự điền tên, số lượng, nơi lưu trữ và hạn dùng một cách chủ
                động.
              </p>
            </div>
          </div>
          <Button
            variant="neutral"
            iconStart={<Keyboard size={18} />}
            onClick={onManual}
          >
            Nhập tay
          </Button>
        </Card>
      </div>

      <div className="rounded-corner-lg bg-brand-tertiary/60 border border-brand-primary/10 p-4 text-xs text-text-secondary leading-relaxed">
        <p className="font-semibold text-brand-primary mb-1 flex items-center gap-1.5">
          <Sparkles
            size={14}
            className="text-brand-primary"
            aria-hidden="true"
          />
          Mẹo nhỏ:
        </p>
        Nếu chưa rõ hạn sử dụng của thực phẩm, bạn hoàn toàn có thể bỏ trống ô
        HSD — ứng dụng sẽ hiển thị &quot;Chưa rõ HSD&quot; và bạn có thể hẹn
        lịch kiểm tra lại sau.
      </div>

      {showBarcodeModal && (
        <ManualBarcodeModal
          isOpen={showBarcodeModal}
          onClose={() => setShowBarcodeModal(false)}
          existingFoods={existingFoods}
          onSelect={(draft) => {
            setShowBarcodeModal(false)

            if (onBarcodeSelect) {
              onBarcodeSelect(draft)
            } else {
              onManual()
            }
          }}
          onSkip={() => {
            setShowBarcodeModal(false)

            onManual()
          }}
        />
      )}
    </div>
  )
}

export default AddEntry
