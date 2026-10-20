import { useState } from "react"

import type { FormEvent } from "react"

import Button from "../components/ui/Button"

import Field from "../components/ui/Field"

import Icon from "../components/ui/Icon"

import Modal, { ModalActions } from "../components/ui/Modal"

export type AuthMode = "login" | "register" | "reauth"

export type AuthSubmitPayload = {
  email: string

  password: string

  display_name?: string
}

export default function AuthForm({
  initialMode = "login",

  initialEmail = "",

  pending,

  error,

  onSubmit,

  onClose,
}: {
  initialMode?: AuthMode

  initialEmail?: string

  pending: boolean

  error: string

  onSubmit: (
    mode: AuthMode,

    input: AuthSubmitPayload,
  ) => Promise<boolean | void>

  onClose: () => void
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const [email, setEmail] = useState(initialEmail)

  const [password, setPassword] = useState("")

  const [name, setName] = useState("")

  const [tried, setTried] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  const cleanEmail = email.trim()

  const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ? ""
    : "Vui lòng nhập địa chỉ email hợp lệ."

  const passwordError =
    [...password].length >= 15 && [...password].length <= 128
      ? ""
      : "Mật khẩu cần từ 15 đến 128 ký tự."

  const nameError =
    mode === "register" && !name.trim() ? "Vui lòng nhập tên hiển thị." : ""

  const switchMode = (next: AuthMode) => {
    setMode(next)

    setTried(false)

    setPassword("")
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    setTried(true)

    if (pending || emailError || passwordError || nameError) return

    await onSubmit(mode, {
      email: cleanEmail,

      password,

      ...(mode === "register" ? { display_name: name.trim() } : {}),
    })
  }

  const reauth = mode === "reauth"

  return (
    <Modal
      title={
        reauth
          ? "Xác thực lại tài khoản"
          : mode === "login"
            ? "Đăng nhập để tiếp tục"
            : "Tạo tài khoản cá nhân"
      }
      eyebrow={reauth ? "PHIÊN ĐÃ HẾT HẠN" : "TÀI KHOẢN CÁ NHÂN"}
      layout="form"
      onClose={() => {
        if (!pending) onClose()
      }}
    >
      <form className="stepped-form" noValidate onSubmit={submit}>
        <div className="form-body">
          <div className="form-grid">
            <p className="inline-hint span-2">
              {reauth
                ? "Đăng nhập lại bằng cùng tài khoản để tiếp tục. Thao tác đang chờ sẽ giữ nguyên mã yêu cầu."
                : "Đăng nhập để thêm món và lưu thay đổi vào tài khoản cá nhân."}
            </p>
            {mode === "register" && (
              <div className="span-2">
                <Field label="Tên hiển thị *" error={tried ? nameError : ""}>
                  <input
                    autoComplete="name"
                    maxLength={100}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={pending}
                  />
                </Field>
              </div>
            )}
            <div className="span-2">
              <Field label="Email *" error={tried ? emailError : ""}>
                <input
                  autoFocus={!reauth}
                  type="email"
                  autoComplete="username"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={pending || reauth}
                  placeholder="tenban@example.com"
                />
              </Field>
            </div>
            <div className="span-2">
              <Field
                label="Mật khẩu *"
                error={tried ? passwordError : ""}
                hint="Từ 15 đến 128 ký tự."
              >
                <div className="auth-password-control">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "register" ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={pending}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <Icon name={showPassword ? "eye-off" : "eye"} />
                  </button>
                </div>
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
              reauth ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => switchMode("login")}
                >
                  Dùng tài khoản khác
                </Button>
              ) : mode === "register" ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => switchMode("login")}
                >
                  Đã có tài khoản? Đăng nhập
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending || reauth}
                  onClick={() => switchMode("register")}
                >
                  Tạo tài khoản mới
                </Button>
              )
            }
            end={
              <Button type="submit" variant="primary" loading={pending}>
                {mode === "register" ? "Tạo tài khoản" : "Đăng nhập"}
              </Button>
            }
          />
        </footer>
      </form>
    </Modal>
  )
}
