import type { AdminEnrollmentAlignment } from "@/features/admin/data/admin-types";

interface ReportEnrollmentAlignmentCardProps {
  alignment?: AdminEnrollmentAlignment;
}

export function ReportEnrollmentAlignmentCard({
  alignment,
}: ReportEnrollmentAlignmentCardProps) {
  if (!alignment) return null;

  const { programs, overall } = alignment;

  return (
    <section
      aria-labelledby="enrollment-alignment-heading"
      className="rounded-xl border border-border/80 bg-card p-6 shadow-xs sm:p-7"
    >
      <div className="border-b border-border/60 pb-5">
        <h3 className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
          Enrollment &amp; recommendation alignment
        </h3>
        <h2
          id="enrollment-alignment-heading"
          className="mt-1 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
        >
          Program Enrollment Alignment
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Comparison of Rank #1 recommended academic programmes against student-declared COR enrollments.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/35 font-label text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Academic Program</th>
              <th className="px-4 py-3 text-right">Recommended</th>
              <th className="px-4 py-3 text-right">Aligned Enrollment</th>
              <th className="px-4 py-3 text-right">Not Aligned</th>
              <th className="px-4 py-3 text-right">Unallocated</th>
              <th className="px-4 py-3 text-right">Alignment Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {programs.map((program) => (
              <tr
                key={program.programmeId}
                className="transition-colors hover:bg-secondary/20"
              >
                <td className="px-4 py-3">
                  <span className="font-display font-bold text-foreground">
                    {program.programmeCode}
                  </span>
                  <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
                    {program.programmeName}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                  {program.recommended.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-primary-ink">
                  {program.aligned.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-warning-ink">
                  {program.notAligned.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-muted-foreground">
                  {program.unallocated.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-display font-bold tabular-nums text-foreground">
                  {program.alignmentRate.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-secondary/45 font-display font-extrabold text-foreground">
              <td className="px-4 py-3.5">Overall</td>
              <td className="px-4 py-3.5 text-right tabular-nums">
                {overall.recommended.toLocaleString()}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums text-primary-ink">
                {overall.aligned.toLocaleString()}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums text-warning-ink">
                {overall.notAligned.toLocaleString()}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                {overall.unallocated.toLocaleString()}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums">
                {overall.alignmentRate.toFixed(2)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
