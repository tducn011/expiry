import { useState } from "react"
import Grid from "../components/layout/Grid"
import PageHeader from "../components/layout/PageHeader"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import Field from "../components/ui/Field"
import Select from "../components/ui/Select"

type Prefs = {
  timezone: string
  attention_lead_days: number
}

export default function Settings({
  prefs,
  displayName,
  onSave,
}: {
  prefs: Prefs
  displayName: string
  onSave: (p: Prefs) => void
}) {
  const [days, setDays] = useState(String(prefs.attention_lead_days))
  const [timezone, setTimezone] = useState(prefs.timezone)
  const n = Number(days)
  const error =
    days === "" || !Number.isInteger(n) || n < 0 || n > 30
      ? "Nhập số từ 0 đến 30."
      : ""

  return (
    <Grid className="page">
      <PageHeader
        eyebrow="TÙY CHỈNH"
        title="Cài đặt"
        description="Quản lý thời gian nhắc và múi giờ."
      />
      <div className="col-span-full lg:col-span-8 stack">
        <Card title="Tài khoản">
          <div className="account-row">
            <span className="avatar">{displayName.split(" ").pop()?.[0]}</span>
            <div>
              <strong>{displayName}</strong>
              <small>Tài khoản cá nhân</small>
            </div>
          </div>
        </Card>

        <Card title="Nhắc trước hạn">
          <form
            noValidate
            className="settings-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (!error) onSave({ timezone, attention_lead_days: n })
            }}
          >
            <div className="form-grid">
              <Field
                label="Nhắc trước (ngày)"
                error={error}
                hint="Báo trước bao nhiêu ngày khi món sắp hết"
              >
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
              </Field>
              <Field label="Múi giờ">
                <Select
                  aria-label="Múi giờ"
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (GMT+7)" },
                    { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
                    { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
                  ]}
                />
              </Field>
            </div>
            <div className="form-actions">
              <Button type="submit" variant="primary">
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Grid>
  )
}
