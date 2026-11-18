type BrandLockupProps = {
  className?: string
  markSize?: number
  wordmarkSize?: number
  inverse?: boolean
  markOnly?: boolean
}

export function BrandLockup({
  className = "",
  markSize = 40,
  wordmarkSize = 24,
  inverse = false,
  markOnly = false,
}: BrandLockupProps) {
  const foreground = inverse ? "text-white" : "text-brand-primary"

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-2.5 font-sans ${className}`}
      data-brand-lockup
    >
      <img
        src={`${import.meta.env.BASE_URL}brand/${
          inverse ? "clock-e-white.svg" : "clock-e-coral.svg"
        }`}
        alt=""
        aria-hidden="true"
        width={markSize}
        height={markSize}
        className="block shrink-0"
      />
      {!markOnly && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span
            className={`${foreground} font-bold whitespace-nowrap`}
            style={{ fontSize: wordmarkSize }}
          >
            Expiry
          </span>
        </span>
      )}
    </span>
  )
}
