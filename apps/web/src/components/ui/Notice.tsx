import type { ReactNode } from "react"

export interface NoticeProps {
  title?: string
  body?: ReactNode
  tone?: "Error" | "Warning" | "Info" | "Success"
  className?: string
  children?: ReactNode
  action?: ReactNode
}

export function Notice({
  title = "Thông tin cần chú ý",
  body,
  tone = "Error",
  className = "",
  children,
  action,
}: NoticeProps) {
  const content = body ?? children

  const toneStyles = {
    Error: "bg-[var(--danger-bg,#fef0ee)] text-[color:var(--danger,#b42318)]",
    Warning: "bg-[var(--warn-bg,#fff7df)] text-[color:var(--warn,#9a6700)]",
    Info: "bg-[#e8f5f4] text-[#015d67]",
    Success: "bg-[#ebf8f1] text-[#18794e]",
  }[tone]

  return (
    <div
      role="alert"
      className={`break-words content-stretch flex flex-col gap-1.5 p-4 rounded-[16px] text-sm w-full ${toneStyles} ${className}`}
    >
      {title && <p className="font-semibold leading-5 w-full">{title}</p>}
      {content && (
        <p className="font-normal leading-[22px] w-full text-sm opacity-95">
          {content}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default Notice
