import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowRight,
  BookCheck,
  ChartNoAxesCombined,
  Compass,
  FileText,
} from "lucide-react";

import landingHome from "@/assets/images/landing-image-home.png";
import landingBackground from "@/assets/images/landing-image-bg.png";
import landingJourney from "@/assets/images/landing-image2.png";
import landingQuestion from "@/assets/images/landing-image-question.png";
import landingFooter from "@/assets/images/landing-image-footer.png";
import logo from "@/assets/logo/header-logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StudentAuthModal } from "@/features/auth/components/student-auth-modal";

const reasons = [
  {
    icon: Compass,
    title: "Objective Exploration",
    description:
      "Compare interests across our academic catalogue without premature filtering.",
  },
  {
    icon: BookCheck,
    title: "Documented Rules",
    description:
      "Entrance results are clearly referenced against standard programme tracks.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Transparent Scores",
    description:
      "Every recommendation displays exact Holland attribute scores and rationale.",
  },
  {
    icon: FileText,
    title: "Actionable Next Steps",
    description:
      "Take your immutable assessment profile directly to academic advisory.",
  },
];

const journeySteps = [
  {
    number: "1",
    icon: FileText,
    title: "Declare entrance result",
    description:
      "Enter your examination result first — whether board or non-board eligible. It establishes your academic track context before taking the assessment.",
  },
  {
    number: "2",
    icon: Compass,
    title: "Answer honestly",
    description:
      "Thirty scenario questions — pick what feels more like you. No right or wrong answers, Holland's RIASEC model captures your natural vocational interests.",
  },
  {
    number: "3",
    icon: ChartNoAxesCombined,
    title: "Explore what fits",
    description:
      "Get course and career ideas matched to your profile and entrance group — review transparent match scores you can revisit with college advisors.",
  },
];

const riasecAreas = [
  {
    code: "R",
    name: "Realistic",
    description:
      "Hands-on, practical, mechanical, or outdoor activities and concrete problem-solving.",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  },
  {
    code: "I",
    name: "Investigative",
    description:
      "Analytical, intellectual, scientific, or research-oriented inquiry and problem-solving.",
    className: "bg-sky-50 text-sky-800 border-sky-200/80",
  },
  {
    code: "A",
    name: "Artistic",
    description:
      "Creative, expressive, original, and unstructured tasks in design, media, or language.",
    className: "bg-purple-50 text-purple-800 border-purple-200/80",
  },
  {
    code: "S",
    name: "Social",
    description:
      "Helping, teaching, counseling, and working directly to support others in the community.",
    className: "bg-amber-50 text-amber-900 border-amber-200/80",
  },
  {
    code: "E",
    name: "Enterprising",
    description:
      "Persuading, leading, organizing initiatives, and driving collective goals forward.",
    className: "bg-rose-50 text-rose-800 border-rose-200/80",
  },
  {
    code: "C",
    name: "Conventional",
    description:
      "Systematic, organized, data-driven, structured, and detail-attentive workflows.",
    className: "bg-slate-50 text-slate-800 border-slate-200/80",
  },
];

const questions = [
  {
    question: "Does a strong match guarantee admission to a programme?",
    answer:
      "No. Recommendations support academic exploration and advising. Official admission remains governed by TCC enrolment policy and requirements.",
  },
  {
    question: "Are my answers and results permanently recorded?",
    answer:
      "Yes. Completed assessments create an immutable record with versioned rules so you and your advisors can always audit how recommendations were reached.",
  },
  {
    question: "How is my entrance examination score used?",
    answer:
      "Your self-declared score informs standard academic guideline groupings alongside your RIASEC profile to highlight relevant college tracks.",
  },
];

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale";
}

const revealOffset = {
  up: "translate-y-3",
  left: "-translate-x-3",
  right: "translate-x-3",
  scale: "scale-[0.98]",
} as const;

function ScrollReveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-landing-reveal={variant}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none",
        isVisible
          ? "landing-reveal-visible translate-x-0 translate-y-0 scale-100 opacity-100"
          : cn("opacity-0", revealOffset[variant]),
        className,
      )}
    >
      {children}
    </div>
  );
}

interface LandingPageProps {
  initialAuth?: 'signin' | 'signup';
}

