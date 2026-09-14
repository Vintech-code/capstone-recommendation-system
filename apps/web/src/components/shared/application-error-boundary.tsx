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
      <main className="flex min-h-svh items-center justify-center px-4 py-12">
        <section
          aria-labelledby="application-error-title"
          className="w-full max-w-2xl text-center"
        >
          <ErrorAnimation />

          <p className="mt-6 font-label text-xs font-bold uppercase tracking-[0.16em] text-destructive-ink">
            Application recovery
          </p>
          <h1
            id="application-error-title"
            ref={this.headingRef}
            tabIndex={-1}
            className="mt-2 font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground outline-none"
          >
            Something went wrong
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-6 text-muted-foreground">
            The page encountered an unexpected problem. Try the page again, or
            return to your dashboard.
          </p>
          <p className="mt-4 font-label text-xs text-muted-foreground">
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
