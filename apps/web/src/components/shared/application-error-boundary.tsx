import { RotateCcw } from "lucide-react";
import { Component, createRef, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ErrorAnimation } from "./error-animation";

interface ApplicationErrorBoundaryProps {
  children: ReactNode;
}

interface ApplicationErrorBoundaryState {
  hasError: boolean;
  errorReference: string;
}

function createErrorReference() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `APP-${timestamp}-${random}`;
}

function recoveryPath(pathname: string) {
  if (pathname.startsWith("/admin")) return "/admin";
  return "/student";
}

class ApplicationErrorBoundary extends Component<
  ApplicationErrorBoundaryProps,
  ApplicationErrorBoundaryState
> {
  state: ApplicationErrorBoundaryState = {
    hasError: false,
    errorReference: createErrorReference(),
  };

  private readonly headingRef = createRef<HTMLHeadingElement>();

  static getDerivedStateFromError(): Partial<ApplicationErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, info: ErrorInfo) {
    console.error(
      "The application recovery boundary handled an unexpected error.",
      {
        errorReference: this.state.errorReference,
        componentStack: info.componentStack,
      },
    );
    this.headingRef.current?.focus();
  }

  private retry = () => {
    this.setState({
      hasError: false,
      errorReference: createErrorReference(),
    });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const dashboardPath = recoveryPath(window.location.pathname);

    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
        <section
          aria-labelledby="application-error-title"
          className="w-full max-w-2xl rounded-[1.75rem] border border-border bg-card px-6 py-8 text-center shadow-sm sm:px-10 sm:py-10"
        >
          <ErrorAnimation />

          <p className="mt-6 font-label text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
            Page recovery
          </p>
          <h1
            id="application-error-title"
            ref={this.headingRef}
            tabIndex={-1}
            className="mt-2 font-display text-3xl font-black tracking-tight text-foreground outline-none sm:text-4xl"
          >
            Let&apos;s get you back on track
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-6 text-muted-foreground">
            This page needs a fresh start. Try loading it again, or return to
            your dashboard to continue.
          </p>
          <p className="mt-5 font-label text-xs text-muted-foreground">
            Error reference: <strong>{this.state.errorReference}</strong>
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" onClick={this.retry}>
              <RotateCcw aria-hidden="true" />
              Retry page
            </Button>
            <Button asChild variant="outline">
              <a href={dashboardPath}>Return to dashboard</a>
            </Button>
          </div>
        </section>
      </main>
    );
  }
}

export { ApplicationErrorBoundary };
