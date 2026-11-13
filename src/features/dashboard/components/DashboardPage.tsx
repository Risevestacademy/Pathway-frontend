import { Button } from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { StateMessage } from "../../../components/ui/StateMessage";
import { useAuthStore } from "../../../lib/stores/authStore";
import pathwaysArt from "../../../assets/images/dashboard/pathways-art.png";
import stepsArt from "../../../assets/images/dashboard/steps-art.png";
import { dashboardGreeting } from "../dashboard.utils";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { CurrentProjectsCard } from "./CurrentProjectsCard";
import { CurrentProgressCard } from "./CurrentProgressCard";
import { StatCard } from "./StatCard";
import { TodaysGoalsCard } from "./TodaysGoalsCard";

/** The signed-in home screen. Sections are added one at a time. */
export function DashboardPage() {
  const { state, retry } = useDashboardSummary();
  const name = useAuthStore((auth) => auth.user?.fullName ?? auth.user?.name);

  if (state.kind === "error") {
    return (
      <StateMessage
        kind="error"
        title="We couldn’t load your dashboard"
        body="Your progress is safe. Check your connection and try again."
        action={
          <Button isPrimary={false} onClick={retry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (state.kind !== "ready") {
    return (
      <div role="status" aria-label="Loading your dashboard" className="flex flex-col gap-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  const { summary } = state;
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 ease-out motion-reduce:animate-none">
      <h1 className="font-display text-4xl font-medium text-ink">
        {dashboardGreeting(name, summary.hasActivePathway)}
      </h1>
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
        <CurrentProgressCard summary={summary} />
        <StatCard title="Pathways" value={summary.pathwaysCount} art={pathwaysArt} tone="yellow" />
        <StatCard title="Steps Completed" value={summary.completedSteps} art={stepsArt} tone="pink" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <TodaysGoalsCard summary={summary} />
        <CurrentProjectsCard />
      </div>
    </div>
  );
}
