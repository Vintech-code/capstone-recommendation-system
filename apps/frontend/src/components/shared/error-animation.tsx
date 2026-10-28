import lottie from 'lottie-web/build/player/lottie_light'
import { useEffect, useRef, useState } from 'react'

import errorAnimation from '@/assets/lottie/errors/Error.json'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function ErrorAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(reducedMotionQuery).matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(reducedMotionQuery)
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const animation = lottie.loadAnimation({
      animationData: structuredClone(errorAnimation),
      autoplay: !prefersReducedMotion,
      container: containerRef.current,
      loop: !prefersReducedMotion,
      renderer: 'svg',
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    })

    if (prefersReducedMotion) animation.goToAndStop(0, true)
    return () => animation.destroy()
  }, [prefersReducedMotion])

  return (
    <div
      aria-hidden="true"
      className="mx-auto aspect-[3/2] w-full max-w-lg sm:max-w-xl md:max-w-2xl"
      data-testid="error-animation"
      ref={containerRef}
    />
  )
}

export { ErrorAnimation }

