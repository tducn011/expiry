import { useState } from "react";
import Grid from "../components/layout/Grid";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import type { StatusMode } from "./StatusDialog";

type Prefs = { timezone: string; attention_lead_days: number };
const recoveryCases: [StatusMode, string][] = [["loading", "Đang tải"], ["read", "Lỗi đọc"], ["notfound", "Không tìm thấy"], ["session", "Phiên hết hạn"], ["conflict", "Xung đột"], ["insufficient", "Không đủ lượng"], ["timeout", "Kết quả chưa rõ"], ["rate", "Quá nhiều yêu cầu"]];

/** UI-13 preferences (users.timezone, users.attention_lead_days). */
export default function Settings({ prefs, displayName, onSave, onRecovery }: { prefs: Prefs; displayName: string; onSave: (p: Prefs) => void; onRecovery: (m: StatusMode) => void }) {
  const [days, setDays] = useState(String(prefs.attention_lead_days));
  const [timezone, setTimezone] = useState(prefs.timezone);
  const n = Number(days);
  const error = days === "" || !Number.isInteger(n) || n < 0 || n > 30 ? "Nhập số nguyên từ 0 đến 30." : "";
  return <Grid className="page">
    <PageHeader eyebrow="TÀI KHOẢN VÀ HIỂN THỊ" title="Cài đặt" description="Điều chỉnh cách Expiry tính danh sách cần chú ý." />
    <div className="col-span-full lg:col-span-8 stack">
      <Card title="Thông tin tài khoản"><div className="account-row"><span className="avatar">{displayName.split(" ").pop()?.[0]}</span><div><strong>{displayName}</strong><small>Tài khoản demo · không chỉnh sửa trong app</small></div></div></Card>
      <Card title="Ngày và nhắc trong app">
        <form noValidate className="settings-form" onSubmit={e => { e.preventDefault(); if (!error) onSave({ timezone, attention_lead_days: n }); }}>
          <div className="form-grid">
            <Field label="Múi giờ"><select value={timezone} onChange={e => setTimezone(e.target.value)}><option value="Asia/Ho_Chi_Minh">Việt Nam · Asia/Ho_Chi_Minh</option><option value="Asia/Singapore">Singapore · Asia/Singapore</option><option value="Asia/Tokyo">Tokyo · Asia/Tokyo</option></select></Field>
            <Field label="Nhắc trước (ngày)" error={error} hint="Từ 0 đến 30 ngày."><input type="number" inputMode="numeric" min="0" max="30" value={days} onChange={e => setDays(e.target.value)} /></Field>
          </div>
          <div className="example"><span className="eyebrow">VÍ DỤ</span><p>Với <strong>{error ? "—" : `${n} ngày`}</strong>, món có ngày 10/10 xuất hiện trong “Cần chú ý” {error ? "" : n >= 2 ? "từ hôm nay." : `từ ngày ${String(10 - n).padStart(2, "0")}/10.`}</p></div>
          <div className="form-actions"><Button type="submit">Lưu cài đặt</Button></div>
        </form>
      </Card>
    </div>
    <aside className="rail col-span-full lg:col-span-4">
      <Card title="Thử trạng thái hệ thống" tone="muted"><p className="rail-copy">Chỉ trong prototype. Mô phỏng phản hồi mock API, không thay đổi dữ liệu.</p><div className="chip-actions">{recoveryCases.map(([mode, label]) => <Button key={mode} variant="secondary" onClick={() => onRecovery(mode)}>{label}</Button>)}</div></Card>
      <p className="rail-copy">Expiry chỉ nhắc trong app. Bản demo không gửi push notification hoặc email.</p>
    </aside>
  </Grid>;
}
