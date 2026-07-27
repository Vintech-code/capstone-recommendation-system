import {
  ArrowLeft,
  ClockAlert,
  FileQuestion,
  ShieldX,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/button'

type ApplicationStateKind = 'forbidden' | 'session-expired' | 'not-found'

const stateContent: Record<
  ApplicationStateKind,
  {
    eyebrow: string
    title: string
    description: string
    actionLabel: string
    icon: LucideIcon
  }
> = {
  forbidden: {
    eyebrow: 'Access restricted',
    title: 'You cannot open this page',
    description:
      'Your account does not have access to this workspace. Return to your portal and choose an available area.',
    actionLabel: 'Return to portal',
    icon: ShieldX,
  },
  'session-expired': {
    eyebrow: 'Session ended',
    title: 'Sign in to continue',
    description:
      'Your session is no longer active. Sign in again to return to your authorized workspace.',
    actionLabel: 'Go to sign in',
    icon: ClockAlert,
  },
  'not-found': {
    eyebrow: 'Page not found',
    title: 'This page is unavailable',
    description:
      'The address may be incorrect or the page may have moved. Return to the application entry point.',
    actionLabel: 'Return to application',
    icon: FileQuestion,
  },
}

interface ApplicationStatePageProps {
  kind: ApplicationStateKind
  onPrimaryAction: () => void
  onBack?: () => void
}

function ApplicationStatePage({
  kind,
  onPrimaryAction,
  onBack,
}: ApplicationStatePageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const content = stateContent[kind]

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <main className="flex min-h-svh items-center justify-center bg-secondary/70 px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl bg-background p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          <content.icon aria-hidden="true" className="size-6" />
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-primary">
          {content.eyebrow}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 text-3xl font-extrabold tracking-[-0.045em] outline-none"
        >
          {content.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {content.description}
        </p>
        <div className="mt-8 flex flex-col-reverse justify-center gap-2 sm:flex-row">
          {onBack ? (
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft aria-hidden="true" />
              Go back
            </Button>
          ) : null}
          <Button type="button" onClick={onPrimaryAction}>
            {content.actionLabel}
          </Button>
        </div>
      </section>
    </main>
  )
}

export { ApplicationStatePage }
export type { ApplicationStateKind }
