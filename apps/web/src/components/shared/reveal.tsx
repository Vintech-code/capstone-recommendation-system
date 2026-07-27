import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

function Reveal({ children, className, delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      element.dataset.visible = 'true'
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.visible = 'true'
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const style = {
    '--reveal-delay': `${delay}ms`,
  } as CSSProperties

  return (
    <div
      ref={elementRef}
      data-reveal=""
      data-visible="false"
      className={cn(className)}
      style={style}
    >
      {children}
    </div>
  )
}

export { Reveal }
export type { RevealProps }
