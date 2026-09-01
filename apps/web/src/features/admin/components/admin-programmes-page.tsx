import {
  AlertTriangle,
  BookOpen,
  BriefcaseBusiness,
  Clock3,
  ExternalLink,
  Eye,
  GraduationCap,
  Pencil,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AdminPageError,
  AdminPageHeader,
  AdminPageSkeleton,
  EmptyPanel,
} from "@/features/admin/components/admin-shared";
import { ConfigurationWorkflow } from "@/features/admin/components/configuration-workflow";
import {
  useAdminResource,
  type AdminProgramme,
  type AdminProgrammeCatalogue,
} from "@/features/admin/data/admin-api";
import { getProgrammeImages } from "@/features/student/programmes/programme-images";

const programmeGroups = [
  { label: "Technology", ids: ["bs-information-technology"] },
  {
    label: "Business & Hospitality",
    ids: ["bs-business-administration", "bs-hospitality-management"],
  },
  {
    label: "Education",
    ids: [
      "bachelor-elementary-education",
      "bachelor-secondary-education",
      "bachelor-physical-education",
    ],
  },
  { label: "Criminology & Public Safety", ids: ["bs-criminology"] },
  {
    label: "Community, Health & Information",
    ids: [
      "bs-midwifery",
      "bachelor-library-information-science",
      "bs-sociology",
      "bs-community-development",
    ],
  },
];

function programmeGroup(programmeId: string) {
  return (
    programmeGroups.find((group) => group.ids.includes(programmeId))?.label ??
    "Academic programme"
  );
}

function getProgrammeType(programme: AdminProgramme) {
  if (programme.eligibilityGroup === "board") return "Board programme";
  if (programme.eligibilityGroup === "non_board") return "Non-board programme";
  return "Classification unavailable";
}

function AdminProgrammesPage() {
  const resource = useAdminResource<AdminProgrammeCatalogue>("/programmes");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "confirmed" | "review">("all");
  const [selected, setSelected] = useState<AdminProgramme | null>(null);
  const [editing, setEditing] = useState<AdminProgramme | null>(null);

  const visibleProgrammes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (resource.data?.programmes ?? []).filter((programme) => {
      const searchable = [
        programme.code,
        programme.name,
        programme.description,
        programmeGroup(programme.id),
        ...programme.learningAreas,
        ...programme.careerDirections,
      ]
        .join(" ")
        .toLowerCase();
      const matchesFilter =
        filter === "all" ||
        (filter === "confirmed" && programme.duration?.status === "ched_psg") ||
        (filter === "review" && programme.duration?.status !== "ched_psg");
      return (
        matchesFilter &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });
  }, [filter, query, resource.data]);

  if (resource.loading) return <AdminPageSkeleton />;
  if (resource.error || !resource.data)
    return (
      <AdminPageError
        message={resource.error ?? "No programme data was returned."}
        onRetry={resource.retry}
      />
    );

  const catalogue = resource.data;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Programme monitoring" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Active catalogue
          </p>
          <p className="mt-2 font-display text-2xl font-bold">
            {catalogue.programmes.length} programmes
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            For Explore and My Matches
          </p>
        </div>
        <div className="h-px bg-border lg:h-10 lg:w-px" />
        <label className="flex-1 min-w-0">
          <span className="sr-only">Search programme catalogue</span>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, code, areas, or careers"
              className="min-h-11 rounded-lg pl-10 text-sm"
            />
          </div>
        </label>
        <label className="min-w-48">
          <span className="sr-only">Filter by source status</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof filter)}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold text-foreground"
          >
            <option value="all">All programmes</option>
            <option value="confirmed">CHED confirmed</option>
            <option value="review">Needs review</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <h2 className="font-display text-lg font-bold">Results</h2>
        <p className="text-sm text-muted-foreground">
          {visibleProgrammes.length} of {catalogue.programmes.length}
        </p>
      </div>

      {visibleProgrammes.length ? (
        <section
          className="grid gap-6 xl:grid-cols-2"
          aria-label="Programme catalogue monitoring cards"
        >
          {visibleProgrammes.map((programme) => (
            <AdminProgrammeCard
              key={programme.id}
              programme={programme}
              onInspect={() => setSelected(programme)}
              onEdit={() => setEditing(programme)}
            />
          ))}
        </section>
      ) : (
        <EmptyPanel
          title="No programmes match this view"
          description="Clear the search or choose another monitoring filter."
        />
      )}

      <AdminProgrammeSheet
        programme={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
      <ProgrammeEditorSheet
        programme={editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onPublished={resource.retry}
      />
    </div>
  );
}

