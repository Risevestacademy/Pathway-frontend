import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRightRegular } from "@mingcute/react/core-regular";
import cubes from "../../../assets/images/discover-hero-cubes.svg";
import AppTopNav from "../../../components/AppTopNav";
import { Badge } from "../../../components/ui/Badge";
import { Button, LinkButton } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { progressErrorMessage } from "../../../lib/api/progressErrors";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useActivePathway } from "../../progress/hooks/useActivePathway";
import { useMyPathways } from "../../progress/hooks/useMyPathways";
import {
  nextActiveStep,
  totalCompletedSteps,
  type ActivePathway,
  type SavedPathway,
} from "../../progress/progress.types";
import { useSyncLocalActivePathway } from "../../skillCheck/hooks/useSyncLocalActivePathway";
import { useSyncLocalProgress } from "../../skillCheck/hooks/useSyncLocalProgress";
import {
  clampPercentage,
  continueLabel,
  featuredPathway,
  firstNameOf,
  greetingFor,
  skillTags,
  weekdayIndex,
} from "../dashboard.utils";
import { ActivityGrid, Trophies } from "./ActivityAndTrophies";
import { CurrentProjects } from "./CurrentProjects";
import { DashCard } from "./DashCard";
import { PathwaysArt, TopicsArt } from "./DashboardArt";
import { TodaysGoals, type Goal } from "./TodaysGoals";

const page = "flex flex-1 flex-col gap-8 px-page-mobile py-6 sm:px-page-tablet lg:px-8";

/** The app navigation, then the page. Each page brings its own navigation, so every state needs it. */
function Frame({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <>
      <AppTopNav />
      <main aria-busy={busy || undefined} className={page}>
        {children}
      </main>
    </>
  );
}

const arrow = (
  <ArrowRightRegular
    size={18}
    aria-hidden
    className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
  />
);

/** The wide "Continue" button: to one step of a roadmap, or to the roadmap. */
function RoadmapButton({
  careerId,
  stepId,
  children,
}: {
  careerId: string;
  stepId?: string;
  children: ReactNode;
}) {
  const className = "group h-full min-h-12 w-full justify-center";
  const label = (
    <span className="inline-flex items-center gap-1.5">
      {children}
      {arrow}
    </span>
  );
  return stepId ? (
    <LinkButton
      to="/careers/$careerId/roadmap/$stepId"
      params={{ careerId, stepId }}
      className={className}
    >
      {label}
    </LinkButton>
  ) : (
    <LinkButton to="/careers/$careerId/roadmap" params={{ careerId }} className={className}>
      {label}
    </LinkButton>
  );
}

/** The text link under the progress bar. */
function RoadmapTextLink({
  careerId,
  stepId,
  children,
}: {
  careerId: string;
  stepId?: string;
  children: ReactNode;
}) {
  const className =
    "focus-ring group inline-flex w-fit items-center gap-1.5 rounded font-medium text-brand-700 hover:underline";
  const label = (
    <>
      {children}
      {arrow}
    </>
  );
  return stepId ? (
    <Link
      to="/careers/$careerId/roadmap/$stepId"
      params={{ careerId, stepId }}
      className={className}
    >
      {label}
    </Link>
  ) : (
    <Link to="/careers/$careerId/roadmap" params={{ careerId }} className={className}>
      {label}
    </Link>
  );
}

function Welcome({ greeting, name }: { greeting: string; name: string | null }) {
  return (
    <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
      {greeting}
      {name ? `, ${name}` : ""}
    </h1>
  );
}

type Tab = "overview" | "next-steps" | "projects";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "next-steps", label: "Next steps" },
  { id: "projects", label: "Projects" },
];

