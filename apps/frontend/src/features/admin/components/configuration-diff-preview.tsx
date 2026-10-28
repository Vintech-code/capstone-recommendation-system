import { Badge } from "@/components/ui/badge";
import { type ConfigurationPreview } from "@/features/admin/data/admin-api";
import { humanize } from "@/features/admin/data/admin-formatters";

function ConfigurationDiffPreview({
  preview,
  programmeId,
}: {
  preview: ConfigurationPreview;
  programmeId?: string;
}) {
  const changes = programmeId
    ? preview.programmeChanges.filter(
        (item) => item.programmeId === programmeId,
      )
    : preview.programmeChanges;
  return (
    <section className="mt-5 bg-background p-4 shadow-sm" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">
            Before and after
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold">
            Publication preview
          </h3>
        </div>
        <Badge variant={preview.hasChanges ? "warning" : "secondary"}>
          {preview.hasChanges
            ? `${preview.changedProgrammeCount} programme${preview.changedProgrammeCount === 1 ? "" : "s"} changed`
            : "No changes"}
        </Badge>
      </div>
      {changes.length ? (
        <div className="mt-4 space-y-4">
          {changes.map((change) => (
            <article key={change.programmeId}>
              <h4 className="font-semibold">
                {change.name ?? change.code ?? change.programmeId}
              </h4>
              <div className="mt-2 divide-y">
                {change.fields.map((field) => (
                  <div
                    key={field.field}
                    className="grid gap-2 py-3 text-sm sm:grid-cols-[10rem_1fr_1fr]"
                  >
                    <strong>{humanize(field.field)}</strong>
                    <DiffValue label="Before" value={field.before} />
                    <DiffValue label="After" value={field.after} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          The current draft matches the active student catalogue.
        </p>
      )}
    </section>
  );
}

function DiffValue({ label, value }: { label: string; value: unknown }) {
  const displayed = Array.isArray(value)
    ? value.join(", ")
    : typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "Not set");
  return (
    <p className="min-w-0 break-words">
      <span className="block text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      {displayed}
    </p>
  );
}

const EDITABLE_PROGRAMME_FIELDS = [
  "recommended_strands",
  "strand_guidance",
  "cover_image_url",
  "logo_image_url",
] as const;

function programmeChangeScope(
  baseline: Record<string, unknown>,
  payload: Record<string, unknown>,
  selectedId?: string,
) {
  const baselineProgrammes =
    (baseline.programmes as Array<Record<string, unknown>> | undefined) ?? [];
  const currentProgrammes =
    (payload.programmes as Array<Record<string, unknown>> | undefined) ?? [];
  const baselineById = new Map(
    baselineProgrammes.map((programme) => [String(programme.id), programme]),
  );
  const fieldCounts = new Map<string, number>();

  currentProgrammes.forEach((programme) => {
    const id = String(programme.id);
    const original = baselineById.get(id) ?? {};
    const count = EDITABLE_PROGRAMME_FIELDS.filter(
      (field) =>
        JSON.stringify(original[field]) !== JSON.stringify(programme[field]),
    ).length;
    if (count > 0) fieldCounts.set(id, count);
  });

  return {
    changedProgrammeCount: fieldCounts.size,
    selectedFieldCount: selectedId ? (fieldCounts.get(selectedId) ?? 0) : 0,
  };
}



export { ConfigurationDiffPreview, programmeChangeScope, EDITABLE_PROGRAMME_FIELDS };
