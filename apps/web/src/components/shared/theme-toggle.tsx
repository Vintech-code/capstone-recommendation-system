import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/app/theme-context'
import { cn } from '@/lib/utils'

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const actionLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={actionLabel}
      aria-pressed={isDark}
      title={actionLabel}
      onClick={toggleTheme}
      className={cn(
        'shrink-0 rounded-xl text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-4.5" />
      ) : (
        <Moon aria-hidden="true" className="size-4.5" />
      )}
    </Button>
  )
}

export { ThemeToggle }
