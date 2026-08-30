import type { ReactNode } from 'react'

import journeyIllustration from '@/assets/student-journey-hero.png'
import logo from '@/assets/logo-optimized.png'

interface AuthSplitLayoutProps {
  children: ReactNode
}

function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className="portal-sign-in-theme relative grid min-h-svh overflow-hidden bg-background text-foreground lg:grid-cols-[minmax(0,1.1fr)_minmax(31rem,0.9fr)]">
      <section className="relative hidden overflow-hidden bg-primary-fixed/45 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16" aria-label="Academic journey introduction">
        <div aria-hidden="true" className="absolute -left-24 -top-28 size-80 rounded-full bg-canvas-cream blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 right-0 size-96 rounded-full bg-primary-fixed blur-3xl" />
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Your academic journey</p>
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.04em] xl:text-5xl">
            Discover a programme direction built from your recorded interests.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            Complete the assessment, review the evidence, and explore available TCC programmes at your own pace.
          </p>
        </div>
        <img
          src={journeyIllustration}
          alt="Illustrated academic path with Discover, Match, and Achieve signposts"
          className="relative z-0 -mx-12 -mb-12 mt-8 w-[calc(100%+6rem)] object-contain object-bottom xl:-mx-16 xl:-mb-16 xl:w-[calc(100%+8rem)]"
        />
      </section>

      <section className="relative z-20 flex min-h-svh items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-24 size-72 rounded-full bg-primary-fixed/70 blur-3xl lg:hidden" />
        <div className="relative w-full max-w-[34rem] rounded-[1.75rem] border border-border bg-card px-6 py-7 shadow-[var(--shadow-card)] sm:px-9 sm:py-9 lg:px-10">
          <div className="-mb-2 flex justify-center">
            <img
              src={logo}
              alt="Pathways"
              className="size-24 object-contain sm:size-28"
            />
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}

export { AuthSplitLayout }