function AdminProgrammeCard({
  programme,
  onInspect,
  onEdit,
}: {
  programme: AdminProgramme;
  onInspect: () => void;
  onEdit: () => void;
}) {
  const fallback = getProgrammeImages(programme.id);
  const cover = programme.coverImageUrl || fallback.cover;
  const needsReview = programme.duration?.status !== "ched_psg";
  const programmeType = getProgrammeType(programme);
  const primaryCareer = programme.careerDirections[0] || "Various pathways";

  return (
    <article className="group overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
      <div className="relative h-44 overflow-hidden bg-primary/10">
        {cover ? (
          <img
            src={cover}
            alt={`${programme.name} programme`}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <BookOpen
            aria-hidden="true"
            className="absolute inset-0 m-auto size-16 text-primary/25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
          {programmeGroup(programme.id)}
        </span>
        <Badge
          variant={needsReview ? "warning" : "success"}
          className="absolute bottom-4 left-4"
        >
          {needsReview ? "Source review needed" : "CHED duration sourced"}
        </Badge>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {programme.code}
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold leading-7">
              {programme.name}
            </h3>
          </div>
          <div
            className="flex shrink-0 gap-1"
            aria-label={`RIASEC profile ${programme.profile.join(", ")}`}
          >
            {programme.profile.map((code) => (
              <span
                key={code}
                className="flex size-8 items-center justify-center rounded-lg bg-primary-fixed text-xs font-bold text-on-primary-fixed"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {programme.description}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
          <CardDatum
            icon={Clock3}
            label="Duration"
            value={programme.duration?.display || "Not published"}
          />
          <CardDatum
            icon={GraduationCap}
            label="Degree type"
            value={programme.degreeType || "Not published"}
          />
          <CardDatum
            icon={ShieldCheck}
            label="Programme type"
            value={programmeType}
          />
          <CardDatum
            icon={BriefcaseBusiness}
            label="Career field"
            value={primaryCareer}
          />
        </dl>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {programme.duration?.source_url ? (
            <a
              href={programme.duration.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary underline underline-offset-4"
            >
              {programme.duration.source_name || "CHED source"}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">
              No duration source published
            </span>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-lg"
              onClick={onInspect}
            >
              <Eye aria-hidden="true" />
              View details
            </Button>
            <Button type="button" className="rounded-lg" onClick={onEdit}>
              <Pencil aria-hidden="true" />
              Edit programme
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProgrammeEditorSheet({
  programme,
  onOpenChange,
  onPublished,
}: {
  programme: AdminProgramme | null;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
}) {
  if (!programme) return null;
  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(56rem,96vw)] max-w-none overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-primary px-6 py-5 text-primary-foreground">
          <SheetHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
              Programme editor · {programme.code}
            </p>
            <SheetTitle className="text-primary-foreground">
              Edit {programme.name}
            </SheetTitle>
            <SheetDescription className="text-primary-foreground/75">
              Update student-visible content and media here. CHED and Philippine
              API fields remain locked.
            </SheetDescription>
          </SheetHeader>
        </div>
        <div className="p-5">
          <ConfigurationWorkflow
            kind="catalogue"
            programmeId={programme.id}
            onPublished={onPublished}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AdminProgrammeSheet({
  programme,
  onOpenChange,
}: {
  programme: AdminProgramme | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!programme) return null;
  const fallback = getProgrammeImages(programme.id);
  const cover = programme.coverImageUrl || fallback.cover;
  const logo = programme.logoImageUrl || fallback.logo;
  const programmeType = getProgrammeType(programme);
  const primaryCareer = programme.careerDirections[0] || "Various pathways";

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(48rem,96vw)] max-w-none overflow-y-auto p-0">
        <div className="relative h-52 overflow-hidden bg-primary">
          {cover ? (
            <img src={cover} alt="" className="size-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent" />
          {logo ? (
            <img
              src={logo}
              alt=""
              className="absolute bottom-5 right-6 size-16 rounded-lg bg-white object-contain p-1 shadow-sm"
            />
          ) : null}
        </div>
        <div className="p-6">
          <SheetHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {programme.code} · {programmeGroup(programme.id)}
            </p>
            <SheetTitle className="font-display text-3xl font-semibold">
              {programme.name}
            </SheetTitle>
            <SheetDescription>{programme.description}</SheetDescription>
          </SheetHeader>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <DetailDatum
              label="Degree type"
              value={programme.degreeType || "Not published"}
            />
            <DetailDatum
              label="Duration"
              value={programme.duration?.display || "Not published"}
            />
            <DetailDatum label="Programme type" value={programmeType} />
            <DetailDatum label="Career field" value={primaryCareer} />
          </dl>
          <SourcePanel title="Duration source" value={programme.duration} />
          <DetailSection
            title="Learning areas"
            items={programme.learningAreas}
            descriptions={programme.learningAreaDescriptions}
            topics={programme.learningAreaTopics}
          />
          <DetailSection
            title="Possible career directions"
            items={programme.careerDirections}
          />
          {programme.majors.length ? (
            <DetailSection title="Recorded majors" items={programme.majors} />
          ) : null}
          <DetailSection
            title="Recommended SHS strands"
            items={programme.recommendedStrands}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CardDatum({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon aria-hidden="true" className="size-4 text-primary" />
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
function DetailDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/80 p-4">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
function SourcePanel({
  title,
  value,
}: {
  title: string;
  value: AdminProgramme["duration"];
}) {
  if (!value) return null;
  return (
    <section className="mt-4 rounded-xl bg-secondary/80 p-4">
      <div className="flex items-start gap-3">
        {value.status === "ched_psg" ? (
          <BookOpen aria-hidden="true" className="mt-0.5 size-5 text-primary" />
        ) : (
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 size-5 text-warning"
          />
        )}
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {value.note || value.display}
          </p>
          {value.source_url ? (
            <a
              href={value.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4"
            >
              {value.source_name || "Open source"}
              <ExternalLink aria-hidden="true" className="size-3" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
function DetailSection({
  title,
  items,
  descriptions,
  topics,
}: {
  title: string;
  items: string[];
  descriptions?: Record<string, string>;
  topics?: Record<string, string[]>;
}) {
  return (
    <section className="mt-6">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-3 divide-y divide-border/60 rounded-2xl border border-border/70 bg-card overflow-hidden">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-4 p-4 transition-colors hover:bg-secondary/40"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-fixed font-label text-xs font-bold text-on-primary-fixed">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="text-sm font-semibold">{item}</strong>
                {descriptions?.[item] ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {descriptions[item]}
                  </p>
                ) : null}
                {topics?.[item]?.length ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {topics[item].map((topic) => (
                      <li
                        key={topic}
                        className="rounded-md bg-secondary px-2.5 py-0.5 font-label text-[11px] font-medium text-foreground/80"
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          No published entries.
        </p>
      )}
    </section>
  );
}

export { AdminProgrammesPage };
