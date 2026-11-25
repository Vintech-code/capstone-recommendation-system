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

export { ConfigurationDiffPreview };
