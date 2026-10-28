import type { ReactNode } from "react";
import { Link } from "react-router";
import { X } from "lucide-react";

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

      <section className="relative z-10 flex min-h-svh w-full items-center justify-center px-4 py-8 sm:px-8">
        {/* Soft Glass modal card exactly matching the student authentication card design */}
        <div className="relative w-[calc(100%-2rem)] max-w-[460px] overflow-y-auto rounded-xs border border-white/80 bg-white/80 p-7 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.16),0_0_0_1px_rgba(255,255,255,0.7)_inset] backdrop-blur-md outline-none transition-all duration-200 dark:border-white/20 dark:bg-card/85 sm:p-9">
          {/* Subtle specular gloss top reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-18 rounded-t-xs bg-gradient-to-b from-white/50 via-white/10 to-transparent"
          />

          {/* Close button with rounded-xs */}
          <Link
            to="/"
            className="absolute right-3.5 top-3.5 z-10 inline-flex size-7.5 items-center justify-center rounded-xs border border-white/80 bg-white/75 text-muted-foreground shadow-xs backdrop-blur-sm transition hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label="Close"
          >
            <X aria-hidden="true" className="size-3.5" />
            <span className="sr-only">Close</span>
          </Link>

          <div className="relative mx-auto flex justify-center pb-3">
            <img
              src={logo}
              alt="TCCence"
              className="size-24 object-contain sm:size-32"
            />
          </div>

          <div className="relative">{children}</div>
        </div>
      </section>
    </main>
  );
}

export { AuthSplitLayout };
