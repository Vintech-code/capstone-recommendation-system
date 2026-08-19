import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FloatingInputFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  id: string
  label: string
  icon: LucideIcon
  error?: string
  endAdornment?: ReactNode
}

function FloatingInputField({
  id,
  label,
  icon: Icon,
  error,
  endAdornment,
  className,
  ...inputProps
}: FloatingInputFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'peer h-14 rounded-lg px-11 pt-2 focus:border-primary focus:ring-1 focus:ring-primary',
            className,
          )}
          {...inputProps}
        />
        <Label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-10 top-1/2 z-20 -translate-y-1/2 bg-card px-1 text-sm font-normal text-muted-foreground transition-all duration-150',
            'peer-focus:left-3 peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary',
            'peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium',
          )}
        >
          {label}
        </Label>
        {endAdornment}
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { FloatingInputField }
