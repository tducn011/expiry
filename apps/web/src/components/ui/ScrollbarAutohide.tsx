import { useEffect } from "react"

export default function ScrollbarAutohide() {
  useEffect(() => {
    const timers = new Map<Element, number>()
    const handleScroll = (event: Event) => {
      const element =
        event.target instanceof Element
          ? event.target
          : document.scrollingElement
      if (!element) return
      element.classList.add("is-scrolling")
      window.clearTimeout(timers.get(element))
      timers.set(
        element,
        window.setTimeout(() => {
          element.classList.remove("is-scrolling")
          timers.delete(element)
        }, 700),
      )
    }
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    })
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true })
      timers.forEach((timer, element) => {
        window.clearTimeout(timer)
        element.classList.remove("is-scrolling")
      })
    }
  }, [])
  return null
}
