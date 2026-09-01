import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  History,
  Search,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
  EmptyPanel,
} from "@/features/admin/components/admin-shared";
import { formatDate, humanize } from "@/features/admin/data/admin-formatters";
import {
  useAdminResource,
  type AdminActivityResponse,
  type AdminAssessment,
  type AdminStudentDirectory,
  type AdminStudentRecord,
} from "@/features/admin/data/admin-api";

export { AdminDashboardPage } from "@/features/admin/components/admin-dashboard-page";

interface NavigateProps {
  onNavigate: (path: string) => void;
}

function AdminStudentsPage({ onNavigate }: NavigateProps) {
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [status, setStatus] = useState("all");
  const [eligibility, setEligibility] = useState("all");
  const [sort, setSort] = useState("last_activity");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({
    page: String(page),
    perPage: "20",
    sort,
    direction: sort === "name" ? "asc" : "desc",
  });
  if (applied) params.set("search", applied);
  if (status !== "all") params.set("status", status);
  if (eligibility !== "all") params.set("eligibility", eligibility);
  const resource = useAdminResource<AdminStudentDirectory>(
    `/students?${params}`,
  );
  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data)
    return (
      <AdminPageError
        message={resource.error ?? "No student monitoring data was returned."}
        onRetry={resource.retry}
      />
    );
  const data = resource.data;
  return (
    <div className="min-w-0 space-y-7">
      <AdminPageHeader
        eyebrow="Student journey index"
        title="Student records"
        description="Search authoritative Student journeys and open immutable assessment evidence."
      />
      <section data-student-records className="min-w-0">
        <form
          className="grid gap-3 border-y border-border p-4 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_12rem_12rem_11rem_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setApplied(query.trim());
          }}
        >
          <label className="relative md:col-span-2 xl:col-span-1">
            <span className="sr-only">Search student records</span>
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, reference, or RIASEC"
              className="pl-10"
            />
          </label>
          <FilterSelect
            label="Filter by assessment status"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={studentStatusOptions}
          />
          <FilterSelect
            label="Filter by eligibility group"
            value={eligibility}
            onChange={(value) => {
              setEligibility(value);
              setPage(1);
            }}
            options={eligibilityOptions}
          />
          <FilterSelect
            label="Sort student records"
            value={sort}
            onChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            options={sortOptions}
          />
          <Button type="submit">Search</Button>
        </form>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Authoritative ledger
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">
              {data.pagination.total} profiles in view
            </h2>
          </div>
          <p className="font-label text-sm text-muted-foreground">
            Showing {data.pagination.from ?? 0}–{data.pagination.to ?? 0}
          </p>
        </div>
        {data.items.length ? (
          <ul className="mt-4 divide-y divide-border border-y border-border sm:hidden">
            {data.items.map((student) => (
              <li key={student.id} className="py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-base">{student.name}</strong>
                    <span className="font-label text-xs text-muted-foreground">
                      {student.email}
                    </span>
                  </div>
                  <StudentStatus student={student} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-4">
                  <InlineEvidence
                    label="Entrance"
                    value={
                      student.declarationStatus === "declared"
                        ? `${student.selfDeclaredScore} · ${humanize(student.eligibilityGroup ?? "")}`
                        : "Not declared"
                    }
                  />
                  <InlineEvidence
                    label="Latest RIASEC"
                    value={student.latestTopCode ?? "Pending"}
                  />
                  <InlineEvidence
                    label="Attempts"
                    value={String(student.attemptCount)}
                  />
                  <InlineEvidence
                    label="Saved programmes"
                    value={String(student.savedProgrammeCount)}
                  />
                </dl>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => onNavigate(`/admin/students/${student.id}`)}
                >
                  Open student evidence <ArrowRight />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {data.items.length ? (
          <div className="mt-4 hidden overflow-x-auto border-y border-border sm:block">
            <table className="w-full min-w-[70rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border font-label text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="px-4 py-4">Student</th>
                  <th className="px-4 py-4">Journey state</th>
                  <th className="px-4 py-4">Assessment evidence</th>
                  <th className="px-4 py-4">Recommendation</th>
                  <th className="px-4 py-4">Last activity</th>
                  <th className="px-4 py-4">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((student) => (
                  <tr
                    key={student.id}
                    className="group hover:bg-primary-fixed/30"
                  >
                    <td className="px-4 py-5">
                      <strong className="block text-base">
                        {student.name}
                      </strong>
                      <span className="font-label text-xs text-muted-foreground">
                        {student.email}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <StudentStatus student={student} />
                      <span className="mt-2 block text-xs text-muted-foreground">
                        {student.declarationStatus === "declared"
                          ? `${student.selfDeclaredScore} · ${humanize(student.eligibilityGroup ?? "")}`
                          : "Entrance result not declared"}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className="font-display text-lg font-extrabold">
                        {student.attemptCount}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        attempts
                      </span>
                      <span className="mt-1 block font-label text-xs">
                        RIASEC {student.latestTopCode ?? "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <Badge
                        variant={
                          student.recommendationAvailable
                            ? "success"
                            : "secondary"
                        }
                      >
                        {student.recommendationAvailable
                          ? "Available"
                          : "Pending"}
                      </Badge>
                      <span className="mt-2 block text-xs text-muted-foreground">
                        {student.savedProgrammeCount} saved
                      </span>
                    </td>
                    <td className="px-4 py-5 font-label text-xs text-muted-foreground">
                      {formatDate(student.lastActivityAt)}
                    </td>
                    <td className="px-4 py-5">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          onNavigate(`/admin/students/${student.id}`)
                        }
                      >
                        Open <ArrowRight />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyPanel
              title="No student records match"
              description="Change the search or filters."
            />
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= data.pagination.lastPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </section>
    </div>
  );
}

const studentStatusOptions: Array<[string, string]> = [
  ["all", "All statuses"],
  ["not_started", "Not started"],
  ["in_progress", "In progress"],
  ["preparing_result", "Processing"],
  ["result_available", "Result available"],
  ["result_failed", "Needs attention"],
];
const eligibilityOptions: Array<[string, string]> = [
  ["all", "All eligibility"],
  ["board", "Board eligible"],
  ["non_board", "Non-board eligible"],
  ["not_declared", "Not declared"],
];
const sortOptions: Array<[string, string]> = [
  ["last_activity", "Recent activity"],
  ["name", "Student name"],
  ["attempt_count", "Attempt count"],
];
function StudentStatus({
  student,
}: {
  student: AdminStudentDirectory["items"][number];
}) {
  return student.currentAssessmentStatus === "not_started" ? (
    <Badge variant="secondary">Not started</Badge>
  ) : (
    <StatusBadge status={student.currentAssessmentStatus} />
  );
}

function AdminStudentDetailPage({
  studentId,
  onNavigate,
}: {
  studentId: string;
  onNavigate: (path: string) => void;
}) {
  const resource = useAdminResource<AdminStudentRecord>(
    `/students/${studentId}`,
  );
  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data)
    return (
      <AdminPageError
        message={resource.error ?? "No student record was returned."}
        onRetry={resource.retry}
      />
    );
  const student = resource.data;
  const initials = student.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div className="space-y-8" data-report-print>
      <AdminPageHeader
        eyebrow="Immutable student evidence"
        title={student.name}
        description="One authoritative view of declarations, assessment attempts, scores, and recommendation snapshots."
        action={
          <Button
            variant="outline"
            onClick={() => onNavigate("/admin/students")}
          >
            Back to students
          </Button>
        }
      />
      <section className="grid border-y border-border lg:grid-cols-[minmax(0,1.2fr)_minmax(28rem,.8fr)]">
        <div className="flex items-center gap-5 py-6 sm:py-8">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border font-display text-xl font-black text-accent">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{student.email}</p>
            <p className="mt-1 font-label text-sm text-muted-foreground">
              Account status · {humanize(student.accountStatus)}
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-2 border-t border-border lg:border-l lg:border-t-0">
          <MetricDefinition
            label="Recorded attempts"
            value={student.attempts.length}
          />
          <MetricDefinition
            label="Saved programmes"
            value={student.savedProgrammeCount}
          />
        </dl>
      </section>
      <section aria-labelledby="evidence-timeline-heading">
        <SectionHeading
          id="evidence-timeline-heading"
          eyebrow="Versioned record"
          title="Assessment evidence timeline"
          description="Completed records remain read-only; each attempt preserves its own rule and recommendation references."
        />
        {student.attempts.length ? (
          <ol className="mt-6 border-t border-border">
            {student.attempts.map((attempt) => (
              <li
                key={attempt.id}
                className="grid border-b border-border py-7 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-8"
              >
                <div className="mb-5 lg:mb-0">
                  <span className="font-display text-5xl font-black text-primary/20">
                    {String(attempt.attemptNumber).padStart(2, "0")}
                  </span>
                  <p className="mt-1 font-label text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    Attempt {attempt.attemptNumber}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={attempt.status} />
                  </div>
                </div>
                <article className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold">
                        {attempt.topCode
                          ? `${attempt.topCode} interest profile`
                          : "Assessment evidence"}
                      </h2>
                      <p className="mt-1 font-label text-sm text-muted-foreground">
                        {attempt.reference} · {attempt.instrumentCode}
                      </p>
                    </div>
                    {attempt.recommendationSnapshot ? (
                      <span className="flex items-center gap-2 text-sm font-bold text-success">
                        <CheckCircle2 className="size-4" /> Snapshot preserved
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-6 grid border-y border-border sm:grid-cols-2 xl:grid-cols-4">
                    <EvidenceLine
                      label="Entrance result"
                      value={
                        attempt.entranceExamination
                          ? `${attempt.entranceExamination.score} · ${humanize(attempt.entranceExamination.eligibilityGroup)}`
                          : "Not captured"
                      }
                    />
                    <EvidenceLine
                      label="Admission rule"
                      value={
                        attempt.entranceExamination?.ruleReference ??
                        "Not captured"
                      }
                    />
                    <EvidenceLine
                      label="Instrument progress"
                      value={`${attempt.answerCount} of ${attempt.questionCount} answers`}
                    />
                    <EvidenceLine
                      label="Lifecycle"
                      value={`${formatDate(attempt.startedAt)} → ${formatDate(attempt.resultAvailableAt ?? attempt.processingFailedAt ?? attempt.submittedAt)}`}
                    />
                  </dl>
                  {attempt.dimensions?.length ? (
                    <section className="mt-7">
                      <h3 className="font-display text-xl font-bold">
                        Exact RIASEC raw scores
                      </h3>
                      <dl className="mt-4 grid grid-cols-2 border-y border-border sm:grid-cols-3 xl:grid-cols-6">
                        {attempt.dimensions.map((dimension) => (
                          <div
                            key={dimension.code}
                            className="border-b border-r border-border p-4 sm:border-b-0"
                          >
                            <dt className="font-label text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              {dimension.code} · {dimension.label}
                            </dt>
                            <dd className="mt-2 font-display text-3xl font-black text-primary">
                              {dimension.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ) : null}
                  <dl className="mt-7 grid gap-5 lg:grid-cols-2">
                    <InlineEvidence
                      label="Recommendation snapshot"
                      value={
                        attempt.recommendationSnapshot
                          ? `${attempt.recommendationSnapshot.catalogueReference} · ${attempt.recommendationSnapshot.ruleReference} · ${attempt.recommendationSnapshot.methodologyStatus}`
                          : "Not generated"
                      }
                    />
                    <InlineEvidence
                      label="Failure or retake context"
                      value={
                        attempt.processingErrorCode ??
                        attempt.retakeReason ??
                        "None recorded"
                      }
                    />
                  </dl>
                  {attempt.recommendations?.length ? (
                    <section className="mt-7">
                      <h3 className="font-display text-xl font-bold">
                        Ranked programme snapshot
                      </h3>
                      <ol className="mt-3 divide-y divide-border border-y border-border">
                        {attempt.recommendations.map((programme) => (
                          <li
                            key={programme.id}
                            className="grid gap-2 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-center"
                          >
                            <span className="font-display text-2xl font-black text-primary/35">
                              #{programme.rank}
                            </span>
                            <span>
                              <strong className="block text-base">
                                {programme.name}
                              </strong>
                              <span className="font-label text-xs text-muted-foreground">
                                {programme.code}
                              </span>
                            </span>
                            <strong className="font-display text-xl font-black text-primary">
                              {programme.match}% match
                            </strong>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ) : null}
                </article>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyPanel
            title="No assessment attempts"
            description="This student has not started an assessment."
          />
        )}
      </section>
    </div>
  );
}

// AdminReportsPage is implemented in the dedicated reports module.
// Re-exported at the bottom of this file from '@/features/admin/reports/components/admin-reports-page'.

function AdminActivityPage() {
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), perPage: "25" });
  if (actor) params.set("actor", actor);
  if (action) params.set("action", action);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const resource = useAdminResource<AdminActivityResponse>(
    `/activity?${params}`,
  );
  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data)
    return (
      <AdminPageError
        message={resource.error ?? "No activity data was returned."}
        onRetry={resource.retry}
      />
    );
  const data = resource.data;
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Account history"
        title="Admin activity"
        description="Review when an Administrator made a recorded change."
      />
      <section
        aria-label="Activity filters"
        className="grid gap-3 border-y border-border p-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <FilterSelect
          label="Administrator"
          value={actor}
          onChange={(value) => {
            setActor(value);
            setPage(1);
          }}
          options={[
            ["", "All Administrators"],
            ...data.filters.actors.map(
              (item) => [String(item.id), item.name] as [string, string],
            ),
          ]}
        />
        <FilterSelect
          label="Action"
          value={action}
          onChange={(value) => {
            setAction(value);
            setPage(1);
          }}
          options={[
            ["", "All actions"],
            ...data.filters.actions.map(
              (item) => [item, humanize(item)] as [string, string],
            ),
          ]}
        />
        <Input
          aria-label="Activity from date"
          type="date"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            setPage(1);
          }}
        />
        <Input
          aria-label="Activity to date"
          type="date"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            setPage(1);
          }}
        />
      </section>
      {data.items.length ? (
        <section>
          <div className="flex items-end justify-between gap-3">
            <SectionHeading
              eyebrow="Recorded changes"
              title="Timeline"
              compact
            />
            <span className="font-label text-sm text-muted-foreground">
              {data.pagination.total} records
            </span>
          </div>
          <ol className="relative mt-6 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-border">
            {data.items.map((event) => (
              <li
                key={event.id}
                className="relative grid gap-3 border-b border-border py-5 pl-14 sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <span className="absolute left-0 top-5 z-10 flex size-10 items-center justify-center rounded-full border border-border bg-background">
                  <History className="size-4" />
                </span>
                <div>
                  <strong className="block text-base">
                    {humanize(event.action.replace(".", " "))}
                  </strong>
                  <p className="mt-1 font-label text-sm text-muted-foreground">
                    {event.actor ?? "Administrator"}
                  </p>
                </div>
                <time className="font-label text-xs text-muted-foreground sm:text-right">
                  {formatDate(event.createdAt)}
                </time>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= data.pagination.lastPage}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </section>
      ) : (
        <EmptyPanel
          title="No recorded activity"
          description="Change the filters or wait for a recorded action."
        />
      )}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  compact = false,
  id,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  compact?: boolean;
  id?: string;
}) {
  return (
    <div>
      <p className="font-label text-xs font-bold uppercase tracking-[0.15em] text-primary">
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`mt-1 font-display font-extrabold tracking-tight ${compact ? "text-2xl" : "text-3xl"}`}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  const allValue = "__all__";
  return (
    <Select
      value={value || allValue}
      onValueChange={(next) => onChange(next === allValue ? "" : next)}
    >
      <SelectTrigger
        aria-label={label}
        className="w-full border-0 border-b border-border bg-transparent shadow-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([option, labelText]) => (
          <SelectItem key={option || allValue} value={option || allValue}>
            {labelText}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function InlineEvidence({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-label text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-6">
        {value}
      </dd>
    </div>
  );
}
function EvidenceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-border p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <dt className="font-label text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-semibold leading-5">
        {value}
      </dd>
    </div>
  );
}
function MetricDefinition({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-border p-6 last:border-r-0">
      <dt className="font-label text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 font-display text-4xl font-black">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminAssessment["status"] }) {
  const variants = {
    in_progress: "warning",
    preparing_result: "info",
    result_available: "success",
    result_failed: "destructive",
  } as const;
  const labels = {
    in_progress: "In progress",
    preparing_result: "Processing",
    result_available: "Result available",
    result_failed: "Needs attention",
  };
  const Icon =
    status === "result_failed"
      ? CircleAlert
      : status === "result_available"
        ? CheckCircle2
        : History;
  return (
    <Badge variant={variants[status]}>
      <Icon className="size-3.5" />
      {labels[status]}
    </Badge>
  );
}

export { AdminReportsPage } from "@/features/admin/reports/components/admin-reports-page";

export { AdminActivityPage, AdminStudentDetailPage, AdminStudentsPage };
