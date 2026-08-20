import type { ReactNode } from 'react'

import loginBackground from '@/assets/login-background1.png'
import logo from '@/assets/logo-optimized.png'

interface AuthSplitLayoutProps {
  children: ReactNode
}

function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className="portal-sign-in-theme relative min-h-svh overflow-x-hidden bg-[var(--access-scene)] text-foreground">
      <img
        src={loginBackground}
        alt="Student exploring course options online"
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-white/38 lg:bg-transparent" aria-hidden="true" />

      <div className="pointer-events-none absolute left-[5vw] top-[7vh] z-10 hidden max-w-sm lg:block">
        <p className="text-2xl font-medium leading-tight text-[var(--access-caption)] xl:text-3xl">
          Discover the right courses
          <span className="block font-bold text-[var(--access-caption-strong)]">for your future.</span>
        </p>
      </div>

      <section className="relative z-20 flex min-h-svh items-center justify-center px-4 py-6 sm:px-8 lg:justify-end lg:px-[5vw] lg:py-10 xl:px-[7vw]">
        <div className="w-full max-w-[34rem] rounded-lg bg-card/96 px-6 py-7 shadow-[0_24px_70px_var(--access-panel-shadow)] backdrop-blur-sm sm:px-9 sm:py-9 lg:px-10">
          <div className="-mb-2 flex justify-center">
            <img
              src={logo}
              alt="Pathways"
              className="size-28 object-contain sm:size-32"
            />
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}

export { AuthSplitLayout }
