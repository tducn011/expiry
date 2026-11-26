import { useState } from "react"

import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Minus,
  ScanText,
} from "lucide-react"

import Button from "../components/ui/Button"
import { BrandLockup } from "../components/ui/BrandLockup"

const steps = [
  {
    label: "Thêm thực phẩm",
    icon: <ScanText size={32} aria-hidden="true" />,
    title: "Quét nhãn hoặc nhập tay",
    description:
      "Bạn có thể quét nhãn hoặc nhập thông tin. Hãy xem lại và chỉnh thông tin trước khi lưu.",
  },
  {
    label: "Theo dõi hạn dùng",
    icon: <CircleAlert size={32} aria-hidden="true" />,
    title: "Xem món cần chú ý",
    description:
      "Món sắp hoặc đã quá hạn được ưu tiên hiển thị. Expiry không tự xóa thực phẩm của bạn.",
  },
  {
    label: "Cập nhật số lượng",
    icon: <Minus size={32} aria-hidden="true" />,
    title: "Cập nhật số lượng còn lại",
    description:
      "Ghi phần đã dùng, đã bỏ hoặc kiểm đếm lại để số lượng trong tủ khớp với thực tế.",
  },
]

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [activeStep, setActiveStep] = useState(0)
  const step = steps[activeStep]
  const isLastStep = activeStep === steps.length - 1

  const continueOnboarding = () => {
    if (isLastStep) {
      onDone()
      return
    }

    setActiveStep((current) => current + 1)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-bg">
      <header className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLockup markSize={32} wordmarkSize={20} />
        <Button variant="subtle" size="small" onClick={onDone}>
          Bỏ qua
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-3 flex items-center justify-between gap-4 text-xs font-semibold text-text-secondary">
            <span>HƯỚNG DẪN NHANH</span>
            <span aria-live="polite">
              Bước {activeStep + 1} / {steps.length}
            </span>
          </div>

          <div
            className="mb-5 grid grid-cols-3 gap-2"
            role="progressbar"
            aria-label="Tiến trình hướng dẫn"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={activeStep + 1}
            aria-valuetext={`Bước ${activeStep + 1} trên ${steps.length}`}
          >
            {steps.map((item, index) => (
              <span
                key={item.label}
                className={`h-1.5 rounded-corner-full ${
                  index <= activeStep ? "bg-brand-primary" : "bg-border-subtle"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          <section
            aria-labelledby="onboarding-title"
            className="grid overflow-hidden rounded-corner-lg border border-border-primary/60 bg-surface-bg shadow-xs md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]"
          >
            <div className="relative flex min-h-48 items-center justify-center bg-brand-tertiary p-6 sm:min-h-56 sm:p-8 md:min-h-[360px]">
              <span className="absolute top-6 left-6 text-xs font-semibold tracking-wide text-text-secondary sm:top-8 sm:left-8">
                {String(activeStep + 1).padStart(2, "0")}
              </span>
              <div className="flex size-16 items-center justify-center rounded-corner-lg border border-brand-primary/10 bg-surface-bg text-brand-primary shadow-xs sm:size-20">
                {step.icon}
              </div>
            </div>

            <div className="flex min-h-72 flex-col p-6 sm:p-8 md:min-h-[360px] md:p-10">
              <div aria-live="polite" aria-atomic="true">
                <h1
                  id="onboarding-title"
                  className="mt-3 text-2xl font-semibold leading-tight tracking-normal text-text-heading sm:text-3xl sm:leading-[38px]"
                >
                  {step.title}
                </h1>
                <p className="mt-4 max-w-prose text-base leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:justify-between">
                {activeStep > 0 ? (
                  <Button
                    variant="subtle"
                    iconStart={<ArrowLeft size={16} aria-hidden="true" />}
                    onClick={() => setActiveStep((current) => current - 1)}
                  >
                    Quay lại
                  </Button>
                ) : (
                  <span aria-hidden="true" className="hidden sm:block" />
                )}
                <Button
                  variant="primary"
                  iconEnd={<ArrowRight size={16} aria-hidden="true" />}
                  onClick={continueOnboarding}
                >
                  {isLastStep ? "Bắt đầu sử dụng" : "Tiếp tục"}
                </Button>
              </div>
            </div>
          </section>

          <ol
            className="mt-5 grid grid-cols-3 gap-2"
            aria-label="Các bước hướng dẫn"
          >
            {steps.map((item, index) => (
              <li
                key={item.label}
                aria-current={index === activeStep ? "step" : undefined}
                className={`text-center text-xs leading-snug ${
                  index === activeStep
                    ? "font-semibold text-text-heading"
                    : "text-text-tertiary"
                }`}
              >
                {item.label}
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  )
}

export default Onboarding
