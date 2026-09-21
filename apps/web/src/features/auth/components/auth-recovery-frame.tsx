import { KeyRound } from "lucide-react";
import type { ReactNode } from "react";

interface AuthRecoveryFrameProps {
  title: string;
  description: string;
  children: ReactNode;
}

function AuthRecoveryFrame({
  title,
  description,
  children,
}: AuthRecoveryFrameProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-40 size-96 rounded-full bg-primary-fixed/80 blur-3xl"
      />
      <section className="relative w-full max-w-lg rounded-t-none rounded-b-[1.75rem] border border-border bg-card p-6 shadow-sm sm:p-9">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary-ink">
          <KeyRound className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-[-0.035em]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}

export { AuthRecoveryFrame };
