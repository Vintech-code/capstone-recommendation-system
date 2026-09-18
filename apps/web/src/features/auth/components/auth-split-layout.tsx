import type { ReactNode } from "react";

import loginBackground from "@/assets/logo/login-background1.png";
import logo from "@/assets/logo/login-logo.png";

interface AuthSplitLayoutProps {
  children: ReactNode;
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

      <section className="relative z-10 flex min-h-svh w-full items-center justify-center px-4 py-8 sm:px-8 lg:justify-end lg:pr-16 xl:pr-24">
        {/* Soft Glass modal card matching the student authentication card design */}
        <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-7 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16),0_0_0_1px_rgba(255,255,255,0.7)_inset] backdrop-blur-md transition-all duration-200 dark:border-white/20 dark:bg-card/85 sm:p-9">
          {/* Subtle specular gloss top reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-18 rounded-t-3xl bg-gradient-to-b from-white/50 via-white/10 to-transparent"
          />

          <div className="relative mx-auto flex justify-center pb-3">
            <img
              src={logo}
              alt="TCCence"
              className="size-24 object-contain sm:size-28"
            />
          </div>

          <div className="relative">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export { AuthSplitLayout };
