import { ArrowLeft, BookOpen, BriefcaseBusiness, Shapes } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LifecycleStatusBadge } from '@/features/admin/courses-rules/components/lifecycle-status-badge'
import { mockCourses } from '@/features/admin/courses-rules/data/mock-courses-rules'

function CourseDetailPage({
  courseId,
  onBack,
}: {
  courseId: string
  onBack: () => void
}) {
  const course = mockCourses.find((item) => item.id === courseId)

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-background p-8 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold">Course not found</h1>
        <Button type="button" className="mt-6" onClick={onBack}>
          Back to catalogue
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[90rem]">
      <Button type="button" variant="ghost" onClick={onBack} className="-ml-3">
        <ArrowLeft aria-hidden="true" />
        Course catalogue
      </Button>
      <div className="mt-5 flex flex-col gap-5 rounded-2xl bg-background p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
            <BookOpen aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-mono text-xs font-bold text-muted-foreground">
              {course.code} · {course.id}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">
              {course.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {course.department}
            </p>
          </div>
        </div>
        <LifecycleStatusBadge status={course.status} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl bg-background p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-extrabold">Program overview</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            {course.summary}
          </p>
          <dl className="mt-7 grid gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Level</dt>
              <dd className="mt-1 font-bold">{course.level}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Duration</dt>
              <dd className="mt-1 font-bold">{course.duration}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Classification</dt>
              <dd className="mt-1 font-bold">
                {course.boardCourse ? 'Board course' : 'Non-board course'}
              </dd>
            </div>
          </dl>
        </section>
        <section className="rounded-2xl bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Shapes className="size-5 text-primary" />
            <h2 className="font-extrabold">Interest profile</h2>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {course.interestProfile.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-primary/8 px-3 py-1.5 text-xs font-bold text-primary"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-2xl bg-background p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="size-5 text-primary" />
            <h2 className="font-extrabold">Career pathways</h2>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {course.careerPaths.map((path) => (
              <li key={path} className="rounded-xl bg-secondary/70 p-4 font-bold">
                {path}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export { CourseDetailPage }
