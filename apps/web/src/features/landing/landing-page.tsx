import {
  ArrowRight,
  ClipboardCheck,
  Compass,
  Database,
  FileClock,
  GraduationCap,
  ListChecks,
  Route as RouteIcon,
  SearchCheck,
  ShieldCheck,
  UserRoundCheck,
} from 'lucide-react'
import { Link } from 'react-router'

import landingArtwork from '@/assets/bg-landing.png'
import logo from '@/assets/logo-optimized.png'
import { Button } from '@/components/ui/button'

const highlights = [
  { icon: Database, title: 'Locally managed', detail: 'Project-owned questionnaire' },
  { icon: Compass, title: 'Six interest areas', detail: 'Recorded separately' },
  { icon: SearchCheck, title: 'Explainable matches', detail: 'Reasons you can review' },
  { icon: FileClock, title: 'Versioned history', detail: 'Past results stay available' },
]

const riasecAreas = [
  {
    code: 'R',
    name: 'Realistic',
    description: 'Interest in practical activities, tools, materials, and hands-on problem-solving.',
    className: 'bg-riasec-r/10 text-riasec-r ring-riasec-r/20',
  },
  {
    code: 'I',
    name: 'Investigative',
    description: 'Interest in examining questions, working with information, and understanding how things work.',
    className: 'bg-riasec-i/10 text-riasec-i ring-riasec-i/20',
  },
  {
    code: 'A',
    name: 'Artistic',
    description: 'Interest in expression, imagination, design, and exploring original ways to communicate ideas.',
    className: 'bg-riasec-a/10 text-riasec-a ring-riasec-a/20',
  },
  {
    code: 'S',
    name: 'Social',
    description: 'Interest in helping, teaching, communicating, and working with people in supportive settings.',
    className: 'bg-riasec-s/10 text-riasec-s ring-riasec-s/20',
  },
  {
    code: 'E',
    name: 'Enterprising',
    description: 'Interest in initiating plans, leading activities, persuading, and coordinating toward a goal.',
    className: 'bg-riasec-e/10 text-riasec-e ring-riasec-e/20',
  },
  {
    code: 'C',
    name: 'Conventional',
    description: 'Interest in organizing details, records, routines, and structured information carefully.',
    className: 'bg-riasec-c/10 text-riasec-c ring-riasec-c/20',
  },
]

const journeySteps = [
  {
    number: '01',
    icon: UserRoundCheck,
    title: 'Create your Student account',
    description: 'Sign in and provide the self-declared entrance examination result required before assessment.',
  },
  {
    number: '02',
    icon: ClipboardCheck,
    title: 'Complete the assessment',
    description: 'Respond to each locally stored RIASEC statement using the available answer choices.',
  },
  {
    number: '03',
    icon: RouteIcon,
    title: 'Review programme directions',
    description: 'Explore eligible programmes, recorded match values, and the evidence used for each recommendation.',
  },
]

const reasons = [
  {
    icon: Database,
    title: 'Locally controlled questions',
    description: 'The assessment content is stored and versioned within the project instead of fetched from a live questionnaire API.',
  },
  {
    icon: ListChecks,
    title: 'Recorded evidence',
    description: 'Your result keeps the assessment, scoring, entrance-rule, catalogue, and recommendation versions used at that time.',
  },
  {
    icon: SearchCheck,
    title: 'Reasons beside each match',
    description: 'Programme recommendations connect your recorded scores with configured programme areas and catalogue information.',
  },
  {
    icon: ShieldCheck,
    title: 'Guidance, not a guarantee',
    description: 'A recommendation supports exploration. It does not promise admission, enrolment, academic success, or a final course choice.',
  },
]

const questions = [
  {
    question: 'What does RIASEC mean?',
    answer: 'RIASEC groups vocational interests into six areas: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. The system records all six scores and shows the leading pattern without treating it as a diagnosis or ability test.',
  },
  {
    question: 'Who can use the assessment?',
    answer: 'The current assessment flow is designed for Student Applicants using an individual Student account.',
  },
  {
    question: 'Why is an entrance examination result requested?',
    answer: 'The project uses a self-declared entrance result to determine the eligible programme group before RIASEC-based ranking. This project rule does not guarantee admission.',
  },
  {
    question: 'How are programme recommendations produced?',
    answer: 'The Laravel backend applies the stored entrance rule first, then compares the recorded RIASEC scores with versioned programme profiles using a deterministic matching process.',
  },
  {
    question: 'What will I see after finishing?',
    answer: 'When processing is complete, you can review your recorded interest pattern, score breakdown, ranked programme matches, matching reasons, and result history.',
  },
  {
    question: 'Does a recommendation decide my course?',
    answer: 'No. The result is decision-support guidance. You remain responsible for your final programme choice, and admission requirements still apply.',
  },
]

