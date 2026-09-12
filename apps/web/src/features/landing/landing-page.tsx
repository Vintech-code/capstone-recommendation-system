import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowRight,
  BookCheck,
  ChartNoAxesCombined,
  Compass,
  FileText,
  Menu,
  X,
} from "lucide-react";

import landingHome from "@/assets/images/landing-image-home.png";
import landingBackground from "@/assets/images/landing-image-bg.png";
import landingJourney from "@/assets/images/landing-image2.png";
import landingQuestion from "@/assets/images/landing-image-question.png";
import landingFooter from "@/assets/images/landing-image-footer.png";
import logo from "@/assets/logo/header-logo.png";
import riasecR from "@/assets/landing/R.png";
import riasecI from "@/assets/landing/I.png";
import riasecA from "@/assets/landing/A.png";
import riasecS from "@/assets/landing/S.png";
import riasecE from "@/assets/landing/E.png";
import riasecC from "@/assets/landing/C.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StudentAuthModal } from "@/features/auth/components/student-auth-modal";

const reasons = [
  {
    icon: Compass,
    title: "Objective TCC Exploration",
    description: "See how your interests match the programs offered at TCC.",
  },
  {
    icon: BookCheck,
    title: "TCC Entrance Exam",
    description:
      "Use your TCC entrance exam score together with your RIASEC results.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Clear Results",
    description:
      "See your RIASEC results and understand why certain TCC programs are recommended.",
  },
  {
    icon: FileText,
    title: "Helpful Guidance",
    description:
      "Use your results as a guide when choosing the right program for you at TCC.",
  },
];

const journeySteps = [
  {
    number: "1",
    icon: FileText,
    title: "Enter your entrance exam result",
    description:
      "Enter your self-declared TCC entrance examination score (1.0–5.0). This establishes your eligibility group for TCC board or non-board programmes before taking the assessment.",
  },
  {
    number: "2",
    icon: Compass,
    title: "Answer honestly",
    description:
      "Answer 42 questions about your interests, activities, and preferences. Your answers are used to identify your RIASEC profile.",
  },
  {
    number: "3",
    icon: ChartNoAxesCombined,
    title: "Explore what fits",
    description:
      "View the TCC programs that match your interests and check your results to help you decide which program may be right for you.",
  },
];

const riasecAreas = [
  {
    code: "R",
    name: "Realistic",
    image: riasecR,
    alt: "Realistic Holland dimension",
    badgeBg: "bg-[#FEF6E4]",
    badgeText: "text-[#8C5D07]",
    circleBg: "bg-[#ECA72C]",
    description:
      "You enjoy hands-on work with tools, technical equipment, and machinery, solving real-world challenges through practical craftsmanship and tangible construction.",
  },
  {
    code: "I",
    name: "Investigative",
    image: riasecI,
    alt: "Investigative Holland dimension",
    badgeBg: "bg-[#EFF6FF]",
    badgeText: "text-[#1E40AF]",
    circleBg: "bg-[#2E75D3]",
    description:
      "You love discovering how things work through research, scientific inquiry, quantitative analysis, and solving complex intellectual or technical puzzles.",
  },
  {
    code: "A",
    name: "Artistic",
    image: riasecA,
    alt: "Artistic Holland dimension",
    badgeBg: "bg-[#F5EEFB]",
    badgeText: "text-[#6B21A8]",
    circleBg: "bg-[#B666D2]",
    description:
      "You thrive when expressing ideas creatively through design, digital media, writing, visual arts, and innovative, unstructured problem-solving.",
  },
  {
    code: "S",
    name: "Social",
    image: riasecS,
    alt: "Social Holland dimension",
    badgeBg: "bg-[#FFF0ED]",
    badgeText: "text-[#9A3412]",
    circleBg: "bg-[#FF6550]",
    description:
      "You find purpose in helping, mentoring, counseling, and teaching others, working collaboratively to support people and uplift your community.",
  },
  {
    code: "E",
    name: "Enterprising",
    image: riasecE,
    alt: "Enterprising Holland dimension",
    badgeBg: "bg-[#FFF1F2]",
    badgeText: "text-[#9F1239]",
    circleBg: "bg-[#E23B48]",
    description:
      "You are driven to take the lead, persuade others, launch initiatives, and make decisive decisions that guide teams toward shared goals.",
  },
  {
    code: "C",
    name: "Conventional",
    image: riasecC,
    alt: "Conventional Holland dimension",
    badgeBg: "bg-[#ECFDF5]",
    badgeText: "text-[#166534]",
    circleBg: "bg-[#289E62]",
    description:
      "You excel at organizing details, managing systematic workflows, working with data and records, and ensuring accuracy across structured processes.",
  },
];

