import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import clsx from "clsx";
import { Badge } from "../../../components/ui/Badge";
import { Button, LinkButton } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { fetchCareer } from "../../../lib/api/careers.api";
import { fetchPathwayOrNull } from "../../../lib/api/pathways.api";
import {
  describeFixes,
  getOtherBlockers,
  listTopics,
  normalizeDraft,
  seedFromDetail,
  seedFromRow,
  validateDetails,
  type CareerDetailsForm,
  type EditableCareer,
  type ResourceItem,
  type RoadmapStage,
  type SkillItem,
  type SourceItem,
} from "../admin.editor";
import { STATUS_LABEL, formatDate, type AdminCareerRow } from "../admin.utils";
import { LOCAL_ID_PREFIX, useAdminStore } from "../adminStore";
import { useAdminCareers } from "../hooks/useAdminCareers";
import { useCurrentMember } from "../hooks/useCurrentMember";
import { buildReview } from "../admin.workflow";
import { Banner } from "./Banner";
import { DetailsTab } from "./DetailsTab";
import { HistoryTab } from "./HistoryTab";
import { ResourcesTab } from "./ResourcesTab";
import { RoadmapTab } from "./RoadmapTab";
import { SourcesTab } from "./SourcesTab";
import { SkillsTab } from "./SkillsTab";

const TABS = ["Details", "Skills", "Roadmap", "Resources", "Sources", "History"] as const;
type Tab = (typeof TABS)[number];

const STATUS_TONE = { published: "success", draft: "neutral", retired: "danger" } as const;