function LandingPage() {
  return (
    <div className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
          <a href="#top" aria-label="Pathways home" className="rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35">
            <img src={logo} alt="Pathways" className="h-12 w-auto object-contain sm:h-14" />
          </a>

          <nav aria-label="Landing page" className="hidden items-center gap-7 text-sm font-semibold lg:flex">
            <a className="transition-colors hover:text-primary" href="#riasec">RIASEC</a>
            <a className="transition-colors hover:text-primary" href="#how-it-works">How it works</a>
            <a className="transition-colors hover:text-primary" href="#why-pathways">Why Pathways</a>
            <a className="transition-colors hover:text-primary" href="#questions">Questions</a>
          </nav>

          <Button asChild className="h-11 rounded-full px-5 sm:px-6">
            <Link to="/student/login">
              Start assessment
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <main id="top">
        <section className="px-4 pt-5 sm:px-6 sm:pt-7 lg:px-8" aria-labelledby="landing-title">
          <div className="relative mx-auto grid min-h-[38rem] max-w-[1200px] overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary-fixed via-white to-info/10 px-6 py-12 shadow-[var(--shadow-card)] sm:px-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:px-14 lg:py-16">
            <div aria-hidden="true" className="absolute -left-24 top-16 size-64 rounded-full bg-brand-green/12 blur-3xl" />
            <div aria-hidden="true" className="absolute bottom-0 right-0 h-48 w-2/3 rounded-tl-full bg-info/8" />

            <div className="relative z-10 max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
                <GraduationCap aria-hidden="true" className="size-4" />
                For TCC Student Applicants
              </p>
              <h1 id="landing-title" className="mt-7 font-display text-4xl font-black leading-[1.05] tracking-[-0.05em] text-brand-dark sm:text-5xl lg:text-6xl">
                Explore your interests.
                <span className="mt-1 block text-primary">Understand your options.</span>
              </h1>
              <p className="mt-6 max-w-[36rem] text-base font-medium leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Complete a locally managed RIASEC assessment and review programme recommendations supported by your recorded scores, eligible programme group, and configured catalogue evidence.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full px-7">
                  <Link to="/student/login">
                    Start assessment
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full bg-white/80 px-7">
                  <Link to="/student/login">Student sign in</Link>
                </Button>
              </div>
              <p className="mt-5 text-sm font-medium leading-6 text-muted-foreground">
                Recommendations support exploration and do not guarantee admission or programme success.
              </p>
            </div>

            <div className="relative mt-10 min-h-72 lg:mt-0 lg:min-h-[34rem]" aria-hidden="true">
              <img
                src={landingArtwork}
                alt=""
                className="absolute left-1/2 top-1/2 w-[155%] max-w-none -translate-x-[47%] -translate-y-1/2 object-contain sm:w-[135%] lg:w-[155%]"
              />
            </div>
          </div>
        </section>

        <section aria-label="Assessment highlights" className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-card)] lg:grid-cols-4">
            {highlights.map(({ icon: Icon, title, detail }, index) => (
              <div key={title} className={`flex min-h-36 flex-col items-center justify-center px-4 py-6 text-center ${index % 2 ? 'border-l border-border' : ''} ${index > 1 ? 'border-t border-border lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l' : ''}`}>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <strong className="mt-3 font-display text-base font-extrabold">{title}</strong>
                <span className="mt-1 text-xs font-medium leading-5 text-muted-foreground">{detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="riasec" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="riasec-title">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-2xl">
              <p className="eyebrow">Your recorded interest areas</p>
              <h2 id="riasec-title" className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-4xl">Six ways interests can show up</h2>
              <p className="mt-4 text-base font-medium leading-7 text-muted-foreground">
                RIASEC provides six categories for organizing vocational interests. It does not measure intelligence, diagnose personality, or decide what programme you must take.
              </p>
            </div>

            <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {riasecAreas.map((area) => (
                <article key={area.code} className="group grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-t border-border py-6">
                  <div className={`flex size-16 items-center justify-center rounded-[1.35rem] font-display text-4xl font-black ring-1 transition-transform duration-200 group-hover:-translate-y-0.5 ${area.className}`} aria-hidden="true">
                    {area.code}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-extrabold">{area.name}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{area.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-secondary/65 px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="steps-title">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-2xl">
              <p className="eyebrow">How the journey works</p>
              <h2 id="steps-title" className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-4xl">Three clear stages, with evidence at each step</h2>
              <p className="mt-4 text-base font-medium leading-7 text-muted-foreground">Move from account setup to a recorded result and programme directions you can inspect.</p>
            </div>

            <ol className="mt-10 grid gap-5 lg:grid-cols-3">
              {journeySteps.map(({ number, icon: Icon, title, description }) => (
                <li key={number} className="relative overflow-hidden rounded-3xl border border-border bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-black tracking-[0.12em] text-primary">{number}</span>
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary"><Icon aria-hidden="true" className="size-6" /></span>
                  </div>
                  <h3 className="mt-8 font-display text-xl font-extrabold">{title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{description}</p>
                </li>
              ))}
            </ol>

            <div className="mt-9 text-center">
              <Button asChild size="lg" className="rounded-full px-8"><Link to="/student/login">Begin your assessment <ArrowRight aria-hidden="true" /></Link></Button>
            </div>
          </div>
        </section>

        <section id="why-pathways" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="why-title">
          <div className="mx-auto overflow-hidden rounded-[2rem] bg-brand-dark px-6 py-10 text-white shadow-[var(--shadow-card)] sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-green">Why Pathways</p>
              <h2 id="why-title" className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-4xl">Guidance you can understand and revisit</h2>
              <p className="mt-4 text-base font-medium leading-7 text-white/75">The system keeps eligibility and interest matching separate, then presents the recorded basis for each recommendation.</p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {reasons.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-3xl border border-white/15 bg-white/8 p-6">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-white/12 text-brand-green"><Icon aria-hidden="true" className="size-5" /></span>
                  <h3 className="mt-5 font-display text-xl font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-white/72">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="questions" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="questions-title">
          <div className="mx-auto max-w-[960px]">
            <div className="text-center">
              <p className="eyebrow justify-center">Questions before you begin</p>
              <h2 id="questions-title" className="mt-3 font-display text-3xl font-black tracking-[-0.04em] sm:text-4xl">Know what the result can—and cannot—tell you</h2>
            </div>

            <div className="mt-10 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-white shadow-[var(--shadow-card)]">
              {questions.map(({ question, answer }) => (
                <details key={question} className="group px-5 py-1 open:bg-secondary/45 sm:px-7">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 font-display text-base font-extrabold focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35 sm:text-lg">
                    {question}
                    <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xl font-medium text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="max-w-3xl pb-5 pr-10 text-sm font-medium leading-6 text-muted-foreground sm:text-base sm:leading-7">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24" aria-labelledby="ready-title">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-7 overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-r from-primary-fixed via-white to-info/10 px-6 py-9 sm:px-10 lg:flex-row lg:items-center lg:px-12">
            <div>
              <p className="eyebrow">When you are ready</p>
              <h2 id="ready-title" className="mt-2 font-display text-2xl font-black tracking-[-0.03em] sm:text-3xl">Start building your recorded interest profile</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">Sign in or create a Student account to continue.</p>
            </div>
            <Button asChild size="lg" className="w-full rounded-full px-8 sm:w-auto"><Link to="/student/login">Start assessment <ArrowRight aria-hidden="true" /></Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white" aria-label="Public site footer">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <img src={logo} alt="" className="h-14 w-auto object-contain" />
            <p className="max-w-sm text-xs font-medium leading-5 text-muted-foreground">TCC course-recommendation decision support for Student Applicants.</p>
          </div>
          <nav aria-label="Portal links" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <Link className="hover:text-primary" to="/student/login">Student sign in</Link>
            <Link className="hover:text-primary" to="/student/register">Create account</Link>
            <Link className="hover:text-primary" to="/admin/login">Administrator sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export { LandingPage }
