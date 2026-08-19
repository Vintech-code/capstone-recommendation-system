import type { ReactNode } from 'react'

import loginBackground from '@/assets/login-background.png'
import logo from '@/assets/logo-optimized.png'

interface AuthSplitLayoutProps {
  children: ReactNode
}

function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <main className="portal-sign-in-theme grid min-h-svh bg-background lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden min-h-svh overflow-hidden bg-primary-fixed/65 lg:block">
        <img
          src={loginBackground}
          alt="Student learning with a laptop"
          className="absolute left-1/2 top-1/2 h-[68%] w-[88%] -translate-x-1/2 -translate-y-1/2 object-contain"
        />
        <div className="absolute inset-x-8 bottom-10 px-6 text-center xl:inset-x-12">
          <p className="text-base font-medium leading-6 text-foreground xl:text-lg xl:leading-7">
            Discover the right courses
            <span className="block font-bold text-primary">for your future.</span>
          </p>
          <div aria-hidden="true" className="mt-5 flex items-center justify-center gap-2.5">
            <span className="h-2 w-6 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary/25" />
            <span className="size-2 rounded-full bg-primary/25" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-card px-5 py-10 sm:px-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
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
