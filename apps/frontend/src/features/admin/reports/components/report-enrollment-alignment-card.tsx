import type { AdminEnrollmentAlignment } from "@/features/admin/data/admin-types";

interface ReportEnrollmentAlignmentCardProps {
  alignment?: AdminEnrollmentAlignment;
}

export function ReportEnrollmentAlignmentCard({ alignment }: ReportEnrollmentAlignmentCardProps) {
  if (!alignment) return null;

  const { programs, overall } = alignment;
  const verifiedEnrolled = overall.verifiedEnrolled ?? overall.aligned + overall.notAligned;

  return (
    <section aria-labelledby="enrollment-alignment-heading" className="border-y border-border py-6">
      <div className="max-w-4xl">
        <p className="font-label text-xs font-bold uppercase tracking-wider text-primary-ink">
          Enrollment after recommendations
        </p>
        <h2
          id="enrollment-alignment-heading"
          className="mt-1 font-display text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
        >
          Program Enrollment Alignment
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Compares each Student&apos;s latest Rank #1 recommendation in the selected period with a verified COR
          enrollment. A match shows alignment; it does not prove that the recommendation caused the enrollment
          decision.
        </p>
      </div>

      <dl className="mt-5 grid gap-px overflow-hidden rounded-xs border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <AlignmentMetric label="Enrolled in #1 recommendation" value={overall.aligned} emphasis />
        <AlignmentMetric label="Verified enrollment records" value={verifiedEnrolled} />
        <AlignmentMetric label="Enrolled in another programme" value={overall.notAligned} />
        <AlignmentMetric label="No verified enrollment yet" value={overall.unallocated} />
      </dl>

      <div
        role="region"
        aria-label="Programme enrollment alignment table"
        tabIndex={0}
        className="mt-6 overflow-x-auto border-y border-border focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Rank #1 programme recommendations compared with verified Student enrollments
          </caption>
          <thead>
            <tr className="border-b border-border bg-secondary/35 font-label text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-4 py-3">Rank #1 recommended programme</th>
              <th scope="col" className="px-4 py-3 text-right">Students recommended</th>
              <th scope="col" className="px-4 py-3 text-right">Verified enrollments</th>
              <th scope="col" className="px-4 py-3 text-right">Enrolled in #1 programme</th>
              <th scope="col" className="px-4 py-3 text-right">Enrolled elsewhere</th>
              <th scope="col" className="px-4 py-3">Actual programme chosen instead</th>
              <th scope="col" className="px-4 py-3 text-right">No verified enrollment</th>
              <th scope="col" className="px-4 py-3 text-right">Alignment rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {programs.map((program) => {
              const programVerifiedEnrolled = program.verifiedEnrolled ?? program.aligned + program.notAligned;
              const alternateEnrollments = program.alternateEnrollments ?? [];

              return (
                <tr key={program.programmeId} className="transition-colors hover:bg-secondary/20">
                  <th scope="row" className="px-4 py-3">
                    <span className="block font-display font-bold text-foreground">{program.programmeCode}</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{program.programmeName}</span>
                  </th>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{program.recommended.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{programVerifiedEnrolled.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-primary-ink">{program.aligned.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-warning-ink">{program.notAligned.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {alternateEnrollments.length > 0 ? (
                      <ul className="space-y-1.5">
                        {alternateEnrollments.map((destination) => (
                          <li key={destination.programmeId} className="text-xs leading-5 text-foreground">
                            <span className="font-bold">{destination.programmeCode}</span>
                            <span className="text-muted-foreground"> · {destination.programmeName}</span>
                            <span className="ml-1 font-bold tabular-nums">({destination.count.toLocaleString()})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-muted-foreground">None recorded</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-muted-foreground">{program.unallocated.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-display font-bold tabular-nums text-foreground">{program.alignmentRate.toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-secondary/45 font-display font-extrabold text-foreground">
              <th scope="row" className="px-4 py-3.5 text-left">Overall</th>
              <td className="px-4 py-3.5 text-right tabular-nums">{overall.recommended.toLocaleString()}</td>
              <td className="px-4 py-3.5 text-right tabular-nums">{verifiedEnrolled.toLocaleString()}</td>
              <td className="px-4 py-3.5 text-right tabular-nums text-primary-ink">{overall.aligned.toLocaleString()}</td>
              <td className="px-4 py-3.5 text-right tabular-nums text-warning-ink">{overall.notAligned.toLocaleString()}</td>
              <td className="px-4 py-3.5 text-xs font-medium text-muted-foreground">See programme rows above</td>
              <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">{overall.unallocated.toLocaleString()}</td>
              <td className="px-4 py-3.5 text-right tabular-nums">{overall.alignmentRate.toFixed(2)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function AlignmentMetric({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className="bg-background px-5 py-4">
      <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-display text-2xl font-black tabular-nums ${emphasis ? "text-primary-ink" : "text-foreground"}`}>
        {value.toLocaleString()}
      </dd>
    </div>
  );
}
