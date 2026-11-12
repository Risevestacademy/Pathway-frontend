import { useNavigate } from "@tanstack/react-router";
import { BackLinkTo } from "../../skillCheck/components/BackLink";
import { useResourceTicks } from "../hooks/useResourceTicks";
import type { PathwayOverview } from "../overview.utils";
import { completedSteps, tickedResources } from "../progressView.utils";
import type { ResourceGroup } from "../resourceGroups.utils";
import { CompletedCard } from "./CompletedCard";
import { EarlierPathwaysCard, type EarlierPathway } from "./EarlierPathwaysCard";
import { OverallProgressCard } from "./OverallProgressCard";
import { OverviewHero } from "./OverviewHero";
import { OverviewTabs } from "./OverviewTabs";
import { PathwayCompleteCard } from "./PathwayCompleteCard";
import { StartStepButton } from "./StartStepButton";
import { UpNextCard } from "./UpNextCard";

/** One career's progress: how far they are, what they have completed, and what comes next. */
export function ProgressScreen({
  careerId,
  careerTitle,
  overview,
  groups,
  activation,
  earlier,
}: {
  careerId: string;
  careerTitle: string;
  overview: PathwayOverview;
  groups: ResourceGroup[];
  /** Set when this career isn't their active pathway yet, so continuing a step must make it active. */
  activation: { activeCareerTitle: string | null } | null;
  /** The pathways they switched away from, which they could switch back to. */
  earlier: EarlierPathway[];
}) {
  const navigate = useNavigate();
  const { isTicked } = useResourceTicks(careerId);
  const { steps, completed, total, started, upNext } = overview;
  const finished = total > 0 && completed >= total;
  const startActivation = activation ? { careerTitle, activeCareerTitle: activation.activeCareerTitle } : undefined;

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway" label="Back" />
      <OverviewHero title={careerTitle} stepCount={steps.length} />
      <OverviewTabs careerId={careerId} current="progress" />

      <p className="rounded-2xl bg-grey-50 px-5 py-4 text-sm text-ink">
        Progress is what you tell us. We do not check that you finished a step.
      </p>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <OverallProgressCard completed={completed} total={total} />
        <div className="flex flex-col gap-6">
          {activation ? (
            <section className="rounded-3xl border border-line bg-surface p-6">
              <h2 className="font-display text-xl font-medium text-ink">
                Completed details unavailable
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Detailed step and resource completion is available when this pathway is active.
              </p>
            </section>
          ) : (
            <CompletedCard
              careerId={careerId}
              steps={completedSteps(steps)}
              resources={tickedResources(groups, isTicked)}
              startWith={
                upNext
                  ? {
                      stepNumber: upNext.number,
                      action: (
                        <StartStepButton
                          careerId={careerId}
                          stepNumber={upNext.number}
                          started={started}
                          activation={startActivation}
                        />
                      ),
                    }
                  : undefined
              }
            />
          )}
          {upNext ? (
            <UpNextCard
              careerId={careerId}
              step={upNext}
              started={started}
              activation={startActivation}
              eyebrow="Next up"
              showResources={false}
            />
          ) : (
            finished && <PathwayCompleteCard total={total} />
          )}
          <EarlierPathwaysCard
            pathways={earlier}
            activeCareerTitle={activation ? activation.activeCareerTitle : careerTitle}
            onSwitched={(switchedCareerId) =>
              void navigate({ to: "/my-pathway/$careerId/progress", params: { careerId: switchedCareerId } })
            }
          />
        </div>
      </div>
    </div>
  );
}
