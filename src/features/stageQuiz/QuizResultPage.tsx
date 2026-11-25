import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { StateMessage } from "../../components/ui/StateMessage";
import type { QuizSubmissionDto } from "../../lib/api/pathwayQuiz.api";
import { queryKeys } from "../../lib/queryKeys";
import { BackLinkTo } from "../skillCheck/components/BackLink";
import { QuizResultModal } from "./QuizResultModal";
import { QuizResultScreen } from "./QuizResultScreen";
import { useQuizResult } from "./useQuizResult";

/** A stage quiz's latest result, celebrated once right after it was sent. */
export function QuizResultPage({ careerId, stageId }: { careerId: string; stageId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state, retry } = useQuizResult(careerId, stageId);

  // What the submit returned (XP, streak) is handed over once. Read it on the first
  // render and clear it, so coming back to this page later doesn't celebrate again.
  const submissionKey = queryKeys.stageQuiz.submission(careerId, stageId);
  const [justSubmitted] = useState<QuizSubmissionDto | null>(
    () => queryClient.getQueryData<QuizSubmissionDto>(submissionKey) ?? null,
  );
  const [celebrating, setCelebrating] = useState(justSubmitted !== null);
  useEffect(() => {
    queryClient.removeQueries({ queryKey: submissionKey, exact: true });
  }, [queryClient, submissionKey]);

  // Opens the resources on the step or stage meant, so it isn't left on the first one.
  const toResources = (search?: { step?: string; stage?: string }) =>
    void navigate({
      to: "/my-pathway/$careerId/resources",
      params: { careerId },
      ...(search && { search }),
    });

  if (state.kind === "ready") {
    return (
      <>
        <QuizResultScreen
          careerId={careerId}
          stageTitle={state.stage.title}
          result={state.result}
          xpAwarded={justSubmitted?.xpAwarded}
          nextStage={state.nextStage}
          revisit={state.revisit}
          onRetake={() =>
            void navigate({
              to: "/my-pathway/$careerId/quiz/$stageId",
              params: { careerId, stageId },
            })
          }
          onContinue={() => toResources(state.nextStage ? { stage: state.nextStage.id } : undefined)}
          onOpenStep={(stepId) => toResources({ step: stepId })}
        />
        {justSubmitted && (
          <QuizResultModal
            open={celebrating}
            onOpenChange={setCelebrating}
            stageTitle={state.stage.title}
            score={justSubmitted.score}
            xpAwarded={justSubmitted.xpAwarded}
            streak={justSubmitted.streak}
            hasRevisit={state.revisit !== null}
            canContinue={justSubmitted.nextStepId !== null}
            onSeeAnswers={() => setCelebrating(false)}
            onContinue={() =>
              toResources(justSubmitted.nextStepId ? { step: justSubmitted.nextStepId } : undefined)
            }
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway/$careerId/resources" params={{ careerId }} label="Back to resources" />
      {state.kind === "loading" && (
        <div role="status" className="flex flex-col gap-6">
          <span className="sr-only">Loading your result</span>
          <Skeleton className="h-24 w-2/3 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      )}
      {state.kind === "error" && (
        <StateMessage
          kind="error"
          title="We couldn’t load your result"
          body="Your answers are safe. Check your connection and try again."
          action={
            <Button isPrimary={false} onClick={retry}>
              Try again
            </Button>
          }
        />
      )}
      {state.kind === "unavailable" && (
        <StateMessage
          kind="empty"
          title="We couldn’t find this quiz"
          body="It may have been removed from this roadmap. Go back to see the current resources."
        />
      )}
      {state.kind === "not-taken" && (
        <StateMessage
          kind="empty"
          title="You haven’t taken this quiz yet"
          body="Take it to see your score and which steps are worth another look."
          action={
            <Button
              onClick={() =>
                void navigate({
                  to: "/my-pathway/$careerId/quiz/$stageId",
                  params: { careerId, stageId },
                })
              }
            >
              Take the quiz
            </Button>
          }
        />
      )}
    </div>
  );
}
