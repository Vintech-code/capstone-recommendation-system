import {
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleX,
  Clock3,
  type LucideIcon,
} from 'lucide-react'
import type { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'

type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const toneConfig: Record<
  StatusTone,
  { icon: LucideIcon; variant: ComponentProps<typeof Badge>['variant'] }
> = {
  neutral: { icon: CircleDot, variant: 'outline' },
  info: { icon: Clock3, variant: 'info' },
  success: { icon: CircleCheck, variant: 'success' },
  warning: { icon: CircleAlert, variant: 'warning' },
  danger: { icon: CircleX, variant: 'destructive' },
}

interface StatusBadgeProps {
  label: string
  tone?: StatusTone
  className?: string
}

function StatusBadge({
  label,
  tone = 'neutral',
  className,
}: StatusBadgeProps) {
  const { icon: Icon, variant } = toneConfig[tone]

  return (
    <Badge variant={variant} className={className}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  )
}

export { StatusBadge }
export type { StatusBadgeProps, StatusTone }
