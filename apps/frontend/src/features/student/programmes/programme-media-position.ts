import type { CSSProperties } from 'react'

import type { ProgrammeMediaPosition } from '@/features/student/programmes/programme-types'

function safeProgrammeMediaPosition(value?: ProgrammeMediaPosition | null): ProgrammeMediaPosition | null {
  if (!value) return null
  const x = Number(value.x)
  const y = Number(value.y)
  const zoom = Number(value.zoom)
  if (![x, y, zoom].every(Number.isFinite)) return null
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
    zoom: Math.min(2.5, Math.max(1, zoom)),
  }
}

function programmeMediaStyle(value?: ProgrammeMediaPosition | null): CSSProperties | undefined {
  const position = safeProgrammeMediaPosition(value)
  return position ? { objectPosition: `${position.x}% ${position.y}%`, transform: `scale(${position.zoom})` } : undefined
}

export { programmeMediaStyle, safeProgrammeMediaPosition }
