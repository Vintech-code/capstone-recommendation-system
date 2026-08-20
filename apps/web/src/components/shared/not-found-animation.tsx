import lottie from 'lottie-web/build/player/lottie_light'
import { useEffect, useRef, useState } from 'react'

import error404Animation from '@/assets/lottie/errors/Error 404.json'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function NotFoundAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia(reducedMotionQuery).matches,
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
      animationData: structuredClone(error404Animation),
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
      className="mx-auto aspect-square w-full max-w-72"
      data-testid="not-found-animation"
      ref={containerRef}
    />
  )
}

export { NotFoundAnimation }
