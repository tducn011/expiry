import type { ReactNode } from "react"
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react"

export interface NoticeProps {
  title?: string
  body?: ReactNode
  tone?: "Error" | "Warning" | "Info" | "Success"
  className?: string
  children?: ReactNode
  action?: ReactNode
  icon?: ReactNode
}

export function Notice({
  title = "Thông tin cần chú ý",
  body,
  tone = "Error",
  className = "",
  children,
  action,
  icon,
}: NoticeProps) {
  const content = body ?? children

  const toneStyles = {
    Error: "bg-[var(--danger-bg,#fef0ee)] text-[color:var(--danger,#b42318)]",
    Warning: "bg-[var(--warn-bg,#fffbeb)] text-[color:var(--warn,#b45309)] border border-amber-200/60",
    Info: "bg-[#e8f5f4] text-[#015d67]",
    Success: "bg-[#ebf8f1] text-[#18794e]",
  }[tone]

  const DefaultIcon = {
    Error: CircleAlert,
    Warning: TriangleAlert,
    Info: Info,
    Success: CircleCheck,
  }[tone]

  return (
    <div
      role="alert"
      className={`break-words content-stretch flex items-start gap-3 p-4 rounded-[16px] text-sm w-full ${toneStyles} ${className}`}
    >
      <div className="shrink-0 mt-0.5 text-current" aria-hidden="true">
        {icon ?? <DefaultIcon size={20} />}
      </div>
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {title && <p className="font-semibold leading-5 w-full">{title}</p>}
        {content && (
          <p className="font-normal leading-[22px] w-full text-sm opacity-95">
            {content}
          </p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
}

export default Notice