const questions = [
  {
    question: "What is TCCence and who is it designed for?",
    answer:
      "TCCence is a course recommendation system built for students planning to study at Tagoloan Community College (TCC). It helps applicants who have taken the TCC entrance exam decide which TCC program to pursue.",
  },
  {
    question:
      "Does TCCence recommend programmes from other colleges or universities?",
    answer:
      "No. TCCence is designed exclusively for Tagoloan Community College. It only recommends official degree programs offered by TCC across its academic departments.",
  },
  {
    question: "How is my self-declared TCC entrance examination score used?",
    answer:
      "When you start, you enter your TCC entrance examination score (1.0 to 5.0). Scores from 1.0 to 2.5 indicate eligibility for board programs, while scores from 2.6 to 5.0 correspond to non-board programs. Available TCC programs are then ranked by your RIASEC interest fit while clearly showing your eligibility track.",
  },
  {
    question: "How does the RIASEC assessment match me to TCC programmes?",
    answer:
      "The questionnaire measures your interests across the six RIASEC themes. Your profile is compared directly with the curriculum attributes and Holland codes of TCC programs to calculate clear compatibility scores.",
  },
  {
    question:
      "Does a high recommendation match guarantee admission to my chosen TCC programme?",
    answer:
      "No. TCCence is an academic decision-support tool. Official admission and enrolment remain governed exclusively by Tagoloan Community College admission quotas, interview evaluations, and verification of documentary credentials by the TCC Registrar.",
  },
  {
    question:
      "Can I save my results and present them during TCC enrolment advising?",
    answer:
      "Yes. Your completed assessment and ranked TCC programme recommendations are preserved in your student profile. You can log in anytime to review your match scores, inspect rule explanations, or discuss them with TCC guidance counselors and faculty advisors.",
  },
];

const landingNavigation = [
  { href: "#landing-hero", label: "Home" },
  { href: "#why-pathways", label: "What We Provide" },
  { href: "#journey", label: "How It Works" },
  { href: "#riasec", label: "RIASEC" },
  { href: "#faq", label: "FAQ" },
] as const;

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
  initialAuth?: "signin" | "signup";
}

