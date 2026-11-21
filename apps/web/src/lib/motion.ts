import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { useGSAP } from "@gsap/react"

// Single motion contract (Figma UI Foundations). Every animated component takes
// durations and easings from here and checks reducedMotion() before animating.
gsap.registerPlugin(useGSAP, CustomEase)

// Durations in seconds: fast 120ms, normal 200ms, slow 320ms (phone spatial /
// sheet), emphasis 400ms.
export const DUR = {
  fast: 0.12,
  normal: 0.2,
  slow: 0.32,
  emphasis: 0.4,
} as const

// Exact CSS cubic-bezier equivalents as CustomEase bezier paths:
// enter cubic-bezier(0,0,0.2,1), exit cubic-bezier(0.4,0,1,1),
// standard cubic-bezier(0.2,0,0,1).
export const EASE = {
  enter: CustomEase.create("expiryEnter", "M0,0 C0,0 0.2,1 1,1"),
  exit: CustomEase.create("expiryExit", "M0,0 C0.4,0 1,1 1,1"),
  standard: CustomEase.create("expiryStandard", "M0,0 C0.2,0 0,1 1,1"),
}

// prefers-reduced-motion: reduce disables all motion. Callers skip the tween
// (enter) or finish immediately (exit) when this is true.
export function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

// Tailwind `md:` breakpoint, used to pick sheet (phone) or popover (web) motion.
export function isDesktopViewport() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(min-width: 768px)").matches
  )
}

// Popover / reveal enter: fade + small translateY, normal duration, enter easing.
export function popoverIn(target: gsap.TweenTarget, y = -4) {
  if (reducedMotion()) return null
  return gsap.fromTo(target, { opacity: 0, y }, {
    opacity: 1,
    y: 0,
    duration: DUR.normal,
    ease: EASE.enter,
    overwrite: true,
    clearProps: "opacity,transform",
  })
}

export { gsap, useGSAP }
