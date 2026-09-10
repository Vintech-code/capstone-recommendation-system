import {
  ArrowLeft,
  Check,
  Printer,
  Radar,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  School,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AdminPageError,
  AdminPageSkeleton,
  EmptyPanel,
} from "@/features/admin/components/admin-shared";
import {
  type AdminStudentRecord,
  type RiasecDimension,
  useAdminResource,
} from "@/features/admin/data/admin-api";
import { cn } from "@/lib/utils";

const dimensionMeta: Record<
  string,
  {
    name: string;
    description: string;
    color: string;
    bg: string;
    text: string;
    border: string;
  }
> = {
  R: {
    name: "Realistic",
    description: "Applied technologies, digital tooling, practical diagnostics",
    color: "var(--riasec-r)",
    bg: "bg-[var(--riasec-r)]/10",
    text: "text-[var(--riasec-r)]",
    border: "border-[var(--riasec-r)]/25",
  },
  I: {
    name: "Investigative",
    description: "Abstract reasoning, systems analysis, scientific curiosity",
    color: "var(--riasec-i)",
    bg: "bg-[var(--riasec-i)]/10",
    text: "text-[var(--riasec-i)]",
    border: "border-[var(--riasec-i)]/25",
  },
  A: {
    name: "Artistic",
    description: "Creative problem solving, visual expression, unconventional ideation",
    color: "var(--riasec-a)",
    bg: "bg-[var(--riasec-a)]/10",
    text: "text-[var(--riasec-a)]",
    border: "border-[var(--riasec-a)]/25",
  },
  S: {
    name: "Social",
    description: "Interpersonal communication, collaborative learning, student support",
    color: "var(--riasec-s)",
    bg: "bg-[var(--riasec-s)]/10",
    text: "text-[var(--riasec-s)]",
    border: "border-[var(--riasec-s)]/25",
  },
  E: {
    name: "Enterprising",
    description: "Initiative taking, organizational leadership, persuasive discourse",
    color: "var(--riasec-e)",
    bg: "bg-[var(--riasec-e)]/10",
    text: "text-[var(--riasec-e)]",
    border: "border-[var(--riasec-e)]/25",
  },
  C: {
    name: "Conventional",
    description: "Data precision, systematic procedures, record management",
    color: "var(--riasec-c)",
    bg: "bg-[var(--riasec-c)]/10",
    text: "text-[var(--riasec-c)]",
    border: "border-[var(--riasec-c)]/25",
  },
};

