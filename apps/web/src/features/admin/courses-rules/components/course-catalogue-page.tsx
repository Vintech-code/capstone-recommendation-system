import { ArrowRight, BookOpen, Scale, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminPageHeader } from '@/features/admin/components/admin-page-header'
import { LifecycleStatusBadge } from '@/features/admin/courses-rules/components/lifecycle-status-badge'
import { mockCourses } from '@/features/admin/courses-rules/data/mock-courses-rules'

function CourseCataloguePage({
  onOpenCourse,
  onOpenRules,
}: {
  onOpenCourse: (id: string) => void
  onOpenRules: () => void
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const courses = useMemo(() => {
    const search = query.trim().toLowerCase()
    return mockCourses.filter(
      (course) =>
        (status === 'all' || course.status === status) &&
        (!search ||
          `${course.code} ${course.name} ${course.department}`
            .toLowerCase()
            .includes(search)),
    )
  }, [query, status])

  return (
    <div className="mx-auto max-w-[90rem]">
      <AdminPageHeader
        title="Course catalogue"
        description="Review program information, lifecycle status, board-course classification, and interest profiles."
        actions={
          <Button type="button" variant="secondary" onClick={onOpenRules}>
            <Scale aria-hidden="true" />
            Admission rules
          </Button>
        }
      />

      <div className="mt-7 flex flex-col gap-3 rounded-2xl bg-background p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Label htmlFor="course-search" className="sr-only">
            Search course catalogue
          </Label>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="course-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search course, code, or department"
            className="pl-9"
          />
        </div>
        <Label className="sr-only" htmlFor="course-status">
          Filter by course status
        </Label>
        <select
          id="course-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="min-h-12 rounded-xl border border-input bg-background px-4 text-sm font-semibold"
        >
          <option value="all">All statuses</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Retired</option>
        </select>
      </div>

      {courses.length ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col rounded-2xl bg-background p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <BookOpen aria-hidden="true" className="size-5" />
                </span>
                <LifecycleStatusBadge status={course.status} />
              </div>
              <p className="mt-7 font-mono text-xs font-bold text-muted-foreground">
                {course.code} · {course.id}
              </p>
              <h2 className="mt-2 text-lg font-extrabold">{course.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {course.department}
              </p>
              <p className="mt-4 flex-1 text-sm leading-6 text-muted-foreground">
                {course.summary}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">
                  {course.level}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">
                  {course.duration}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">
                  {course.boardCourse ? 'Board course' : 'Non-board course'}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="mt-6 w-full"
                onClick={() => onOpenCourse(course.id)}
              >
                Open course
                <ArrowRight aria-hidden="true" />
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-background p-10 text-center shadow-sm">
          <h2 className="text-lg font-extrabold">No courses found</h2>
          <Button
            type="button"
            variant="secondary"
            className="mt-5"
            onClick={() => {
              setQuery('')
              setStatus('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}

export { CourseCataloguePage }
