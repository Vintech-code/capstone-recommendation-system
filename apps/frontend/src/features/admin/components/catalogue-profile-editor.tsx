import { ExternalLink, ImageUp, LockKeyhole, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadProgrammeMedia } from "@/features/admin/data/admin-api";
import { humanize } from "@/features/admin/data/admin-formatters";

export function CatalogueProfileEditor({
  payload,
  programmeId,
  onChange,
}: {
  payload: Record<string, unknown>;
  programmeId?: string;
  onChange: (payload: Record<string, unknown>) => void;
}) {
  const programmes =
    (payload.programmes as Array<Record<string, unknown>> | undefined) ?? [];
  const [openId, setOpenId] = useState<string | null>(
    programmeId ?? String(programmes[0]?.id ?? ""),
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaMessage, setMediaMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [failedUpload, setFailedUpload] = useState<{
    index: number;
    programmeId: string;
    kind: "cover" | "logo";
    file: File;
  } | null>(null);
  function updateProgramme(index: number, changes: Record<string, unknown>) {
    onChange({
      ...payload,
      programmes: programmes.map((programme, itemIndex) =>
        itemIndex === index ? { ...programme, ...changes } : programme,
      ),
    });
  }
  function stringList(value: unknown) {
    return Array.isArray(value) ? value.join("\n") : "";
  }
  function list(value: string) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  async function upload(
    index: number,
    programmeId: string,
    kind: "cover" | "logo",
    file?: File,
  ) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setMediaError("Choose a JPEG, PNG, or WebP image no larger than 5 MB.");
      return;
    }
    setUploading(`${programmeId}-${kind}`);
    setMediaError(null);
    setMediaMessage(null);
    try {
      setUploadProgress(0);
      setFailedUpload(null);
      const media = await uploadProgrammeMedia(
        programmeId,
        kind,
        file,
        setUploadProgress,
      );
      updateProgramme(index, {
        [kind === "cover" ? "cover_image_url" : "logo_image_url"]: media.url,
      });
      setMediaMessage(
        `${kind === "cover" ? "Cover photo" : "Programme logo"} uploaded and ready. Publish the changes to show it on student pages.`,
      );
    } catch (reason) {
      setFailedUpload({ index, programmeId, kind, file });
      setMediaError(
        reason instanceof Error
          ? reason.message
          : "The image could not be uploaded.",
      );
    } finally {
      setUploading(null);
      setUploadProgress(null);
    }
  }
  const visibleProgrammes = programmeId
    ? programmes
        .map((programme, index) => ({ programme, index }))
        .filter(({ programme }) => String(programme.id) === programmeId)
    : programmes.map((programme, index) => ({ programme, index }));
  return (
    <div className="mt-5 space-y-3">
      {mediaError ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 bg-destructive/8 p-3 text-sm font-semibold text-destructive-ink"
        >
          <span>{mediaError}</span>
          {failedUpload ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded bg-background"
              onClick={() =>
                void upload(
                  failedUpload.index,
                  failedUpload.programmeId,
                  failedUpload.kind,
                  failedUpload.file,
                )
              }
            >
              <RefreshCw aria-hidden="true" /> Retry upload
            </Button>
          ) : null}
        </div>
      ) : null}
      {uploadProgress !== null ? (
        <div
          role="status"
          aria-label={`Uploading image ${uploadProgress}%`}
          className="bg-background p-3"
        >
          <div className="flex justify-between text-xs font-semibold">
            <span>Uploading image</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : null}
      {mediaMessage ? (
        <p
          role="status"
          className="bg-success/10 p-3 text-sm font-semibold text-success-ink"
        >
          {mediaMessage}
        </p>
      ) : null}
      {visibleProgrammes.map(({ programme, index }) => {
        const id = String(programme.id);
        const open = openId === id;
        return (
          <section key={id} className="border-t border-border pt-4">
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-between gap-4 text-left"
              onClick={() => setOpenId(open ? null : id)}
              aria-expanded={open}
            >
              <span>
                <strong className="block font-display text-lg">
                  {String(programme.short_label)}
                </strong>
                <span className="text-sm text-muted-foreground">
                  {String(programme.display_name)}
                </span>
              </span>
              <Badge variant={open ? "secondary" : "outline"}>
                {open ? "Open" : "Manage"}
              </Badge>
            </button>
            {open ? (
              <div className="mt-5 space-y-7">
                <ProtectedProgrammeFacts programme={programme} />
                <section aria-labelledby={`${id}-guidance-heading`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">
                    Editable student guidance
                  </p>
                  <h4
                    id={`${id}-guidance-heading`}
                    className="mt-1 font-display text-lg font-semibold"
                  >
                    Proposed SHS preparation
                  </h4>
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    These suggestions are separate from CHED programme standards
                    and must not be presented as admission requirements.
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <ListField
                      label="Recommended SHS strands, one per line"
                      id={`${id}-strands`}
                      value={stringList(programme.recommended_strands)}
                      onChange={(value) =>
                        updateProgramme(index, {
                          recommended_strands: list(value),
                        })
                      }
                    />
                    <div>
                      <Label htmlFor={`${id}-strand-guidance`}>
                        Preparation guidance
                      </Label>
                      <Textarea
                        id={`${id}-strand-guidance`}
                        value={String(programme.strand_guidance ?? "")}
                        onChange={(event) =>
                          updateProgramme(index, {
                            strand_guidance: event.target.value,
                          })
                        }
                        className="mt-2 min-h-28"
                      />
                    </div>
                  </div>
                </section>
                <div>
                  <h4 className="text-sm font-semibold">
                    Images shown to students
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose a JPEG, PNG, or WebP up to 5 MB. Confirm the preview,
                    review all pending changes, then publish the full catalogue
                    draft.
                  </p>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <MediaField
                      label="Programme cover photo"
                      id={`${id}-cover`}
                      preview={String(programme.cover_image_url ?? "")}
                      busy={uploading === `${id}-cover`}
                      onFile={(file) => void upload(index, id, "cover", file)}
                    />
                    <MediaField
                      label="Programme logo"
                      id={`${id}-logo`}
                      preview={String(programme.logo_image_url ?? "")}
                      busy={uploading === `${id}-logo`}
                      onFile={(file) => void upload(index, id, "logo", file)}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function ProtectedProgrammeFacts({
  programme,
}: {
  programme: Record<string, unknown>;
}) {
  const source =
    programme.content_source && typeof programme.content_source === "object"
      ? (programme.content_source as Record<string, unknown>)
      : null;
  const majors = asStringList(programme.majors);
  const areas = asStringList(programme.learning_areas);
  const careers = asStringList(programme.career_directions);
  const profile = asStringList(programme.riasec_profile);

  return (
    <section
      className="border-y border-border bg-secondary/45 px-4 py-5"
      aria-labelledby={`${String(programme.id)}-protected-heading`}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xs bg-background text-primary-ink">
          <LockKeyhole aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-ink">
            Protected source-controlled facts
          </p>
          <h4
            id={`${String(programme.id)}-protected-heading`}
            className="mt-1 font-display text-lg font-semibold"
          >
            {String(programme.display_name ?? "Programme information")}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Programme identity, CMO-grounded content, recorded majors, and the
            RIASEC profile are read-only here. Corrections require an updated
            authoritative source and a new controlled catalogue version.
          </p>
        </div>
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-3 border-y border-border py-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-muted-foreground">
            Official label
          </dt>
          <dd className="mt-1 font-semibold">
            {String(programme.short_label ?? "Not recorded")}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted-foreground">
            RIASEC profile
          </dt>
          <dd className="mt-1 font-semibold">
            {profile.join(" / ") || "Pending authoritative basis"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted-foreground">
            Recorded majors
          </dt>
          <dd className="mt-1">{majors.join(", ") || "No majors recorded"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted-foreground">
            Content status
          </dt>
          <dd className="mt-1">
            {humanize(String(programme.content_status ?? "proposed"))}
          </dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h5 className="text-sm font-semibold">CMO-grounded summary</h5>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {String(programme.description ?? "No description recorded.")}
          </p>
        </div>
        <div>
          <h5 className="text-sm font-semibold">Source</h5>
          <p className="mt-1 text-sm text-muted-foreground">
            {String(
              source?.reference ?? source?.note ?? "Source review is pending.",
            )}
          </p>
          {source?.source_url && source?.source_name ? (
            <a
              href={String(source.source_url)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-primary-ink underline underline-offset-4"
            >
              {String(source.source_name)}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          ) : null}
        </div>
      </div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <ProtectedList title="Learning areas" items={areas} />
        <ProtectedList title="CMO career directions" items={careers} />
      </div>
    </section>
  );
}

function ProtectedList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h5 className="text-sm font-semibold">{title}</h5>
      {items.length ? (
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          No entries recorded.
        </p>
      )}
    </div>
  );
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string" && item !== "",
      )
    : [];
}

function ListField({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-28"
      />
    </div>
  );
}
function MediaField({
  label,
  id,
  preview,
  busy,
  onFile,
}: {
  label: string;
  id: string;
  preview: string;
  busy: boolean;
  onFile: (file?: File) => void;
}) {
  return (
    <div className="rounded-xs bg-secondary p-4">
      <div className="flex items-center gap-3">
        {preview ? (
          <img
            src={preview}
            alt=""
            className="size-16 rounded-xs bg-white object-cover"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-xs bg-background text-muted-foreground">
            <ImageUp aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => onFile(event.target.files?.[0])}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}