function LandingPage({ initialAuth }: LandingPageProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const authQuery = searchParams.get("auth");
  const googleError = searchParams.get("google_error");

  const requestedAuth =
    initialAuth ??
    (authQuery === 'signup'
      ? 'signup'
      : authQuery === 'signin' || googleError
        ? 'signin'
        : null);

  const [authOverride, setAuthOverride] = useState<{
    open: boolean;
    mode: 'signin' | 'signup';
  } | null>(null);

  const authModalOpen = authOverride ? authOverride.open : Boolean(requestedAuth);
  const authModalMode = authOverride ? authOverride.mode : (requestedAuth ?? 'signin');

  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 20,
  );

  const openAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthOverride({ open: true, mode });
  };

  const handleAuthOpenChange = (open: boolean) => {
    setAuthOverride({ open, mode: authModalMode });
    if (!open) {
      if (searchParams.has('auth') || searchParams.has('google_error')) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('auth');
        nextParams.delete('google_error');
        setSearchParams(nextParams, { replace: true });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary-ink">
      {/* HEADER NAVIGATION WITH SCROLL TRANSITION */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
          isScrolled
            ? "pt-3 sm:pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none"
            : "pt-0 px-0 pointer-events-auto",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-between transition-all duration-300 ease-in-out pointer-events-auto",
            isScrolled
              ? "max-w-255 rounded-full border border-border/80 bg-surface/95 dark:bg-card/95 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5"
              : "w-full max-w-full border-b border-transparent bg-transparent px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4",
          )}
        >
          <div
            className={cn(
              "mx-auto flex w-full items-center justify-between transition-all duration-300",
              !isScrolled && "max-w-300",
            )}
          >
            <Link
              to="/"
              className="flex items-center transition-opacity hover:opacity-90 shrink-0"
            >
              <img
                src={logo}
                alt="TCCence"
                className={cn(
                  "w-auto object-contain transition-all duration-300",
                  isScrolled ? "h-7.5 sm:h-8.5" : "h-8.5 sm:h-9.5",
                )}
              />
            </Link>

            {/* Center Nav Links */}
            <nav
              aria-label="Landing navigation"
              className="hidden items-center gap-6 lg:gap-8 md:flex text-sm font-semibold"
            >
              <a
                href="#landing-hero"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                Home
              </a>
              <a
                href="#why-pathways"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                What We Provide
              </a>
              <a
                href="#journey"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                How It Works
              </a>
              <a
                href="#riasec"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                RIASEC
              </a>
              <a
                href="#faq"
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                FAQ
              </a>
            </nav>

            {/* Right Action Button (Layered 3D Button) */}
            <div className="relative inline-flex group shrink-0">
              <span
                aria-hidden="true"
                className="absolute -inset-0.5 translate-y-1 rounded-full bg-[#b8f572] border border-[#85d826]/70 shadow-xs transition-transform duration-150 group-hover:translate-y-0.5 group-active:translate-y-0"
              />
              <Button
                asChild
                size="sm"
                className={cn(
                  "relative inline-flex rounded-full font-bold shadow-xs transition-all duration-150 bg-primary text-primary-foreground border border-[#62ad19]/40 hover:bg-[#70c21d] active:translate-y-1",
                  isScrolled
                    ? "px-3.5 py-1 text-xs sm:text-sm sm:px-4"
                    : "px-3.5 sm:px-4.5",
                )}
              >
                <Link
                  to="/student/login"
                  onClick={(e) => {
                    e.preventDefault();
                    openAuth('signin');
                  }}
                >
                  Start assessment
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* SECTION 1: HERO SECTION */}
        <section
          id="landing-hero"
          aria-labelledby="landing-title"
          data-testid="landing-hero"
          className="relative isolate overflow-hidden -mt-16 sm:-mt-20 px-4 pb-10 pt-20 sm:px-6 sm:pb-12 sm:pt-24 lg:px-8 lg:pb-14 lg:pt-28"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <img
              src={landingBackground}
              alt=""
              data-testid="landing-hero-background"
              className="size-full object-cover object-center opacity-75"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(247,250,242,0.72)_0%,rgba(247,250,242,0.38)_48%,rgba(247,250,242,0.12)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent" />
          </div>

          <ScrollReveal
            className="relative z-10 mx-auto max-w-300 text-center"
            variant="scale"
          >
            {/* Main Display Headline */}
            <h1
              id="landing-title"
              className="mx-auto max-w-3xl font-display text-3xl font-black leading-tight tracking-[-0.03em] text-foreground sm:text-4xl lg:text-[2.75rem]"
            >
              Explore your interests.
              <span className="mt-0.5 block text-primary-ink">
                Understand your options.
              </span>
            </h1>

            {/* Supporting Description (minimized to 2 lines) */}
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:max-w-2xl sm:text-base">
              Complete a RIASEC assessment and review programme recommendations
              <br className="hidden sm:inline" /> supported by your recorded
              scores and configured catalogue evidence.
            </p>

            {/* Action Buttons */}
            <div className="landing-stagger mt-4.5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <div className="relative inline-flex group w-full sm:w-auto shrink-0">
                <span
                  aria-hidden="true"
                  className="absolute -inset-0.5 translate-y-1 sm:translate-y-1.5 rounded-full bg-[#b8f572] border border-[#85d826]/70 shadow-xs transition-transform duration-150 group-hover:translate-y-0.5 group-active:translate-y-0"
                />
                <Button
                  asChild
                  size="default"
                  className="relative inline-flex w-full sm:w-auto rounded-full px-6 font-bold shadow-xs transition-all duration-150 bg-primary text-primary-foreground border border-[#62ad19]/40 hover:bg-[#70c21d] active:translate-y-1 sm:active:translate-y-1.5"
                >
                  <Link
                    to="/student/login"
                    onClick={(e) => {
                      e.preventDefault();
                      openAuth('signin');
                    }}
                  >
                    Start assessment
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </div>
              <Button
                asChild
                size="default"
                variant="outline"
                className="w-full sm:w-auto rounded-full bg-surface/90 px-5.5 font-semibold border-border/90 hover:bg-surface-subtle"
              >
                <Link
                  to="/student/login"
                  onClick={(e) => {
                    e.preventDefault();
                    openAuth('signin');
                  }}
                >
                  Student sign in
                </Link>
              </Button>
            </div>

            {/* Centerpiece 3D Illustration Avatar (prominently sized and visible above the fold, NO hover effect) */}
            <div className="relative mx-auto mt-3 max-w-xl sm:mt-4 lg:max-w-2xl">
              <img
                src={landingHome}
                alt="Students discovering career interests with laptops"
                className="relative z-10 mx-auto max-h-76 w-auto object-contain drop-shadow-sm sm:max-h-88 lg:max-h-100"
              />
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 2: WHAT WE PROVIDE (4-Card Grid) */}
        <section
          id="why-pathways"
          className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20 bg-surface-subtle/50 border-y border-border/60"
          aria-labelledby="why-title"
        >
          <ScrollReveal className="mx-auto max-w-300" variant="left">
            <div className="text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-ink">
                / WHAT WE PROVIDE /
              </p>
              <h2
                id="why-title"
                className="mt-2.5 font-display text-2xl font-black tracking-[-0.03em] text-foreground sm:text-3xl lg:text-4xl"
              >
                Guidance you can understand and revisit
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-muted-foreground sm:text-base">
                The system keeps eligibility and interest matching separate,
                then presents the recorded basis for each recommendation.
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="landing-stagger mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5.5 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-1"
                >
                  <div>
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-ink transition-transform duration-200 group-hover:scale-105">
                      <Icon
                        aria-hidden="true"
                        className="size-5.5 text-primary"
                      />
                    </span>
                    <h3 className="mt-4 font-display text-base sm:text-lg font-bold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-9 text-center">
              <Button
                asChild
                size="default"
                className="rounded-full px-7 shadow-xs"
              >
                <a href="#journey">
                  Learn more about the journey
                  <ArrowRight aria-hidden="true" className="size-4" />
                </a>
              </Button>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 3: HOW IT WORKS (Split Section with landingJourney) */}
        <section
          id="journey"
          className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
          aria-labelledby="steps-title"
        >
          <ScrollReveal className="mx-auto max-w-300" variant="right">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Column: 3D Confident Students Illustration */}
              <div className="lg:col-span-4 flex justify-center order-2 lg:order-1">
                <div className="relative max-w-md w-full">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-linear-to-tr from-primary/15 via-accent/10 to-transparent blur-2xl -z-10"
                  />
                  <img
                    src={landingJourney}
                    alt="Two confident students ready for their college journey"
                    className="mx-auto max-h-104 w-auto drop-shadow-md object-contain transition-transform duration-500 hover:scale-[1.01]"
                  />
                </div>
              </div>

              {/* Right Column: Process & Steps */}
              <div className="lg:col-span-8 order-1 lg:order-2">
                <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-ink">
                  / HOW IT WORKS /
                </p>
                <h2
                  id="steps-title"
                  className="mt-2.5 font-display text-2xl font-black tracking-[-0.03em] text-foreground sm:text-3xl lg:whitespace-nowrap lg:text-[2.15rem]"
                >
                  Three clear stages, with evidence at each step
                </h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground sm:text-base lg:whitespace-nowrap">
                  Move from account setup to a recorded result and programme
                  directions you can inspect.
                </p>

                <ol className="landing-stagger mt-6 space-y-3.5">
                  {journeySteps.map(
                    ({ number, icon: Icon, title, description }) => (
                      <li
                        key={number}
                        className="group flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-4.5 shadow-2xs transition-all duration-200 hover:border-primary/40 hover:bg-surface"
                      >
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-ink font-mono text-2xl font-black">
                          {number}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon
                              aria-hidden="true"
                              className="size-4 text-primary"
                            />
                            <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                              {title}
                            </h3>
                          </div>
                          <p className="mt-0.5 text-xs sm:text-sm font-medium leading-relaxed text-muted-foreground">
                            {description}
                          </p>
                        </div>
                      </li>
                    ),
                  )}
                </ol>

                <div className="mt-7">
                  <Button
                    asChild
                    size="default"
                    className="rounded-full px-7 shadow-xs"
                  >
                    <Link
                      to="/student/login"
                      onClick={(e) => {
                        e.preventDefault();
                        openAuth('signin');
                      }}
                    >
                      Begin your assessment
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 4: DISCOVER RIASEC (Clean 6-Card Category Grid) */}
        <section
          id="riasec"
          className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20 bg-surface-subtle/50 border-y border-border/60"
          aria-labelledby="riasec-title"
        >
          <ScrollReveal className="mx-auto max-w-300" variant="scale">
            <div className="text-center">
              <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-ink">
                / DISCOVER RIASEC /
              </p>
              <h2
                id="riasec-title"
                className="mt-2.5 font-display text-2xl font-black tracking-[-0.03em] text-foreground sm:text-3xl lg:text-4xl"
              >
                Six ways interests can show up
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-muted-foreground">
                RIASEC provides six categories for organizing vocational
                interests. It does not measure intelligence, diagnose
                personality, or decide what programme you must take.
              </p>
            </div>

            {/* 6 RIASEC Category Cards in a balanced 3-column grid */}
            <div className="landing-stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {riasecAreas.map((area) => (
                <article
                  key={area.code}
                  className="group flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs transition-all duration-300 hover:border-primary/40 hover:bg-surface hover:-translate-y-0.5"
                >
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl font-display text-xl font-black ring-1 transition-transform duration-200 group-hover:scale-105 ${area.className}`}
                    aria-hidden="true"
                  >
                    {area.code}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-bold text-foreground">
                      {area.name}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium leading-relaxed text-muted-foreground">
                      {area.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 5: QUESTIONS & FAQ (Split Layout with landingQuestion on RIGHT side) */}
        <section
          id="faq"
          className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
          aria-labelledby="questions-title"
        >
          <ScrollReveal className="mx-auto max-w-300" variant="left">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              {/* Left Column: FAQ Questions Accordion */}
              <div className="lg:col-span-7">
                <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-ink">
                  / FAQ /
                </p>
                <h2
                  id="questions-title"
                  className="mt-2.5 font-display text-2xl font-black tracking-[-0.03em] text-foreground sm:text-3xl lg:text-4xl"
                >
                  Know what the result can—and cannot—tell you
                </h2>
                <p className="mt-2 text-sm sm:text-base font-medium leading-relaxed text-muted-foreground">
                  Find answers about how RIASEC scoring, self-declared entrance
                  results, and course recommendations work together.
                </p>

                <div className="landing-stagger mt-7 divide-y divide-border/80 overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
                  {questions.map(({ question, answer }) => (
                    <details
                      key={question}
                      className="group px-6 py-1 open:bg-surface-subtle/50 transition-colors"
                    >
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 py-3.5 font-display text-base font-bold text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35">
                        {question}
                        <span
                          aria-hidden="true"
                          className="flex size-6.5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-base font-medium text-primary-ink transition-transform duration-200 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="max-w-3xl pb-4 pr-8 text-xs sm:text-sm font-medium leading-relaxed text-muted-foreground sm:leading-6">
                        {answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Right Column: 3D Thinking Student Illustration */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative max-w-sm w-full">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-linear-to-br from-primary/20 via-info/15 to-transparent blur-3xl -z-10"
                  />
                  <img
                    src={landingQuestion}
                    alt="Student thoughtfully considering academic and career options"
                    className="mx-auto max-h-104 w-auto drop-shadow-md object-contain transition-transform duration-500 hover:scale-[1.01]"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 6: READY TO BEGIN BANNER (with landingFooter) */}
        <section
          className="px-4 pb-14 sm:px-6 lg:px-8 lg:pb-20"
          aria-labelledby="ready-title"
        >
          <ScrollReveal
            className="mx-auto flex max-w-300 flex-col items-center justify-between gap-8 overflow-hidden rounded-[2.5rem] border border-primary/25 bg-linear-to-r from-primary-soft via-surface to-primary-soft/40 p-7 shadow-sm sm:p-10 lg:flex-row"
            variant="right"
          >
            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-block font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
                When you are ready
              </span>
              <h2
                id="ready-title"
                className="mt-2 font-display text-2xl font-black tracking-[-0.03em] text-foreground sm:text-3xl lg:text-4xl"
              >
                Start building your recorded interest profile
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                Sign in or create a Student account to continue.
              </p>
              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                <Button
                  asChild
                  size="default"
                  className="rounded-full px-7 shadow-xs"
                >
                  <Link
                    to="/student/login"
                    onClick={(e) => {
                      e.preventDefault();
                      openAuth('signin');
                    }}
                  >
                    Start assessment
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="outline"
                  className="rounded-full bg-surface/90 px-6 font-semibold"
                >
                  <Link
                    to="/student/register"
                    onClick={(e) => {
                      e.preventDefault();
                      openAuth('signup');
                    }}
                  >
                    Get started now
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative shrink-0 max-w-xs sm:max-w-sm">
              <img
                src={landingFooter}
                alt="Two smiling students welcoming you to start your course recommendations"
                className="max-h-64 w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-[1.02]"
              />
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* REDESIGNED PUBLIC FOOTER */}
      <footer
        className="border-t border-border/80 bg-card/90 backdrop-blur-sm"
        aria-label="Public site footer"
      >
        <div className="mx-auto max-w-300 px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12 pb-10 border-b border-border/70">
            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="TCCence"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-sm font-semibold text-foreground">
                TCCence Recommendation System
              </p>
              <p className="max-w-md text-xs sm:text-sm leading-relaxed text-muted-foreground">
                An explainable vocational interest assessment and academic
                guidance platform tailored for Tagoloan Community College
                applicants.
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                Recommendations support exploration and do not guarantee
                admission or programme success.
              </p>
            </div>

            {/* Platform Navigation */}
            <div className="lg:col-span-3">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
                Platform
              </p>
              <ul className="mt-3.5 space-y-2.5 text-sm font-medium">
                <li>
                  <a
                    href="#landing-hero"
                    className="text-muted-foreground transition-colors hover:text-primary-ink"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#why-pathways"
                    className="text-muted-foreground transition-colors hover:text-primary-ink"
                  >
                    What We Provide
                  </a>
                </li>
                <li>
                  <a
                    href="#journey"
                    className="text-muted-foreground transition-colors hover:text-primary-ink"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#riasec"
                    className="text-muted-foreground transition-colors hover:text-primary-ink"
                  >
                    RIASEC Framework
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-muted-foreground transition-colors hover:text-primary-ink"
                  >
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <Link
                    to="/student/login"
                    onClick={(e) => {
                      e.preventDefault();
                      openAuth('signin');
                    }}
                    className="text-muted-foreground transition-colors hover:text-primary-ink"
                  >
                    Student sign in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/student/register"
                    onClick={(e) => {
                      e.preventDefault();
                      openAuth('signup');
                    }}
                    className="text-muted-foreground transition-colors hover:text-primary-ink"
                  >
                    Create account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Guidance boundaries */}
            <div className="lg:col-span-4">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-primary-ink">
                Guidance principles
              </p>
              <ul className="mt-3.5 space-y-2.5 text-sm font-medium text-muted-foreground">
                <li>Interest scores remain explainable.</li>
                <li>Entrance guidance stays separate from RIASEC fit.</li>
                <li>Recommendations support—not replace—advising.</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs font-medium text-muted-foreground sm:flex-row">
            <p>© 2026 Tagoloan Community College. Pathways Capstone Project.</p>
            <p>Built with deterministic RIASEC guidance and admission rules.</p>
          </div>
        </div>
      </footer>

      {/* Student Authentication Modal (Glassy / Glossy Card) */}
      <StudentAuthModal
        open={authModalOpen}
        onOpenChange={handleAuthOpenChange}
        initialMode={authModalMode}
      />
    </div>
  );
}

export { LandingPage };
