import { useState } from "react"
import type { Dispatch } from "../store/appStore"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import FieldError from "../components/ui/FieldError"
import { Leaf } from "../components/ui/Icon"
import InputField from "../components/ui/InputField"

export type AuthMode = "welcome" | "login" | "register"

export function AuthForm({
  dispatch,
  onCancel,
  initialMode = "welcome",
}: {
  dispatch: Dispatch
  onCancel: () => void
  initialMode?: AuthMode
}) {
  const [view, setView] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [name, setName] = useState("")
  const [err, setErr] = useState<Record<string, string>>({})

  function submit() {
    const e: Record<string, string> = {}
    if (view === "register" && !name.trim())
      e.name = "Vui lòng nhập tên của bạn."
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Email không hợp lệ."
    if (pw.length < 8) e.pw = "Mật khẩu cần ít nhất 8 ký tự."
    setErr(e)
    if (Object.keys(e).length) return

    dispatch({
      type: "login",
      mode: "account",
      name: name || email.split("@")[0],
    })
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="flex w-full max-w-md flex-col gap-6 shadow-md border-border-primary/60">
        <div className="flex items-center gap-3 text-brand-primary">
          <div className="flex size-10 items-center justify-center rounded-corner-md bg-brand-primary text-white shadow-xs">
            <Leaf size={24} aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight">Expiry</span>
        </div>

        {view === "welcome" ? (
          <>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Biết mình đang có gì, món nào cần chú ý.
              </h1>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Đăng nhập để quản lý kho thực phẩm của riêng bạn, hoặc xem thử
                dữ liệu mẫu có sẵn để khám phá các tính năng.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <Button variant="primary" onClick={() => setView("register")}>
                Tạo tài khoản mới
              </Button>
              <Button variant="neutral" onClick={() => setView("login")}>
                Đăng nhập
              </Button>
              <Button variant="subtle" onClick={onCancel}>
                Xem dữ liệu mẫu (Chế độ xem thử)
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {view === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}
              </h1>
              <p className="mt-1 text-xs text-text-secondary">
                {view === "login"
                  ? "Nhập email và mật khẩu của bạn để đăng nhập."
                  : "Đăng ký để đồng bộ và lưu trữ thực phẩm an toàn."}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {view === "register" && (
                <div>
                  <InputField
                    label="Tên của bạn"
                    placeholder="Ví dụ: Minh, Lan..."
                    value={name}
                    onChange={setName}
                    autoFocus
                  />
                  <FieldError id="err-name" msg={err.name} />
                </div>
              )}
              <div>
                <InputField
                  label="Email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  autoFocus={view === "login"}
                />
                <FieldError id="err-email" msg={err.email} />
              </div>
              <div>
                <InputField
                  label="Mật khẩu"
                  type="password"
                  placeholder="Ít nhất 8 ký tự"
                  value={pw}
                  onChange={setPw}
                  autoComplete={
                    view === "login" ? "current-password" : "new-password"
                  }
                />
                <FieldError id="err-pw" msg={err.pw} />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button variant="primary" onClick={submit}>
                {view === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </Button>
              <Button
                variant="subtle"
                onClick={() => {
                  setErr({})
                  setView(view === "login" ? "register" : "login")
                }}
              >
                {view === "login"
                  ? "Chưa có tài khoản? Tạo mới ngay"
                  : "Đã có tài khoản? Đăng nhập"}
              </Button>
              <Button variant="subtle" onClick={() => setView("welcome")}>
                Quay lại
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default AuthForm
