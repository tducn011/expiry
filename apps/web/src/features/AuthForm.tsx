import { useState } from "react"
import Button from "../components/ui/Button"
import Field from "../components/ui/Field"
import Modal, { ModalActions } from "../components/ui/Modal"

export default function AuthForm({
  pending,
  error,
  onSubmit,
  onClose,
}: {
  pending: boolean
  error: string
  onSubmit: (
    mode: "login" | "register",
    input: {
      email: string
      password: string
      display_name?: string
    },
  ) => Promise<void>
  onClose: () => void
}) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [tried, setTried] = useState(false)
  const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ? ""
    : "Nhập email hợp lệ."
  const passwordError =
    [...password].length < 15 || [...password].length > 128
      ? "Mật khẩu cần từ 15 đến 128 ký tự."
      : ""
  const nameError =
    mode === "register" && !name.trim() ? "Nhập tên hiển thị." : ""
  return (
    <Modal
      title={mode === "login" ? "Đăng nhập để tiếp tục" : "Tạo tài khoản"}
      eyebrow="TÀI KHOẢN CÁ NHÂN"
      layout="form"
      onClose={() => {
        if (!pending) onClose()
      }}
    >
      <form
        className="stepped-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setTried(true)
          if (!pending && !emailError && !passwordError && !nameError)
            void onSubmit(mode, {
              email: email.trim(),
              password,
              ...(mode === "register" ? { display_name: name.trim() } : {}),
            })
        }}
      >
        <div className="form-body">
          <div className="form-grid">
            <p className="inline-hint span-2">
              Bản nháp được giữ khi bạn đăng nhập lại bằng cùng tài khoản. Nếu
              đổi tài khoản, bản nháp và dữ liệu cũ sẽ được xóa.
            </p>
            {mode === "register" && (
              <div className="span-2">
                <Field label="Tên hiển thị *" error={tried ? nameError : ""}>
                  <input
                    autoComplete="name"
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={pending}
                  />
                </Field>
              </div>
            )}
            <div className="span-2">
              <Field label="Email *" error={tried ? emailError : ""}>
                <input
                  autoFocus
                  type="email"
                  autoComplete="username"
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={pending}
                />
              </Field>
            </div>
            <div className="span-2">
              <Field
                label="Mật khẩu *"
                error={tried ? passwordError : ""}
                hint="Từ 15 đến 128 ký tự."
              >
                <input
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={pending}
                />
              </Field>
            </div>
            {error && (
              <p className="note-box span-2" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
        <footer className="modal-footer">
          <ModalActions
            start={
              <Button
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login")
                  setTried(false)
                  setPassword("")
                }}
              >
                {mode === "login" ? "Tạo tài khoản" : "Đã có tài khoản"}
              </Button>
            }
            end={
              <Button type="submit" variant="primary" loading={pending}>
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </Button>
            }
          />
        </footer>
      </form>
    </Modal>
  )
}