function LandingPage({ initialAuth }: LandingPageProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const authQuery = searchParams.get("auth");
  const googleError = searchParams.get("google_error");

  const requestedAuth =
    initialAuth ??
    (authQuery === "signup"
      ? "signup"
      : authQuery === "signin" || googleError
        ? "signin"
        : null);

  const [authOverride, setAuthOverride] = useState<{
    open: boolean;
    mode: "signin" | "signup";
  } | null>(null);

  const authModalOpen = authOverride
    ? authOverride.open
    : Boolean(requestedAuth);
  const authModalMode = authOverride
    ? authOverride.mode
    : (requestedAuth ?? "signin");

  const [isScrolled, setIsScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 20,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAuth = (mode: "signin" | "signup" = "signin") => {
    setAuthOverride({ open: true, mode });
  };

  const handleAuthOpenChange = (open: boolean) => {
    setAuthOverride({ open, mode: authModalMode });
    if (!open) {
      if (searchParams.has("auth") || searchParams.has("google_error")) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("auth");
        nextParams.delete("google_error");
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
            ? "pointer-events-none px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8"
            : "pointer-events-auto px-0 pt-0",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto relative mx-auto flex flex-col transition-all duration-300 ease-in-out",
            isScrolled
              ? "max-w-255 rounded-full border border-border/80 bg-surface/95 px-4 py-2 backdrop-blur-md sm:px-6 sm:py-2.5"
              : "w-full max-w-full border-b border-transparent bg-transparent px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8",
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
              {landingNavigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right Action Button (Layered 3D Button) */}
            <div className="relative hidden group shrink-0 md:inline-flex">
              <span
                aria-hidden="true"
                className="absolute -inset-px translate-y-0.5 rounded-full bg-[#b8f572] border border-[#85d826]/70 shadow-xs transition-transform duration-150 group-hover:translate-y-px group-active:translate-y-0"
              />
              <Button
                asChild
                size="sm"
                className={cn(
                  "relative inline-flex rounded-full font-bold shadow-xs transition-all duration-150 bg-primary text-white border border-[#62ad19]/40 hover:bg-[#70c21d] active:translate-y-1",
                  isScrolled
                    ? "px-3.5 py-1 text-xs sm:text-sm sm:px-4"
                    : "px-3.5 sm:px-4.5",
                )}
              >
                <Link
                  to="/student/login"
                  onClick={(e) => {
                    e.preventDefault();
                    openAuth("signin");
                  }}
                >
                  Start assessment
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </Button>
            </div>

            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 md:hidden"
            >
              {mobileMenuOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>

          <nav
            id="landing-mobile-navigation"
            aria-label="Mobile landing navigation"
            aria-hidden={!mobileMenuOpen}
            className={cn(
              "absolute inset-x-0 top-full z-50 border-b border-border bg-surface px-4 py-3 shadow-sm transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:hidden",
              mobileMenuOpen
                ? "visible translate-y-0 opacity-100"
                : "invisible pointer-events-none -translate-y-2 opacity-0",
            )}
          >
            <div className="mx-auto grid max-w-300 gap-1">
              {landingNavigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-primary-soft hover:text-primary-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
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
              Discover your interests.
              <span className="mt-0.5 block text-primary-ink">
                Find your TCC path.
              </span>
            </h1>

            {/* Supporting Description (minimized to 2 lines) */}
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:max-w-2xl sm:text-base">
              Complete the RIASEC assessment to discover which TCC
              <br className="hidden sm:inline" /> programs best match your
              interests and entrance exam results.
            </p>

            {/* Action Buttons */}
            <div className="landing-stagger mt-4.5 flex items-center justify-center">
              <div className="relative inline-flex group w-full sm:w-auto shrink-0">
                <span
                  aria-hidden="true"
                  className="absolute -inset-px translate-y-0.5 sm:translate-y-1 rounded-full bg-[#b8f572] border border-[#85d826]/70 shadow-xs transition-transform duration-150 group-hover:translate-y-px group-active:translate-y-0"
                />
                <Button
                  asChild
                  size="default"
                  className="relative inline-flex w-full sm:w-auto rounded-full px-6 font-bold shadow-xs transition-all duration-150 bg-primary text-white border border-[#62ad19]/40 hover:bg-[#70c21d] active:translate-y-1 sm:active:translate-y-1.5"
                >
                  <Link
                    to="/student/login"
                    onClick={(e) => {
                      e.preventDefault();
                      openAuth("signin");
                    }}
                  >
                    Start assessment
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </div>
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
                Understand your interests, check your results, and explore the
                TCC programs that may be a good fit for you.
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
                className="rounded-full px-7 text-white shadow-xs"
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
                  Answer a few questions, check your results, and explore the
                  TCC programs that match your interests.
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
                    className="rounded-full px-7 text-white shadow-xs"
                  >
                    <Link
                      to="/student/login"
                      onClick={(e) => {
                        e.preventDefault();
                        openAuth("signin");
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

        {/* SECTION 4: DISCOVER RIASEC (Transparent 3D Assets with Matched Letter Colors) */}
        <section
          id="riasec"
          className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8 lg:py-24 bg-surface-subtle/30 border-y border-border/60"
          aria-labelledby="riasec-title"
        >
          <ScrollReveal className="mx-auto max-w-300" variant="scale">
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id="riasec-title"
                className="mt-2.5 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                What is RIASEC?
              </h2>
              <h3 className="sr-only">Six ways interests can show up</h3>
              <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg font-normal leading-relaxed text-muted-foreground">
                The RIASEC model organizes vocational interests into six
                distinct learning and career themes. By understanding your
                interests and strengths, you can explore which TCC degree
                programmes best match how you like to learn and work.
              </p>
            </div>

            {/* 6 RIASEC Category Dimensions without background cards behind PNGs */}
            <div
              data-testid="riasec-grid"
              className="landing-stagger mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:mt-12 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3"
            >
              {riasecAreas.map((area) => (
                <article
                  key={area.code}
                  className="group flex flex-col items-center text-center"
                >
                  {/* 3D Transparent Illustration without any background card */}
                  <div className="relative flex aspect-square w-full max-w-40 items-center justify-center transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105 sm:max-w-[250px]">
                    <img
                      src={area.image}
                      alt={area.alt}
                      loading="lazy"
                      className="size-full object-contain drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-md"
                    />
                  </div>

                  {/* Centered Pill Badge matching the letter PNG color */}
                  <div className="mt-3 flex flex-col items-center sm:mt-5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-transform duration-200 group-hover:scale-105 sm:gap-2 sm:px-3.5 sm:text-sm",
                        area.badgeBg,
                        area.badgeText,
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white shadow-xs",
                          area.circleBg,
                        )}
                        aria-hidden="true"
                      >
                        {area.code}
                      </span>
                      <span>{area.name}</span>
                    </span>

                    {/* Original Custom Description Text */}
                    <p className="mt-2 max-w-xs text-[11px] font-medium leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">
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
          className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
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
                  Frequently Asked Questions
                </h2>
                <p className="mt-3 text-sm sm:text-base font-medium leading-relaxed text-muted-foreground">
                  Find answers to common questions about the RIASEC assessment,
                  entrance exam scoring, and program recommendations at Tagoloan
                  Community College.
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
                      <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-open:grid-rows-[1fr] group-open:opacity-100 motion-reduce:transition-none">
                        <div className="overflow-hidden">
                          <p className="max-w-3xl pb-4 pr-8 text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm sm:leading-6">
                            {answer}
                          </p>
                        </div>
                      </div>
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
                Sign in or create a Student account to discover which TCC
                programs best match your interests and entrance exam results.
              </p>
              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                <Button
                  asChild
                  size="default"
                  className="rounded-full px-7 text-white shadow-xs"
                >
                  <Link
                    to="/student/login"
                    onClick={(e) => {
                      e.preventDefault();
                      openAuth("signin");
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
                      openAuth("signup");
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

      {/* PUBLIC FOOTER */}
      <footer
        className="relative isolate overflow-hidden bg-primary text-white"
        aria-label="Public site footer"
      >
        <div className="relative z-10 mx-auto max-w-300 px-4 pb-32 pt-12 sm:px-6 sm:pb-40 lg:px-8 lg:pb-48 lg:pt-16">
          <div className="grid gap-10 border-b border-white/25 pb-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
            {/* Brand Column */}
            <div className="space-y-3.5 lg:col-span-5">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="TCCence"
                  className="h-11 w-auto object-contain"
                />
              </div>
              <p className="text-sm font-semibold text-white">
                TCCence Recommendation System
              </p>
              <p className="max-w-md text-xs leading-relaxed text-white/90 sm:text-sm">
                An explainable vocational interest assessment and guidance
                platform built specifically for students applying to Tagoloan
                Community College.
              </p>
              <p className="text-xs font-medium text-white/90">
                Recommendations support exploration and do not guarantee
                admission or programme success.
              </p>
            </div>

            {/* Platform Navigation */}
            <div className="lg:col-span-3">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white">
                Explore
              </p>
              <ul className="mt-3.5 space-y-2.5 text-sm font-medium">
                <li>
                  <a
                    href="#landing-hero"
                    className="text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#why-pathways"
                    className="text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50"
                  >
                    What We Provide
                  </a>
                </li>
                <li>
                  <a
                    href="#journey"
                    className="text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#riasec"
                    className="text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50"
                  >
                    RIASEC Framework
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/50"
                  >
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            {/* Guidance boundaries */}
            <div className="lg:col-span-4">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white">
                Guidance principles
              </p>
              <ul className="mt-3.5 space-y-2.5 text-sm font-medium text-white/90">
                <li>
                  Specifically tailored to academic programs offered at TCC.
                </li>
                <li>
                  Self-declared TCC entrance exam guidance stays transparent.
                </li>
                <li>
                  Recommendations support—not replace—official TCC admission
                  advising.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <img
          src={logo}
          alt=""
          aria-hidden="true"
          data-testid="footer-logo-watermark"
          className="pointer-events-none absolute -bottom-4 left-1/2 z-0 w-[min(88vw,54rem)] -translate-x-1/2 select-none opacity-10 brightness-0 invert sm:-bottom-8"
        />
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
