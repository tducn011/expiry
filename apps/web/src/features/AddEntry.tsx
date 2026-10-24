import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import { Camera, Keyboard, ScanText } from "../components/ui/Icon"
import PageHeader from "../components/ui/PageHeader"

export function AddEntry({
  onScan,
  onManual,
  onBack,
}: {
  onScan: () => void
  onManual: () => void
  onBack?: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="Thêm thực phẩm"
        subtitle="Chọn cách nhập thông tin thuận tiện nhất cho bạn"
        onBack={onBack}
      />

      <div className="grid gap-4 sm:grid-cols-2">
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
                Quét nhãn thực phẩm
              </h2>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Chụp ảnh bao bì để đối chiếu thông tin ngày sản xuất và hạn sử
                dụng một cách trực quan.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            iconStart={<ScanText size={18} />}
            onClick={onScan}
          >
            Bắt đầu quét
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
                Tự điền tên, số lượng, nơi lưu trữ và hạn dùng theo ý bạn một
                cách nhanh chóng.
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
        <p className="font-semibold text-brand-primary mb-1">💡 Mẹo nhỏ:</p>
        Nếu chưa rõ hạn sử dụng của thực phẩm, bạn hoàn toàn có thể bỏ trống ô
        HSD — ứng dụng sẽ hiển thị &quot;Chưa rõ HSD&quot; và bạn có thể hẹn
        lịch kiểm tra lại sau.
      </div>
    </div>
  )
}

export default AddEntry
