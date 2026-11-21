import { useRef } from "react"

import { CircleAlert } from "lucide-react"

import { DUR, EASE, gsap, reducedMotion, useGSAP } from "../../lib/motion"

export interface FieldErrorProps {
  id?: string

  msg?: string
}

export function FieldError({ id, msg }: FieldErrorProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const visible = Boolean(msg)

  useGSAP(
    () => {
      if (!visible || !ref.current || reducedMotion()) return
      gsap.fromTo(ref.current, { opacity: 0 }, {
        opacity: 1,
        duration: DUR.fast,
        ease: EASE.enter,
        overwrite: true,
        clearProps: "opacity",
      })
    },
    { scope: ref, dependencies: [visible] },
  )

  if (!msg) return null

  return (
    <p
      ref={ref}
      id={id}
      role="alert"
      className="mt-1 flex items-center gap-1.5 text-xs text-status-expired font-medium"
    >
      <CircleAlert size={16} aria-hidden className="shrink-0" />
      <span>{msg}</span>
    </p>
  )
}

export default FieldError