/** Loads the career, then hands a ready starting point to the editor. */
export function CareerEditorPage({
  careerId,
  initialTab,
}: {
  careerId: string;
  initialTab?: string;
}) {
  const { rows, isPending: rowsPending } = useAdminCareers({ detailFor: [careerId] });
  const saved = useAdminStore((s) => s.drafts[careerId]);
  const isLocal = careerId.startsWith(LOCAL_ID_PREFIX);

  const detail = useQuery({
    queryKey: ["career", careerId],
    queryFn: () => fetchCareer(careerId),
    enabled: !isLocal,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const pathway = useQuery({
    queryKey: ["pathway", careerId],
    queryFn: () => fetchPathwayOrNull(careerId),
    enabled: !isLocal,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const row = rows.find((r) => r.id === careerId);
  const loading = rowsPending || (!isLocal && (detail.isPending || pathway.isPending));

  if (loading) {
    return (
      <main aria-busy className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-16 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!row || (!isLocal && detail.isError && !saved)) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
        <BackButton />
        <StateMessage
          kind={row ? "error" : "no-match"}
          title={row ? "Couldn’t load this career" : "Career not found"}
          body="Go back to the careers list and try again."
        />
      </main>
    );
  }

  const initial: EditableCareer = saved
    ? normalizeDraft(saved)
    : detail.data
      ? seedFromDetail(detail.data, pathway.data)
      : seedFromRow(row);

  return (
    <CareerEditor
      key={careerId}
      row={row}
      initial={initial}
      initialTab={TABS.find((t) => t === initialTab) ?? "Details"}
      savedAt={saved?.savedAt ?? null}
      checkedAt={detail.data ? formatDate(detail.data.updatedAt) : null}
    />
  );
}

function BackButton() {
  return (
    <LinkButton isPrimary={false} to="/admin/careers" className="self-start">
      <ChevronLeft className="size-4" aria-hidden />
      Back
    </LinkButton>
  );
}

function CareerEditor({
  row,
  initial,
  initialTab,
  savedAt,
  checkedAt,
}: {
  row: AdminCareerRow;
  initial: EditableCareer;
  initialTab: Tab;
  savedAt: string | null;
  checkedAt: string | null;
}) {
  const saveDraft = useAdminStore((s) => s.saveDraft);
  const addReview = useAdminStore((s) => s.addReview);
  const { displayName } = useCurrentMember();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [form, setForm] = useState<EditableCareer>(initial);
  const [baseline, setBaseline] = useState(JSON.stringify(initial));
  const [lastSavedAt, setLastSavedAt] = useState(savedAt);
  const [attempted, setAttempted] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const dirty = JSON.stringify(form) !== baseline;
  const errors = validateDetails(form.details);
  const otherBlockers = getOtherBlockers(form);
  const errorCount = Object.keys(errors).length + otherBlockers.length;
  const topics = listTopics(form.stages);
  const shownErrors = attempted ? errors : {};

  const edit = (next: EditableCareer) => {
    setForm(next);
    setSubmitted(false);
    setSaveFailed(false);
  };
  const editDetails = (patch: Partial<CareerDetailsForm>) =>
    edit({ ...form, details: { ...form.details, ...patch } });
  const editSkills = (skills: SkillItem[]) => edit({ ...form, skills });
  const editStages = (stages: RoadmapStage[]) => edit({ ...form, stages });
  const editResources = (resources: ResourceItem[]) => edit({ ...form, resources });
  const editSources = (sources: SourceItem[]) => edit({ ...form, sources });

  /** Returns whether the save worked; failures keep the edits on the page. */
  const save = (submittedAt?: string) => {
    try {
      const now = new Date().toISOString();
      saveDraft(row.id, { ...form, savedAt: now, submittedAt });
      setBaseline(JSON.stringify(form));
      setLastSavedAt(now);
      setSaveFailed(false);
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  };

  const submit = () => {
    setAttempted(true);
    // Other changes are kept as a draft even when submitting is blocked.
    if (errorCount > 0) {
      save();
      return;
    }
    if (save(new Date().toISOString())) {
      addReview(buildReview(row, initial, form, displayName));
      setSubmitted(true);
    }
  };

  const copyChanges = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(form, null, 2));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const title = form.details.name.trim() || row.title;
  const updated = formatDate(lastSavedAt ?? row.updatedAt);

  return (
    <main className="flex flex-1 flex-col gap-6 px-page-mobile py-6 sm:px-page-tablet lg:p-8">
      <BackButton />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="grid size-[72px] shrink-0 place-items-center rounded-2xl bg-info-50 font-display text-2xl font-semibold text-brand-700"
          >
            {title.charAt(0)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {title}
              </h1>
              {dirty ? (
                <Badge tone="warning">Unsaved changes</Badge>
              ) : (
                <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
              )}
            </div>
            <p className="mt-1 text-ink-muted">
              {dirty ? `${STATUS_LABEL[row.status]} · ` : ""}Last updated {updated}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {dirty ? (
            <Button isPrimary={false} onClick={() => save()}>
              Save draft
            </Button>
          ) : (
            // Local dummy careers have no public page to preview.
            !row.isLocal && (
              <LinkButton
                isPrimary={false}
                to="/careers/$careerId"
                params={{ careerId: row.id }}
              >
                Preview as learner
              </LinkButton>
            )
          )}
          <Button onClick={submit}>Submit changes for review</Button>
        </div>
      </div>

      <div role="tablist" aria-label="Career sections" className="flex flex-wrap gap-x-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={clsx(
              "-mb-px border-b-2 px-0.5 py-3 text-base focus-ring",
              tab === t
                ? "border-brand-600 font-medium text-brand-700"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {saveFailed && (
        <Banner
          tone="danger"
          title="We could not save your changes"
          actions={
            <>
              <Button onClick={() => (submitted ? submit() : save())}>Try again</Button>
              <Button isPrimary={false} onClick={copyChanges}>
                {copied ? "Copied" : "Copy my changes"}
              </Button>
            </>
          }
        >
          Your edits are still on this page. Check your connection and try again. If it keeps
          failing, copy your changes before you leave.
        </Banner>
      )}

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="flex flex-col gap-6">
        {tab === "Details" && (
          <>
            <DetailsTab
              details={form.details}
              errors={shownErrors}
              checkedAt={checkedAt}
              onChange={editDetails}
            />
            {submitted ? (
              <Banner tone="info" title="Submitted for review">
                It’s in the Reviews inbox. A second editor will review your changes before learners see them.
              </Banner>
            ) : errorCount > 0 && attempted ? (
              <Banner
                tone="danger"
                title={`${errorCount} thing${errorCount > 1 ? "s" : ""} need${errorCount > 1 ? "" : "s"} fixing before you can submit`}
              >
                {[
                  Object.keys(errors).length > 0 ? describeFixes(errors) : null,
                  ...otherBlockers,
                ]
                  .filter(Boolean)
                  .join(". ")}
                . Your other changes are saved as a draft.
              </Banner>
            ) : errorCount === 0 ? (
              <Banner tone="success" title="Ready to submit">
                All required fields and sources are filled in. A second editor reviews changes
                before learners see them.
              </Banner>
            ) : null}
          </>
        )}

        {tab === "Skills" && (
          <SkillsTab
            skills={form.skills}
            topics={topics}
            sourceTitles={form.sources.map((x) => x.title)}
            onChange={editSkills}
          />
        )}

        {tab === "Roadmap" && (
          <RoadmapTab
            stages={form.stages}
            skills={form.skills}
            resources={form.resources}
            onChange={editStages}
          />
        )}

        {tab === "Resources" && (
          <ResourcesTab
            careerName={title}
            resources={form.resources}
            topics={topics}
            onChange={editResources}
          />
        )}

        {tab === "Sources" && <SourcesTab sources={form.sources} onChange={editSources} />}

        {tab === "History" && <HistoryTab />}
      </div>
    </main>
  );
}