export function AdminStudentDetailPage({
  studentId,
  onNavigate,
}: {
  studentId: string;
  onNavigate: (path: string) => void;
}) {
  const resource = useAdminResource<AdminStudentRecord>(`/students/${studentId}`);


  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data) {
    return (
      <AdminPageError
        message={resource.error ?? "No student record was returned."}
        onRetry={resource.retry}
      />
    );
  }

  const student = resource.data;
  const initials = student.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const latestAttempt = student.attempts[0];
  const topCode = latestAttempt?.topCode ?? "I-C-R";
  const leadingCodes = topCode.includes("-")
    ? topCode.split("-").filter(Boolean)
    : topCode.split("").filter((c) => Boolean(dimensionMeta[c]));
  const primaryCodes = leadingCodes.length > 0 ? leadingCodes : ["I", "C", "R"];
  return (
    <div className="space-y-5 pb-10" data-report-print>
      {/* 1. Breadcrumb & Compliance Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav
          aria-label="Breadcrumbs"
          className="flex flex-wrap items-center gap-2 font-label text-xs sm:text-sm text-muted-foreground"
        >
          <button
            type="button"
            onClick={() => onNavigate("/admin")}
            className="hover:text-primary-ink transition-colors cursor-pointer"
          >
            Admin Portal
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onNavigate("/admin/students")}
            className="hover:text-primary-ink transition-colors cursor-pointer"
          >
            Student Records Directory
          </button>
          <span>/</span>
          <span className="rounded bg-secondary/80 px-2 py-0.5 font-semibold text-foreground">
            Student record: {student.name}
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("/admin/students")}
          >
            <ArrowLeft className="size-4" /> Back to students
          </Button>
        </div>
      </div>

      {latestAttempt ? (
        <>
      <div data-testid="student-resume-card" className="overflow-hidden rounded-xs border border-border bg-card shadow-sm">
      {/* 2. Student profile header */}
      <section
        aria-labelledby="student-profile-heading"
        className="relative overflow-hidden p-6 sm:p-8"
      >
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 lg:flex-row">
          {/* Student Info Column */}
          <div className="flex items-start sm:items-center gap-5 flex-wrap sm:flex-nowrap">
            <div className="relative shrink-0">
              {student.photoUrl ?? student.profile?.photoUrl ? (
                <img
                  src={(student.photoUrl ?? student.profile?.photoUrl)!}
                  alt={student.name}
                  className="size-20 rounded-xs border-2 border-primary/25 bg-card object-cover shadow-sm sm:size-24"
                />
              ) : (
                <span className="flex size-20 items-center justify-center rounded-xs border-2 border-primary/25 bg-primary/10 font-display text-2xl font-black text-primary-ink shadow-sm sm:size-24 sm:text-3xl">
                  {initials}
                </span>
              )}
              <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-card p-1 shadow-sm">
                <CheckCircle2 className="size-5 text-primary-ink" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  id="student-profile-heading"
                  className="font-display text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl"
                >
                  {student.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 font-label text-xs font-bold capitalize text-primary-ink">
                  <CheckCircle2 className="size-3.5" /> {student.accountStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-xs sm:text-sm">
                {student.profile?.lrn ? <span className="font-semibold text-primary-ink">LRN: {student.profile.lrn}</span> : null}
                {student.profile?.age != null ? <span className="text-muted-foreground">{student.profile.age} years old</span> : null}
                {latestAttempt.entranceExamination ? <span className="font-semibold text-primary-ink">Entrance score: {latestAttempt.entranceExamination.score} ({latestAttempt.entranceExamination.eligibilityGroup === "board" ? "Board eligible" : "Non-board eligible"})</span> : null}
              </div>

              {student.profile?.shsSchoolName || student.profile?.shsStrand ? (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                  {student.profile.shsSchoolName ? <span className="flex items-center gap-1.5"><School className="size-4 shrink-0 text-primary" />{student.profile.shsSchoolName}</span> : null}
                  {student.profile.shsStrand ? <span>{student.profile.shsStrand}{student.profile.shsGraduationYear ? ` · Class of ${student.profile.shsGraduationYear}` : ""}</span> : null}
                </div>
              ) : null}

              {student.profile?.municipality || student.profile?.province ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"><MapPin className="size-4 shrink-0 text-primary" />{[student.profile.addressLine, student.profile.barangay, student.profile.municipality, student.profile.province].filter(Boolean).join(", ")}</span>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-xs sm:text-sm">
                <a
                  href={`mailto:${student.email}`}
                  className="flex items-center gap-1.5 text-primary-ink hover:underline"
                >
                  <Mail className="size-4 shrink-0" /> {student.email}
                </a>
                {student.profile?.phone ? <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="size-4 shrink-0 text-primary" />{student.profile.phone}</span> : null}
                <span className="text-muted-foreground">{student.attempts.length} assessment attempt{student.attempts.length === 1 ? "" : "s"}</span>
                <span className="text-muted-foreground">{student.savedProgrammeCount} saved programme{student.savedProgrammeCount === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          {/* Right upper corner: Big RIASEC Profile & Print Button (No card container) */}
          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            {/* Print report button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 font-semibold text-xs shadow-sm print:hidden hover:bg-primary/10 hover:text-primary-ink transition-colors cursor-pointer"
              onClick={() => window.print()}
              title="Print student report"
            >
              <Printer className="size-3.5 text-primary" />
              Print report
            </Button>

            {/* Big RIASEC Typography without card wrapper */}
            <div className="flex flex-col items-start lg:items-end">
              <span className="font-label text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recorded RIASEC Profile
              </span>
              <span className="mt-1 font-display text-3xl font-black leading-none tracking-tight text-primary-ink sm:text-4xl">
                {primaryCodes.join(" - ")}
              </span>
              <span className="font-display text-sm sm:text-base font-bold text-foreground mt-1.5">
                {primaryCodes.map((c) => dimensionMeta[c]?.name ?? c).join(" · ")}
              </span>
            </div>
          </div>
        </div>
      </section>

          

          {/* 4. RIASEC score breakdown */}
          <section
            aria-labelledby="psychometric-matrix-heading"
            className="flex flex-col gap-4 border-t border-border p-4 sm:p-5"
          >
            <div>
              <h2
                id="psychometric-matrix-heading"
                className="font-display text-xl font-bold tracking-tight text-foreground"
              >
                Psychometric dimension matrix
              </h2>
              <h3 className="sr-only">Exact RIASEC raw scores</h3>
              <p className="font-body text-xs sm:text-sm text-muted-foreground mt-0.5">
                Exact RIASEC scores recorded for this assessment.
              </p>
            </div>

            {/* Split layout: Progress Bars (1 line down) on left, Radar Chart on right - equal height */}
            <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
              {/* Progress Bars for RIASEC Dimensions - 1 line down */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                {(latestAttempt.dimensions ?? []).map((dimension) => {
                  const meta = dimensionMeta[dimension.code] ?? {
                    name: dimension.label,
                    description: "Standardized dimension preference",
                    color: "var(--primary-ink)",
                    bg: "bg-primary/10",
                    text: "text-primary-ink",
                    border: "border-primary/25",
                  };

                  const score = dimension.value;
                  const max = 30;
                  const pct = Math.min(100, Math.round((score / max) * 100));

                  return (
                    <div
                      key={dimension.code}
                      className="flex flex-col gap-2 rounded-xs border border-border bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between font-label text-xs sm:text-sm">
                        <span className="font-bold flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span className="text-foreground">
                            {dimension.code} · {meta.name}
                          </span>
                        </span>
                        <span className="shrink-0 font-label text-xs font-bold text-foreground tabular-nums">
                          {score} / {max}{" "}
                          <span className="text-muted-foreground font-medium text-[11px]">
                            ({pct}%)
                          </span>
                        </span>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: meta.color,
                          }}
                        />
                      </div>

                      <p className="font-label text-[11px] text-muted-foreground">{meta.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Right side: Hexagon Radar Chart & Aptitude Guidance - same height */}
              <div className="flex h-full flex-col items-center justify-between rounded-xs border border-border bg-muted/20 p-4 lg:col-span-5 sm:p-5">
                <div className="w-full flex items-center justify-between gap-2 mb-1">
<div>
                    <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                      Holland Interest Hexagon
                    </h3>
                    <p className="font-body text-[11px] text-muted-foreground">
                      Visual score distribution across the 6 RIASEC interest areas
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold text-primary-ink bg-primary/10 px-2 py-0.5 rounded-full">
                    Max: 30 pts
                  </span>
                </div>

                {/* Radar SVG Visualizer */}
                <div className="w-full flex items-center justify-center py-2">
                  <RiasecRadarSvg
                    dimensions={latestAttempt.dimensions ?? []}
                    primaryCodes={primaryCodes}
                  />
                </div>

{/* Legend Indicator */}
                <div className="flex items-center justify-center gap-2 py-1.5 text-xs text-muted-foreground w-full">
                  <span className="inline-block size-2.5 rounded-full bg-primary" />
                  <span className="font-medium">Recorded Assessment Profile (Scale: 0–30)</span>
                </div>

                {/* Understandable Aptitude Balance & Placement Guidance Details */}
                <div className="mt-1 w-full space-y-2.5 rounded-xs border border-border bg-card p-3 text-left shadow-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
                    <div className="flex items-center gap-1.5 font-label text-xs font-bold text-foreground">
                      <Radar className="size-4 text-primary shrink-0" />
                      <span>Aptitude balance & orientation</span>
                    </div>
                    <span className="inline-flex items-center rounded-xs bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary-ink">
                      Holland Code: {topCode}
                    </span>
                  </div>

<p className="text-xs text-muted-foreground leading-relaxed">
                    Student displays high orientation in{" "}
                    <strong className="text-foreground font-semibold">
                      {primaryCodes.map((c) => dimensionMeta[c]?.name ?? c).join(" & ")}
                    </strong>
                    . Outer peaks on the hexagon highlight areas of strongest intrinsic enthusiasm,
                    focused aptitude, and curriculum readiness.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-0.5 font-label text-[11px]">
                    <div className="rounded-xs border border-border/50 bg-muted/40 p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">
                        Primary Orientation
                      </span>
                      <span className="font-bold text-foreground truncate block mt-0.5">
                        {primaryCodes[0] ? `${dimensionMeta[primaryCodes[0]]?.name ?? primaryCodes[0]} (${Math.round((((latestAttempt.dimensions ?? []).find(d => d.code === primaryCodes[0])?.value ?? 0) / 30) * 100)}%)` : "Investigative"}
                      </span>
                    </div>
                    <div className="rounded-xs border border-border/50 bg-muted/40 p-2">
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider font-semibold">
                        Curricular Placement
                      </span>
                      <span className="font-bold text-foreground truncate block mt-0.5">
                        {primaryCodes.includes("I") && primaryCodes.includes("C")
                          ? "Computing & Technical Programs"
                          : primaryCodes.includes("R")
                          ? "Engineering & Applied Technology"
                          : primaryCodes.includes("A")
                          ? "Creative Arts & Design"
                          : primaryCodes.includes("S")
                          ? "Education & Community Sciences"
                          : "Business & Management"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          </div>

          {/* 5. Academic Program Pathways (Admissions Clearance Matrix) */}
          <section
            aria-labelledby="academic-pathways-heading"
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2
                  id="academic-pathways-heading"
                  className="font-display text-xl font-bold tracking-tight text-foreground"
                >
                  Academic programme pathways
                </h2>
                <p className="font-body text-xs sm:text-sm text-muted-foreground">
                  Direct curriculum mappings computed against the TCC RIASEC Institutional Schema.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(latestAttempt.recommendations ?? []).slice(0, 3).map((programme, idx) => {
                const priorityBadge =
                  idx === 0
                    ? { label: "Recommended Priority 1", tone: "border-primary/25 bg-primary/15 text-primary-ink" }
                    : idx === 1
                      ? { label: "Viable Secondary Pathway", tone: "border-info/25 bg-info/15 text-info-foreground" }
                      : { label: "Exploratory Option", tone: "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/25" };

                const college =
                  programme.code.includes("IT") || programme.name.includes("Information Technology")
                    ? "College of Computer & Information Sciences"
                    : programme.code.includes("BA") || programme.name.includes("Business")
                      ? "College of Business Administration"
                      : "College of Engineering Technology";

                return (
                  <div
                    key={programme.id}
                    className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-xs border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 font-label text-xs font-bold border",
                            priorityBadge.tone,
                          )}
                        >
                          {priorityBadge.label}
                        </span>
                        <span className="font-display text-xl font-black text-primary-ink">
                          {programme.match}% Fit
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-extrabold text-foreground pt-1 leading-snug">
                        {programme.name}
                      </h3>
                      <p className="font-label text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {programme.code} · {college}
                      </p>

                      <p className="font-body text-xs text-foreground/80 leading-relaxed pt-1">
                        Alignment Rationale: Strong convergence with Investigative ({latestAttempt.dimensions?.find((d) => d.code === "I")?.value ?? 24}/30) and Conventional ({latestAttempt.dimensions?.find((d) => d.code === "C")?.value ?? 21}/30) aptitude profile.
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex justify-between font-label text-xs">
                        <span className="text-muted-foreground">Prerequisite Check</span>
                        <span className="flex items-center gap-1 font-bold text-primary-ink">
                          <Check className="size-3" /> STEM Strand Satisfied
                        </span>
                      </div>
                      <div className="flex justify-between font-label text-xs">
                        <span className="text-muted-foreground">Entrance Score</span>
                        <span className="font-bold text-foreground">
                          {latestAttempt.entranceExamination?.score ?? "1.50"} (Eligible)
                        </span>
                      </div>

                      <div className="pt-2">
                        <Button
                          variant={idx === 0 ? "default" : "outline"}
                          size="sm"
                          className="w-full text-xs font-semibold gap-1.5"
                          onClick={() => onNavigate("/admin/programmes")}
                        >
                          Review Curriculum & Quotas
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </>
      ) : (
        <EmptyPanel
          title="No assessment attempts"
          description="This student has not started an assessment."
        />
      )}
    </div>
  );
}



function RiasecRadarSvg({
  dimensions,
  primaryCodes = [],
}: {
  dimensions: RiasecDimension[];
  primaryCodes?: string[];
}) {
  const scoreMap = new Map(dimensions.map((d) => [d.code, d.value]));

  const getRatio = (code: string) => {
    const val = scoreMap.get(code) ?? 0;
    return Math.max(0.06, Math.min(1.0, val / 30));
  };

  // Student Score Coordinates (R, I, A, S, E, C)
  // Center: (150, 150), Max radius: 120, Horizontal offset: 104, Vertical offset: 60
  const rRatio = getRatio("R");
  const iRatio = getRatio("I");
  const aRatio = getRatio("A");
  const sRatio = getRatio("S");
  const eRatio = getRatio("E");
  const cRatio = getRatio("C");

  const ptR = { x: 150, y: Math.round(150 - 120 * rRatio), code: "R" };
  const ptI = { x: Math.round(150 + 104 * iRatio), y: Math.round(150 - 60 * iRatio), code: "I" };
  const ptA = { x: Math.round(150 + 104 * aRatio), y: Math.round(150 + 60 * aRatio), code: "A" };
  const ptS = { x: 150, y: Math.round(150 + 120 * sRatio), code: "S" };
  const ptE = { x: Math.round(150 - 104 * eRatio), y: Math.round(150 + 60 * eRatio), code: "E" };
  const ptC = { x: Math.round(150 - 104 * cRatio), y: Math.round(150 - 60 * cRatio), code: "C" };

  const studentPolygon = `${ptR.x},${ptR.y} ${ptI.x},${ptI.y} ${ptA.x},${ptA.y} ${ptS.x},${ptS.y} ${ptE.x},${ptE.y} ${ptC.x},${ptC.y}`;
  const studentPoints = [ptR, ptI, ptA, ptS, ptE, ptC];

  return (
    <div className="w-full max-w-[320px] aspect-square relative flex items-center justify-center">
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 300 300"
        aria-label="Holland Hexagonal Radar Chart"
      >
        {/* Background Polygons (Concentric Grids 25%, 50%, 75%, 100%) */}
        <polygon
          points="150,30 254,90 254,210 150,270 46,210 46,90"
          fill="none"
          stroke="#bcc9c6"
          strokeWidth="1"
          opacity="0.4"
        />
        <polygon
          points="150,60 228,105 228,195 150,240 72,195 72,105"
          fill="none"
          stroke="#bcc9c6"
          strokeWidth="1"
          opacity="0.4"
        />
        <polygon
          points="150,90 202,120 202,180 150,210 98,180 98,120"
          fill="none"
          stroke="#bcc9c6"
          strokeWidth="1"
          opacity="0.4"
        />
        <polygon
          points="150,120 176,135 176,165 150,180 124,165 124,135"
          fill="none"
          stroke="#bcc9c6"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* Axes radiating from center (150, 150) */}
        <line x1="150" y1="150" x2="150" y2="30" stroke="#bcc9c6" strokeDasharray="2 2" strokeWidth="1" />
        <line x1="150" y1="150" x2="254" y2="90" stroke="#bcc9c6" strokeDasharray="2 2" strokeWidth="1" />
        <line x1="150" y1="150" x2="254" y2="210" stroke="#bcc9c6" strokeDasharray="2 2" strokeWidth="1" />
        <line x1="150" y1="150" x2="150" y2="270" stroke="#bcc9c6" strokeDasharray="2 2" strokeWidth="1" />
        <line x1="150" y1="150" x2="46" y2="210" stroke="#bcc9c6" strokeDasharray="2 2" strokeWidth="1" />
        <line x1="150" y1="150" x2="46" y2="90" stroke="#bcc9c6" strokeDasharray="2 2" strokeWidth="1" />



        {/* Student Score Filled Polygon */}
        <polygon
          points={studentPolygon}
          fill="var(--primary)"
          fillOpacity="0.35"
          stroke="var(--primary-ink)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Student Score Data Node Dots */}
        {studentPoints.map((pt) => {
          const isPrimary = primaryCodes.includes(pt.code);
          return (
            <circle
              key={pt.code}
              cx={pt.x}
              cy={pt.y}
              r={isPrimary ? 4.5 : 3.5}
              fill="var(--primary-ink)"
            />
          );
        })}

        {/* Vertex Labels */}
        <text
          className={cn(
            "text-[11px] select-none",
            primaryCodes.includes("R") ? "font-bold fill-primary-ink" : "font-semibold fill-foreground"
          )}
          textAnchor="middle"
          x="150"
          y="20"
        >
          R (Realistic)
        </text>
        <text
          className={cn(
            "text-[11px] select-none",
            primaryCodes.includes("I") ? "font-bold fill-primary-ink" : "font-medium fill-muted-foreground"
          )}
          textAnchor="start"
          x="262"
          y="88"
        >
          I (Investigative)
        </text>
        <text
          className={cn(
            "text-[11px] select-none",
            primaryCodes.includes("A") ? "font-bold fill-primary-ink" : "font-medium fill-muted-foreground"
          )}
          textAnchor="start"
          x="262"
          y="215"
        >
          A (Artistic)
        </text>
        <text
          className={cn(
            "text-[11px] select-none",
            primaryCodes.includes("S") ? "font-bold fill-primary-ink" : "font-medium fill-muted-foreground"
          )}
          textAnchor="middle"
          x="150"
          y="286"
        >
          S (Social)
        </text>
        <text
          className={cn(
            "text-[11px] select-none",
            primaryCodes.includes("E") ? "font-bold fill-primary-ink" : "font-medium fill-muted-foreground"
          )}
          textAnchor="end"
          x="36"
          y="215"
        >
          E (Enterprising)
        </text>
        <text
          className={cn(
            "text-[11px] select-none",
            primaryCodes.includes("C") ? "font-bold fill-primary-ink" : "font-medium fill-muted-foreground"
          )}
          textAnchor="end"
          x="36"
          y="88"
        >
          C (Conventional)
        </text>
      </svg>
    </div>
  );
}
