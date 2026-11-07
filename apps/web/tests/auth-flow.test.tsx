import { describe, it, expect, vi } from "vitest"
import { renderToString } from "react-dom/server"
import Notice from "../src/components/ui/Notice"
import { AuthForm } from "../src/features/AuthForm"
import { SidebarNavigation } from "../src/components/ui/SidebarNavigation"

describe("Auth Flow & Design Verification (Figma AUTH · WEB & AUTH · APP)", () => {
  it("uses Lucide Timer for both responsive brand headers", () => {
    const html = renderToString(<AuthForm dispatch={vi.fn()} onCancel={vi.fn()} />)
    expect(html.match(/lucide-timer/g)).toHaveLength(2)
    expect(html).not.toContain('viewBox="0 0 200 200"')
  })

  it("renders Notice component for failure states according to Figma specs with alert icon", () => {
    const html = renderToString(
      <Notice
        tone="Error"
        title="Không thể đăng nhập"
        body="Email hoặc mật khẩu chưa đúng. Kiểm tra lại thông tin."
      />,
    )

    expect(html).toContain("Không thể đăng nhập")
    expect(html).toContain(
      "Email hoặc mật khẩu chưa đúng. Kiểm tra lại thông tin.",
    )
    expect(html).toContain('role="alert"')
    expect(html).toContain("lucide-circle-alert")
  })

  it("renders AuthForm in Login view with both Web Brand story and Form components", () => {
    const dispatch = vi.fn()
    const onCancel = vi.fn()

    const html = renderToString(
      <AuthForm dispatch={dispatch} onCancel={onCancel} initialMode="login" />,
    )

    // Web Brand Story (desktop 2-column) elements
    expect(html).toContain("Biết mình có gì.")
    expect(html).toContain("Dùng thực phẩm đúng lúc.")
    expect(html).toContain(
      "Theo dõi thực phẩm, ngày sử dụng và nơi bảo quản trong cùng một ứng dụng.",
    )
    expect(html).toContain("Kho thực phẩm của bạn")
    expect(html).toContain("Rau xanh")
    expect(html).toContain("Sữa tươi")
    expect(html).toContain("Trứng")
    expect(html).toContain("Quản lý thực phẩm dễ dàng mỗi ngày.")

    // Form elements
    expect(html).toContain("Chào mừng bạn trở lại")
    expect(html).toContain("Đăng nhập để tiếp tục quản lý thực phẩm của bạn.")
    expect(html).toContain("Email")
    expect(html).toContain("Mật khẩu")
    expect(html).not.toContain("Tên của bạn") // Login view should not ask for name
    expect(html).toContain("Đăng nhập")
    expect(html).toContain("Chưa có tài khoản?")
    expect(html).toContain("Tạo tài khoản")
    expect(html).toContain("Tiếp tục với chế độ xem thử")
  })

  it("renders AuthForm in Register view with name field and password hint", () => {
    const dispatch = vi.fn()
    const onCancel = vi.fn()

    const html = renderToString(
      <AuthForm
        dispatch={dispatch}
        onCancel={onCancel}
        initialMode="register"
      />,
    )

    expect(html).toContain("Tạo tài khoản Expiry")
    expect(html).toContain(
      "Bắt đầu theo dõi thực phẩm và hạn sử dụng dễ dàng hơn.",
    )
    expect(html).toContain("Tên của bạn")
    expect(html).toContain("Email")
    expect(html).toContain("Mật khẩu")
    expect(html).toContain("Dùng ít nhất 8 ký tự để bảo vệ tài khoản.")
    expect(html).toContain("Tạo tài khoản")
    expect(html).toContain("Đã có tài khoản?")
    expect(html).toContain("Tiếp tục với chế độ xem thử")
  })

  it("unifies brand logo icon using Lucide Timer in SidebarNavigation", () => {
    const html = renderToString(
      <SidebarNavigation>
        <div>nav items</div>
      </SidebarNavigation>,
    )
    expect(html).toContain("lucide-timer")
    expect(html).not.toContain("lucide-leaf")
  })
})
