import { useState } from "react"

import Button from "../components/ui/Button"

import Card from "../components/ui/Card"

import { CircleAlert, Minus, ScanText } from "../components/ui/Icon"

export function Onboarding({ onDone }: { onDone: () => void }) {
  const steps = [
    {
      icon: <ScanText size={36} aria-hidden="true" />,

      t: "Quét nhãn hoặc nhập tay",

      d: "Chụp nhãn bao bì khi tiện, hoặc tự nhập thông tin. Bạn luôn được xem lại và đối chiếu cẩn thận trước khi bấm lưu.",
    },

    {
      icon: <CircleAlert size={36} aria-hidden="true" />,

      t: "Xem món cần chú ý",

      d: "Những thực phẩm sắp hoặc đã quá hạn sử dụng được ưu tiên đưa lên đầu. Expiry tuyệt đối không tự xóa thực phẩm của bạn.",
    },

    {
      icon: <Minus size={36} aria-hidden="true" />,

      t: "Cập nhật số lượng dễ dàng",

      d: "Ghi lại phần đã dùng, đã bỏ hoặc kiểm lại số lượng tồn kho để lượng thực phẩm luôn phản ánh đúng thực tế trong tủ.",
    },
  ]

  const [i, setI] = useState(0)

  const s = steps[i]

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="flex w-full max-w-md flex-col items-center gap-6 text-center shadow-lg border-border-primary/60 p-6 md:p-8">
        <div className="flex size-20 items-center justify-center rounded-corner-full bg-brand-accent text-brand-primary shadow-xs">
          {s.icon}
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">
            {s.t}
          </h1>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
            {s.d}
          </p>
        </div>
        <p className="text-xs font-semibold text-text-tertiary">
          {i + 1} / {steps.length}
        </p>
        <div className="flex w-full gap-3 pt-2">
          <Button variant="subtle" onClick={onDone}>
            Bỏ qua
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => (i < steps.length - 1 ? setI(i + 1) : onDone())}
          >
            {i < steps.length - 1 ? "Tiếp tục" : "Bắt đầu sử dụng"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Onboarding
