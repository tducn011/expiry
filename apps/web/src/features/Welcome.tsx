import { useState } from "react"

import Button from "../components/ui/Button"

/** UI-00 onboarding: three short steps before the draft-first add flow. */

export default function Welcome({
  onStart,

  onDemo,

  onSkip,
}: {
  onStart: () => void

  onDemo: () => void

  onSkip?: () => void
}) {
  const [step, setStep] = useState(0)

  const handleSkip = onSkip || onStart

  const steps = [
    {
      number: "01",

      eyebrow: "GHI NHANH",

      title: (
        <>
          Thêm món.
          <br />
          <em>Chỉ vài giây.</em>
        </>
      ),

      body: "Tên, lượng và đơn vị. Thêm ngày theo dõi để nhận nhắc nhở kịp thời.",
    },

    {
      number: "02",

      eyebrow: "BIẾT NGAY",

      title: (
        <>
          Món nào cần
          <br />
          <em>xử lý hôm nay.</em>
        </>
      ),

      body: "Mở app — danh sách cần chú ý hiện ngay. Không cần tìm kiếm.",
    },

    {
      number: "03",

      eyebrow: "QUYẾT ĐỊNH",

      title: (
        <>
          Dùng, bỏ
          <br />
          <em>hoặc sửa ngày.</em>
        </>
      ),

      body: "Mỗi lần cập nhật được lưu lại. Sửa nhầm vẫn có thể kiểm tra lại lịch sử.",
    },
  ]

  const current = steps[step]

  return (
    <div className="welcome">
      <header>
        <span className="wordmark">EXPIRY</span>
        <button className="skip-link" onClick={handleSkip}>
          Bỏ qua
        </button>
      </header>
      <div className="onboarding">
        <section className="welcome-copy" key={step}>
          <span className="eyebrow">{current.eyebrow}</span>
          <h1>{current.title}</h1>
          <p>{current.body}</p>
        </section>
        <aside className="onboarding-index">
          <strong>{current.number}</strong>
          <span>/ 03</span>
        </aside>
        <div className="onboarding-footer">
          <div className="step-dots" aria-label={`Bước ${step + 1} trên 3`}>
            {steps.map((_, index) => (
              <button
                key={index}
                className={index === step ? "active" : ""}
                onClick={() => setStep(index)}
                aria-label={`Đến bước ${index + 1}`}
              />
            ))}
          </div>
          <div>
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                Quay lại
              </Button>
            )}
            {step < 2 ? (
              <Button variant="primary" onClick={() => setStep(step + 1)}>
                Tiếp tục →
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={onDemo}>
                  Xem kho demo
                </Button>
                <Button variant="cta" onClick={onStart}>
                  Bắt đầu ngay →
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
