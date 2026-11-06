import { useState } from "react"
import type { Dispatch } from "../store/appStore"
import { api, ApiError, errorMessage } from "../api/client"
import { Timer } from "lucide-react"
import Notice from "../components/ui/Notice"

export type AuthMode = "login" | "register" | "welcome"

export interface AuthFormProps {
  dispatch: Dispatch
  onCancel: () => void
  initialMode?: AuthMode
}

type FailureType = "INVALID_CREDENTIALS" | "EMAIL_ALREADY_USED" | "NETWORK_FAILURE" | "RATE_LIMITED" | "UNKNOWN" | null

export function AuthForm({
  dispatch,
  onCancel,
  initialMode = "login",
}: AuthFormProps) {
  // If "welcome" is passed, we default to "login" as specified in the updated Figma design
  const [view, setView] = useState<"login" | "register">(
    initialMode === "register" ? "register" : "login",
  )

  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [name, setName] = useState("")

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [failureType, setFailureType] = useState<FailureType>(null)
  const [customErrorMsg, setCustomErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  // Clear errors when switching modes, but keep user inputs for recovery (H30)
  const switchMode = (newMode: "login" | "register") => {
    setView(newMode)
    setFieldErrors({})
    setFailureType(null)
    setCustomErrorMsg("")
  }

  // Clear specific field error on change
  const handleEmailChange = (val: string) => {
    setEmail(val)
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.email
        return next
      })
    }
  }

  const handlePwChange = (val: string) => {
    setPw(val)
    if (fieldErrors.pw) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.pw
        return next
      })
    }
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (fieldErrors.name) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next.name
        return next
      })
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()

    const errors: Record<string, string> = {}

    if (view === "register" && !name.trim()) {
      errors.name = "Vui lòng nhập tên của bạn."
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Email không hợp lệ."
    }

    if (pw.length < 8) {
      errors.pw = "Mật khẩu cần ít nhất 8 ký tự."
    }

    setFieldErrors(errors)
    setFailureType(null)
    setCustomErrorMsg("")

    if (Object.keys(errors).length > 0) {
      return
    }

    setLoading(true)

    try {
      const mode = view === "register" ? "register" : "login"
      const session = await api.authenticate(mode, {
        email: email.trim(),
        password: pw,
        display_name: view === "register" ? name.trim() : undefined,
      })

      dispatch({
        type: "login",
        mode: "account",
        name: session.user?.display_name || name.trim() || email.split("@")[0],
        userId: session.user?.id,
      })

      onCancel()
    } catch (failure: unknown) {
      if (failure instanceof ApiError) {
        if (failure.code === "INVALID_CREDENTIALS") {
          setFailureType("INVALID_CREDENTIALS")
          setFieldErrors({
            email: "Email hoặc mật khẩu chưa đúng.",
            pw: "Email hoặc mật khẩu chưa đúng.",
          })
        } else if (
          failure.code === "EMAIL_ALREADY_REGISTERED" ||
          failure.code === "EMAIL_ALREADY_USED"
        ) {
          setFailureType("EMAIL_ALREADY_USED")
          setFieldErrors({
            email: "Email đã được sử dụng.",
          })
        } else if (failure.code === "AUTH_RATE_LIMITED") {
          setFailureType("RATE_LIMITED")
          setCustomErrorMsg(
            "Đã thử đăng nhập nhiều lần. Vui lòng chờ ít phút rồi thử lại.",
          )
        } else {
          setFailureType("UNKNOWN")
          setCustomErrorMsg(
            errorMessage(failure.status, failure.code) ||
              "Không thể xác thực tài khoản.",
          )
        }
      } else {
        // Network or server connectivity issue
        setFailureType("NETWORK_FAILURE")
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid =
    email.trim().length > 0 &&
    pw.length >= 8 &&
    (view === "login" || name.trim().length > 0) &&
    Object.keys(fieldErrors).length === 0

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row items-stretch font-sans">
      {/* =========================================================================
          WEB / DESKTOP (lg: >= 1024px): Brand Story Column (Figma node 1477:9 / 1477:59)
          Exact dimensions: w-[620px] on 1440px desktop, pt-[62px] px-[64px] pb-[42px]
         ========================================================================= */}
      <div className="hidden lg:flex flex-col w-[480px] xl:w-[560px] 2xl:w-[620px] shrink-0 bg-[#06464b] text-white pt-[62px] px-10 xl:px-[64px] pb-[42px] select-none">
        {/* Brand header (y=62) */}
        <div className="flex items-center gap-3">
          <Timer size={40} color="#ffffff" className="shrink-0" />
          <span className="font-bold text-[21px] text-white tracking-tight">
            Expiry
          </span>
        </div>

        {/* Spacing 95px -> Heading (y=233) */}
        <div className="mt-[95px]">
          <h2 className="font-bold text-[32px] xl:text-[36px] text-white leading-[1.3] text-left">
            Biết mình có gì.
            <br />
            Dùng thực phẩm đúng lúc.
          </h2>
          <p className="mt-4 text-[#e6f5ef] text-[16px] xl:text-[17px] leading-relaxed text-left max-w-[488px]">
            Theo dõi thực phẩm, ngày sử dụng và nơi bảo quản trong cùng một ứng
            dụng.
          </p>
        </div>

        {/* Spacing 38px -> Minh họa danh sách thực phẩm (Figma node 1477:18, y=479) */}
        <div className="mt-[38px] bg-[#f2faf6] rounded-[20px] p-6 w-full max-w-[492px] shadow-sm">
          <p className="font-semibold text-[16px] text-[#06464b]">
            Kho thực phẩm của bạn
          </p>
          <div className="my-3.5 h-px bg-[#d9e5e5]" />
          <div className="flex flex-col gap-3 text-[13px] font-medium text-[#0f172a]">
            <div className="flex items-center justify-between">
              <span>Rau xanh</span>
              <span className="text-[#526171] font-normal">Trong ngăn mát</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sữa tươi</span>
              <span className="text-[#526171] font-normal">Cần dùng sớm</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Trứng</span>
              <span className="text-[#526171] font-normal">Trong ngăn mát</span>
            </div>
          </div>
        </div>

        {/* Spacing 32px -> Brand story footer (y=743) */}
        <p className="mt-[32px] text-[13px] text-[#cfe6e2]">
          Quản lý thực phẩm dễ dàng mỗi ngày.
        </p>
      </div>

      {/* =========================================================================
          FORM AREA (Both Web Desktop and Mobile App Responsive views)
          - Web Desktop: pt-[102px], px-[190px], max-w-[440px]
          - Mobile App: pt-11, px-4, max-w-[390px]
         ========================================================================= */}
      <div className="flex-1 min-h-screen flex flex-col items-center pt-11 lg:pt-[102px] pb-12 px-4 sm:px-6 lg:px-12 xl:px-16 bg-white overflow-y-auto">
        <div className="w-full max-w-[358px] sm:max-w-[390px] lg:max-w-[440px] flex flex-col">
          {/* Brand header (y=102 on Web Desktop) */}
          <div className="flex items-center gap-3">
            <Timer
              size={36}
              color="#015D67"
              className="lg:w-[40px] lg:h-[40px] shrink-0"
            />
            <span className="font-bold text-[21px] text-[#015d67] tracking-tight">
              Expiry
            </span>
          </div>

          {/* Heading and Subtitle (y=228 on Web Desktop, aligns with left heading y=233) */}
          <div className="mt-10 lg:mt-[86px]">
            <h1 className="font-bold text-[24px] lg:text-[30px] text-[#0f172a] leading-tight text-left">
              {view === "login"
                ? "Chào mừng bạn trở lại"
                : "Tạo tài khoản Expiry"}
            </h1>
            <p className="mt-2 text-[14px] lg:text-[16px] text-[#526171] text-left leading-normal">
              {view === "login"
                ? "Đăng nhập để tiếp tục quản lý thực phẩm của bạn."
                : "Bắt đầu theo dõi thực phẩm và hạn sử dụng dễ dàng hơn."}
            </p>
          </div>

          {/* Failure Alert Notice according to Figma specifications */}
          {failureType === "INVALID_CREDENTIALS" && (
            <div className="mt-6">
              <Notice
                tone="Error"
                title="Không thể đăng nhập"
                body="Email hoặc mật khẩu chưa đúng. Kiểm tra lại thông tin."
              />
            </div>
          )}

          {failureType === "EMAIL_ALREADY_USED" && (
            <div className="mt-6">
              <Notice
                tone="Error"
                title="Email đã được sử dụng"
                body="Hãy sử dụng email khác hoặc đăng nhập vào tài khoản hiện có."
              />
            </div>
          )}

          {failureType === "NETWORK_FAILURE" && (
            <div className="mt-6">
              <Notice
                tone="Error"
                title="Không thể kết nối"
                body="Kiểm tra kết nối mạng và thử lại. Thông tin đã nhập vẫn được giữ."
              />
            </div>
          )}

          {(failureType === "RATE_LIMITED" || failureType === "UNKNOWN") && (
            <div className="mt-6">
              <Notice
                tone="Error"
                title="Thông tin cần chú ý"
                body={customErrorMsg}
              />
            </div>
          )}

          {/* Form fields: inputs directly styled without wrapper div to prevent nested borders */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 lg:mt-9 flex flex-col gap-4 w-full"
            noValidate
          >
            {/* Field: Tên của bạn (Only for register mode) */}
            {view === "register" && (
              <div className="flex flex-col gap-1.5 w-full">
                <label
                  htmlFor="auth-name"
                  className="font-semibold text-[13px] lg:text-[14px] text-[#0f172a] text-left"
                >
                  Tên của bạn
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Minh Anh"
                  autoComplete="name"
                  autoFocus
                  className={`h-[48px] w-full rounded-[10px] lg:rounded-[12px] bg-white px-3.5 text-[16px] text-[#0f172a] placeholder:text-[#586572] outline-none transition-colors border ${
                    fieldErrors.name
                      ? "border-[1.5px] border-[#b42318] focus:ring-2 focus:ring-[#b42318]/20"
                      : "border-[#d9e5e5] focus:border-[#015d67] focus:ring-2 focus:ring-[#015d67]/20"
                  }`}
                />
                {fieldErrors.name && (
                  <p
                    role="alert"
                    className="text-[#b42318] text-[12px] font-medium leading-normal text-left"
                  >
                    {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Field: Email */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                htmlFor="auth-email"
                className="font-semibold text-[13px] lg:text-[14px] text-[#0f172a] text-left"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                autoFocus={view === "login"}
                className={`h-[48px] w-full rounded-[10px] lg:rounded-[12px] bg-white px-3.5 text-[16px] text-[#0f172a] placeholder:text-[#586572] outline-none transition-colors border ${
                  fieldErrors.email
                    ? "border-[1.5px] border-[#b42318] focus:ring-2 focus:ring-[#b42318]/20"
                    : "border-[#d9e5e5] focus:border-[#015d67] focus:ring-2 focus:ring-[#015d67]/20"
                }`}
              />
              {fieldErrors.email && (
                <p
                  role="alert"
                  className="text-[#b42318] text-[12px] font-medium leading-normal text-left"
                >
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Field: Mật khẩu */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                htmlFor="auth-password"
                className="font-semibold text-[13px] lg:text-[14px] text-[#0f172a] text-left"
              >
                Mật khẩu
              </label>
              <input
                id="auth-password"
                type="password"
                value={pw}
                onChange={(e) => handlePwChange(e.target.value)}
                placeholder={
                  view === "login" ? "Nhập mật khẩu" : "Ít nhất 8 ký tự"
                }
                autoComplete={
                  view === "login" ? "current-password" : "new-password"
                }
                className={`h-[48px] w-full rounded-[10px] lg:rounded-[12px] bg-white px-3.5 text-[16px] text-[#0f172a] placeholder:text-[#586572] outline-none transition-colors border ${
                  fieldErrors.pw
                    ? "border-[1.5px] border-[#b42318] focus:ring-2 focus:ring-[#b42318]/20"
                    : "border-[#d9e5e5] focus:border-[#015d67] focus:ring-2 focus:ring-[#015d67]/20"
                }`}
              />
              {fieldErrors.pw && (
                <p
                  role="alert"
                  className="text-[#b42318] text-[12px] font-medium leading-normal text-left"
                >
                  {fieldErrors.pw}
                </p>
              )}
              {view === "register" && !fieldErrors.pw && (
                <p className="text-[11px] text-[#526171] text-left">
                  Dùng ít nhất 8 ký tự để bảo vệ tài khoản.
                </p>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-3 h-[48px] min-h-[48px] w-full rounded-[12px] bg-[#015d67] hover:bg-[#014a52] active:bg-[#013d44] text-white font-semibold text-[14px] lg:text-[15px] flex items-center justify-center transition-all shadow-sm ${
                loading
                  ? "opacity-55 cursor-not-allowed"
                  : !isFormValid && Object.keys(fieldErrors).length > 0
                    ? "opacity-60"
                    : "cursor-pointer"
              }`}
            >
              {loading
                ? "Đang xử lý..."
                : view === "login"
                  ? "Đăng nhập"
                  : "Tạo tài khoản"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 h-px bg-[#d9e5e5] w-full" />

          {/* Secondary Action 1: Switch between Login & Register */}
          <button
            type="button"
            onClick={() => switchMode(view === "login" ? "register" : "login")}
            className="min-h-[44px] py-2 flex items-center justify-center text-[13px] lg:text-[14px] text-[#526171] hover:text-[#015d67] cursor-pointer transition-colors"
          >
            {view === "login" ? (
              <span>
                Chưa có tài khoản?{" "}
                <strong className="font-semibold text-[#015d67] underline-offset-2 hover:underline">
                  Tạo tài khoản
                </strong>
              </span>
            ) : (
              <span>
                Đã có tài khoản?{" "}
                <strong className="font-semibold text-[#015d67] underline-offset-2 hover:underline">
                  Đăng nhập
                </strong>
              </span>
            )}
          </button>

          {/* Secondary Action 2: Demo mode link */}
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] py-2 flex items-center justify-center text-[13px] lg:text-[14px] font-medium text-[#526171] hover:text-[#0f172a] hover:underline underline-offset-2 cursor-pointer transition-colors"
          >
            Tiếp tục với chế độ xem thử
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
