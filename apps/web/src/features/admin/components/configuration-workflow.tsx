import {
  Eye,
  GitBranch,
  Save,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  mutateAdmin,
  useAdminResource,
  type ConfigurationPreview,
  type ConfigurationVersion,
  type ConfigurationWorkspace,
} from "@/features/admin/data/admin-api";
import { formatDate, humanize } from "@/features/admin/data/admin-formatters";
import { CatalogueProfileEditor } from "@/features/admin/components/catalogue-profile-editor";
import { ConfigurationDiffPreview, programmeChangeScope } from "@/features/admin/components/configuration-diff-preview";

function ConfigurationWorkflow({
  programmeId,
  onPublished,
}: {
  programmeId?: string;
  onPublished?: () => void;
}) {
  const resource = useAdminResource<ConfigurationWorkspace>(
    "/configurations/catalogue",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const draft = resource.data?.versions.find(
    (version) => version.status === "draft",
  );

  async function createDraft(sourceVersionId?: number) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await mutateAdmin(
        "/configurations/catalogue",
        "POST",
        sourceVersionId ? { sourceVersionId } : {},
      );
      setMessage(
        sourceVersionId
          ? "A new draft was created from the selected historical version."
          : "Draft created from the current runtime configuration.",
      );
      resource.retry();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The draft could not be created.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (resource.loading)
    return (
      <div className="h-48 animate-pulse rounded bg-muted" role="status">
        <span className="sr-only">Loading configuration workflow</span>
      </div>
    );
  if (resource.error || !resource.data)
    return (
      <p
        role="alert"
        className="bg-destructive/8 p-4 text-sm text-destructive-ink"
      >
        {resource.error ?? "Configuration data is unavailable."}
      </p>
    );

  return (
    <section
      className="border-y border-border bg-background py-5"
      aria-labelledby="catalogue-governance-heading"
    >
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Controlled programme update
          </p>
          <h2
            id="catalogue-governance-heading"
            className="mt-1 font-display text-xl font-semibold"
          >
            Student enrichment and media
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Official programme facts and recommendation profiles are protected.
            Editable fields are limited to clearly labelled guidance and media.
          </p>
        </div>
        {!draft ? (
          <Button
            type="button"
            className="rounded-xs"
            disabled={busy}
            onClick={() => void createDraft()}
          >
            <GitBranch aria-hidden="true" /> Start a catalogue draft
          </Button>
        ) : null}
      </div>
      {message ? (
        <p role="status" className="mt-4 text-sm font-medium text-success-ink">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-4 text-sm font-medium text-destructive-ink"
        >
          {error}
        </p>
      ) : null}
      {draft ? (
        <ConfigurationEditor
          key={draft.id}
          draft={draft}
          baseline={resource.data.runtime}
          programmeId={programmeId}
          onChanged={resource.retry}
          onPublished={onPublished}
        />
      ) : null}
      {!programmeId ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">Version history</h3>
          <ol className="mt-3 divide-y">
            {resource.data.versions.length ? (
              resource.data.versions.map((version) => (
                <li
                  key={version.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    <strong>Version {version.version}</strong>
                    <span className="ml-2 text-sm text-muted-foreground">
                      Created by {version.createdBy ?? "Unknown"} ·{" "}
                      {formatDate(version.createdAt)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge
                      variant={
                        version.status === "published"
                          ? "success"
                          : version.status === "draft"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {humanize(version.status)}
                    </Badge>
                    {!draft && version.status !== "draft" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded"
                        disabled={busy}
                        onClick={() => void createDraft(version.id)}
                      >
                        Use as new draft
                      </Button>
                    ) : null}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3 text-sm text-muted-foreground">
                No database versions yet. The bundled runtime configuration is
                active.
              </li>
            )}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

function ConfigurationEditor({
  draft,
  baseline,
  programmeId,
  onChanged,
  onPublished,
}: {
  draft: ConfigurationVersion;
  baseline: Record<string, unknown>;
  programmeId?: string;
  onChanged: () => void;
  onPublished?: () => void;
}) {
  const [payload, setPayload] = useState<Record<string, unknown>>(
    draft.payload,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState<ConfigurationPreview | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<
    "saved" | "pending" | "saving" | "failed"
  >("saved");
  const lastSavedPayload = useRef(JSON.stringify(draft.payload));
  const saveSequence = useRef(0);
  const autosaveTimer = useRef<number | null>(null);
  const changedSections = Array.from(
    new Set([...Object.keys(baseline), ...Object.keys(payload)]),
  ).filter(
    (key) => JSON.stringify(baseline[key]) !== JSON.stringify(payload[key]),
  );
  const programmeScope = programmeChangeScope(baseline, payload, programmeId);
  function changePayload(nextPayload: Record<string, unknown>) {
    setPayload(nextPayload);
    setPreview(null);
  }

  useEffect(() => {
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedPayload.current) return;
    const sequence = ++saveSequence.current;
    setAutosaveStatus("pending");
    autosaveTimer.current = window.setTimeout(() => {
      setAutosaveStatus("saving");
      void mutateAdmin<ConfigurationVersion>(
        `/configurations/versions/${draft.id}`,
        "PUT",
        { payload },
      )
        .then((saved) => {
          if (sequence !== saveSequence.current) return;
          lastSavedPayload.current = JSON.stringify(saved.payload);
          setAutosaveStatus("saved");
        })
        .catch((reason) => {
          if (sequence !== saveSequence.current) return;
          setAutosaveStatus("failed");
          setError(
            reason instanceof Error
              ? reason.message
              : "Autosave failed. Your changes remain in this editor; retry before publishing.",
          );
        });
    }, 700);
    return () => {
      if (autosaveTimer.current !== null)
        window.clearTimeout(autosaveTimer.current);
    };
  }, [draft.id, payload]);

  async function save() {
    saveSequence.current += 1;
    if (autosaveTimer.current !== null)
      window.clearTimeout(autosaveTimer.current);
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const saved = await mutateAdmin<ConfigurationVersion>(
        `/configurations/versions/${draft.id}`,
        "PUT",
        { payload },
      );
      lastSavedPayload.current = JSON.stringify(saved.payload);
      setAutosaveStatus("saved");
      setMessage("Draft saved.");
      onChanged();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The draft could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function previewChanges() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      setPreview(
        await mutateAdmin(
          `/configurations/versions/${draft.id}/preview`,
          "POST",
          { payload },
        ),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The preview could not be prepared.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    saveSequence.current += 1;
    if (autosaveTimer.current !== null)
      window.clearTimeout(autosaveTimer.current);
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await mutateAdmin(`/configurations/versions/${draft.id}`, "PUT", {
        payload,
      });
      await mutateAdmin(`/configurations/versions/${draft.id}/publish`, "POST");
      setMessage(
        "Published successfully. Student programme cards and details now use these changes.",
      );
      onChanged();
      onPublished?.();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The draft could not be published.",
      );
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="mt-6 border-t border-border pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Shared catalogue draft - Version {draft.version}
          </p>
          <p className="mt-1 max-w-2xl text-sm">
            Changes autosave to one shared catalogue draft. Publishing applies
            every pending programme change in that draft, not only the programme
            currently open.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xs bg-background"
            disabled={busy}
            onClick={() => void previewChanges()}
          >
            <Eye aria-hidden="true" /> Review changes
          </Button>
          <Button
            type="button"
            className="rounded-xs"
            disabled={busy || !preview?.hasChanges}
            onClick={() => setConfirmOpen(true)}
          >
            <Send aria-hidden="true" /> Publish full catalogue
          </Button>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {programmeId ? (
          <>
            <strong>{programmeScope.selectedFieldCount}</strong> editable field
            {programmeScope.selectedFieldCount === 1 ? "" : "s"} changed in this
            programme; <strong>{programmeScope.changedProgrammeCount}</strong>{" "}
            programme{programmeScope.changedProgrammeCount === 1 ? "" : "s"}{" "}
            changed across the full draft.
          </>
        ) : (
          <>
            Changed sections compared with the active runtime:{" "}
            <strong>
              {changedSections.length
                ? changedSections.map(humanize).join(", ")
                : "None"}
            </strong>
            .
          </>
        )}
      </p>
      <p
        className={`mt-2 text-xs font-semibold ${autosaveStatus === "failed" ? "text-destructive-ink" : "text-muted-foreground"}`}
        role="status"
      >
        {autosaveStatus === "saved"
          ? "Draft autosaved"
          : autosaveStatus === "pending"
            ? "Autosave pending…"
            : autosaveStatus === "saving"
              ? "Saving draft…"
              : "Autosave failed — retry before publishing."}
      </p>
      {autosaveStatus === "failed" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3 rounded-xs bg-background"
          disabled={busy}
          onClick={() => void save()}
        >
          <Save aria-hidden="true" /> Retry saving draft
        </Button>
      ) : null}
      <CatalogueProfileEditor
        payload={payload}
        programmeId={programmeId}
        onChange={changePayload}
      />
      {preview ? (
        <ConfigurationDiffPreview preview={preview} programmeId={programmeId} />
      ) : null}
      {message ? (
        <p role="status" className="mt-4 text-sm font-medium text-success-ink">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-4 text-sm font-medium text-destructive-ink"
        >
          {error}
        </p>
      ) : null}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Publish the full catalogue draft?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This publishes pending editable-field and media changes for{" "}
              {programmeScope.changedProgrammeCount} programme
              {programmeScope.changedProgrammeCount === 1 ? "" : "s"}. Protected
              CMO facts and recommendation profiles cannot be overwritten.
              Existing historical recommendations will not change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue reviewing</AlertDialogCancel>
            <AlertDialogAction onClick={() => void publish()}>
              Publish full catalogue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { ConfigurationWorkflow };
