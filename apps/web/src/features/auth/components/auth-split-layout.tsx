import type { ReactNode } from 'react'

import loginBackground from '@/assets/login-background1.png'
import logo from '@/assets/logo-optimized.png'

interface AuthSplitLayoutProps {
  children: ReactNode
}

function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className="portal-sign-in-theme relative flex min-h-svh overflow-hidden bg-background text-foreground">
      <img
        src={loginBackground}
        alt=""
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-background/45 sm:bg-background/20"
      />

      <section className="relative z-10 flex min-h-svh w-full items-center justify-center px-4 py-8 sm:px-8 lg:ml-auto lg:w-[46%] lg:min-w-[34rem] lg:px-12">
        <div className="w-full max-w-[34rem] rounded-[1.75rem] border border-border bg-card px-6 py-7 shadow-[var(--shadow-overlay)] sm:px-9 sm:py-9 lg:px-10">
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