function Tabs({ value, onChange }: { value: Tab; onChange: (tab: Tab) => void }) {
  return (
    <div role="tablist" aria-label="Dashboard sections" className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`dashboard-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls="dashboard-panel"
            onClick={() => onChange(tab.id)}
            className={clsx(
              "focus-ring rounded-lg border px-4 py-2 text-base",
              selected
                ? "border-brand-100 bg-brand-100 font-medium text-brand-800"
                : "border-line bg-surface text-ink-muted hover:bg-surface-muted",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

const STEP_STATUS: Record<string, { label: string; tone: "success" | "info" | "neutral" }> = {
  COMPLETED: { label: "Done", tone: "success" },
  IN_PROGRESS: { label: "In progress", tone: "info" },
  NOT_STARTED: { label: "Not started", tone: "neutral" },
};

function NextSteps({
  active,
  isPending,
  isError,
}: {
  active: ActivePathway | undefined;
  isPending: boolean;
  isError: boolean;
}) {
  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (isError) {
    return (
      <div className="rounded-3xl border border-line-strong">
        <StateMessage
          kind="error"
          title="Couldn’t load your steps"
          body="Check your connection and try again."
        />
      </div>
    );
  }
  const steps = [...(active?.steps ?? [])].sort((a, b) => a.order - b.order);
  if (steps.length === 0) {
    return (
      <div className="rounded-3xl border border-line-strong">
        <StateMessage
          kind="empty"
          title="No next steps yet"
          body="Choose a pathway and its steps will show up here."
        />
      </div>
    );
  }
  const nextId = active?.progress?.nextStepId;
  return (
    <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line-strong">
      {steps.map((step) => {
        const status = STEP_STATUS[step.status] ?? STEP_STATUS.NOT_STARTED;
        return (
          <li key={step.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-medium text-ink">
                {step.order}. {step.title}
              </p>
              {step.skills.length > 0 && (
                <p className="mt-0.5 text-sm tracking-wide text-ink-muted">
                  {skillTags(step.skills)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {step.id === nextId && <Badge tone="brand">Up next</Badge>}
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function CurrentProgress({
  pathway,
  nextStep,
}: {
  pathway: SavedPathway;
  nextStep: { id: string; title: string } | undefined;
}) {
  const { career, progress } = pathway;
  const percentage = clampPercentage(progress.percentage);
  return (
    <DashCard
      title="Current Progress"
      innerClassName="relative flex min-h-64 flex-col justify-between gap-6 overflow-hidden border border-brand-100 bg-brand-50 p-5"
    >
      <img
        src={cubes}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-auto max-w-none select-none sm:block"
      />
      <div className="relative">
        <p className="font-display text-4xl font-medium text-ink">{percentage}%</p>
        <p className="mt-1 text-ink-muted">{career.title}</p>
      </div>
      <div className="relative flex flex-col gap-4">
        <div
          role="progressbar"
          aria-label={`${career.title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          className="h-2 w-full overflow-hidden rounded-full bg-white"
        >
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${percentage}%` }} />
        </div>
        {career.retired ? (
          <p className="text-sm text-ink-muted">
            This career has been retired, so its roadmap won’t change.
          </p>
        ) : (
          <RoadmapTextLink careerId={career.id} stepId={nextStep?.id}>
            {nextStep ? `Continue with ${nextStep.title}` : continueLabel(progress)}
          </RoadmapTextLink>
        )}
      </div>
    </DashCard>
  );
}

function CountCard({
  title,
  value,
  tint,
  art,
}: {
  title: string;
  value: number;
  tint: string;
  art: ReactNode;
}) {
  return (
    <DashCard
      title={title}
      innerClassName={clsx("relative flex min-h-64 items-end overflow-hidden border p-5", tint)}
    >
      {art}
      <p className="relative font-display text-4xl font-medium text-ink">{value}</p>
    </DashCard>
  );
}

/** Where a signed-in person lands: their progress, or a way to start. */
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [tab, setTab] = useState<Tab>("overview");
  const { data: pathways, isPending, isError, error, refetch } = useMyPathways();
  const active = useActivePathway(Boolean(pathways?.length));
  // A pathway begun in My Pathway before it told the server is saved now, once.
  const { syncing } = useSyncLocalActivePathway(pathways?.length === 0);
  // And the step they start from and the steps they've done there, in the background.
  useSyncLocalProgress(active.data);
  const greeting = greetingFor();
  const name = firstNameOf(user);

  if (isPending || syncing) {
    return (
      <Frame busy>
        <Skeleton className="h-12 w-2/3 max-w-md" />
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-64 w-full" />
      </Frame>
    );
  }

  if (isError) {
    return (
      <Frame>
        <Welcome greeting={greeting} name={name} />
        <div className="rounded-3xl border border-line-strong">
          <StateMessage
            kind="error"
            title="Couldn’t load your progress"
            body={progressErrorMessage(error, "pathways")}
            action={<Button onClick={() => void refetch()}>Try again</Button>}
          />
        </div>
      </Frame>
    );
  }

  if (pathways.length === 0) {
    return (
      <Frame>
        <div>
          <Welcome greeting="Welcome" name={name} />
          <p className="mt-3 max-w-xl text-ink-muted">
            Let’s set up your dashboard. Pick a career to explore, and we’ll show your progress
            here.
          </p>
        </div>
        <section className="relative overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 p-6 sm:p-8">
          <img
            src={cubes}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-auto max-w-none select-none md:block"
          />
          <div className="relative flex min-h-56 max-w-md flex-col items-start justify-between gap-8">
            <div>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Your pathway starts here!
              </h2>
              <p className="mt-3 text-ink-muted">
                Explore careers and choose one to follow. Your roadmap and progress will appear
                here.
              </p>
            </div>
            <LinkButton to="/careers" className="group">
              <span className="inline-flex items-center gap-1.5">
                Explore careers
                <ArrowRightRegular size={18} aria-hidden />
              </span>
            </LinkButton>
          </div>
        </section>
      </Frame>
    );
  }

  const featured = featuredPathway(pathways) ?? pathways[0];
  // What the saved-pathways list can't say (the next step, its skills, the role) comes from the
  // active pathway, and is only used when that is the pathway being shown.
  const details = active.data?.career?.id === featured.career.id ? active.data : undefined;
  const nextStep = details ? nextActiveStep(details) : undefined;
  const nextStepSkills = nextStep
    ? (details?.steps.find((step) => step.id === nextStep.id)?.skills ?? [])
    : [];
  const pathwayTitle = details?.pathway?.title ?? featured.career.title;
  // There is no goal, XP or streak data yet, so nothing is met and every goal is worth 0.
  const nothingDoneYet = [false, false, false, false, false, false, false];
  const goals: Goal[] = [
    {
      id: "lesson",
      label: nextStep ? `Finish ${nextStep.title}` : "Finish your next lesson",
      xp: 0,
      done: false,
    },
    {
      id: "skill-check",
      label: `Take the ${featured.career.title} skill check`,
      xp: 0,
      done: false,
    },
    { id: "save", label: "Save a career to compare", xp: 0, done: false },
  ];

  return (
    <Frame>
      <Tabs value={tab} onChange={setTab} />

      <div
        role="tabpanel"
        id="dashboard-panel"
        aria-labelledby={`dashboard-tab-${tab}`}
        className="flex flex-col gap-8"
      >
        {tab === "overview" && (
          <>
            <Welcome greeting={greeting} name={name} />

            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
              <CurrentProgress pathway={featured} nextStep={nextStep} />
              <CountCard
                title="Pathways"
                value={pathways.length}
                tint="border-amber-200 bg-amber-50"
                art={<PathwaysArt />}
              />
              <CountCard
                title="Topics Completed"
                value={totalCompletedSteps(pathways)}
                tint="border-pink-200 bg-pink-50"
                art={<TopicsArt />}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[5fr_8fr]">
              <TodaysGoals goals={goals} today={weekdayIndex()} doneDays={nothingDoneYet} />
              <CurrentProjects
                project={{
                  title: nextStep?.title ?? featured.career.title,
                  description: details?.career?.roleSummary ?? "",
                  tags: skillTags(nextStepSkills),
                  pathwayTitle,
                  percentage: featured.progress.percentage,
                }}
                moreCount={pathways.length - 1}
                empty="No projects yet"
                action={
                  featured.career.retired ? (
                    <p className="rounded-xl bg-surface-muted px-4 py-3 text-ink-muted">
                      This career has been retired.
                    </p>
                  ) : (
                    <RoadmapButton careerId={featured.career.id} stepId={nextStep?.id}>
                      Continue
                    </RoadmapButton>
                  )
                }
              />
            </div>

            <section aria-labelledby="activity-heading" className="flex flex-col gap-3">
              <h2 id="activity-heading" className="font-display text-xl font-medium text-ink">
                Activity
              </h2>
              <div className="grid gap-4 lg:grid-cols-[7fr_3fr]">
                <ActivityGrid />
                <Trophies />
              </div>
            </section>
          </>
        )}

        {tab === "next-steps" && (
          <NextSteps active={active.data} isPending={active.isPending} isError={active.isError} />
        )}

        {tab === "projects" && (
          <div className="rounded-3xl border border-line-strong">
            <StateMessage
              kind="empty"
              title="No projects yet"
              body="Your current projects, progress and feedback will show up here."
              action={
                <LinkButton to="/skill-check" isPrimary={false}>
                  Build my pathway
                </LinkButton>
              }
            />
          </div>
        )}
      </div>
    </Frame>
  );
}
