import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { StateMessage } from "../../components/ui/StateMessage";
import { submitQuiz, type QuizAnswerDto } from "../../lib/api/pathwayQuiz.api";
import { CareerNotSavedError } from "../../lib/api/pathways.api";
import { queryKeys } from "../../lib/queryKeys";
import { BackLinkTo } from "../skillCheck/components/BackLink";
import { QuizQuestionScreen } from "./QuizQuestionScreen";
import { StageQuizIntro } from "./StageQuizIntro";
import { useStageQuiz } from "./useStageQuiz";

/** A stage's quiz: the intro, the questions one at a time, and sending the answers. */
export function StageQuizPage({ careerId, stageId }: { careerId: string; stageId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state, retry } = useStageQuiz(careerId, stageId);
  const [started, setStarted] = useState(false);

  const pathwayId = state.kind === "ready" ? state.pathwayId : "";
  const submit = useMutation({
    mutationFn: (answers: QuizAnswerDto[]) => submitQuiz(pathwayId, stageId, answers),
    onSuccess: (submission) => {
      // The result page celebrates with what this submit returned, once.
      queryClient.setQueryData(queryKeys.stageQuiz.submission(careerId, stageId), submission);
      void queryClient.invalidateQueries({ queryKey: queryKeys.stageQuiz.result(pathwayId, stageId) });
      // The stage's quiz status lives on the pathway read.
      void queryClient.invalidateQueries({ queryKey: queryKeys.pathwayDetail(pathwayId) });
      void navigate({
        to: "/my-pathway/$careerId/quiz/$stageId/result",
        params: { careerId, stageId },
      });
    },
  });

  const toResources = () =>
    void navigate({ to: "/my-pathway/$careerId/resources", params: { careerId } });

  if (state.kind === "ready") {
    if (!started) {
      return (
        <StageQuizIntro
          careerId={careerId}
          stageTitle={state.stage.title}
          steps={state.stage.steps}
          questionCount={state.quiz.questions.length}
          onStart={() => setStarted(true)}
          onSkip={toResources}
        />
      );
    }

    return (
      <QuizQuestionScreen
        stageTitle={state.stage.title}
        questions={state.quiz.questions}
        onSubmit={(answers) => submit.mutate(answers)}
        onExit={toResources}
        isSubmitting={submit.isPending}
        errorMessage={
          submit.isError
            ? submit.error instanceof CareerNotSavedError
              ? "Start tracking this pathway to save your quiz."
              : "We couldn’t send your answers. Try again."
            : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLinkTo to="/my-pathway/$careerId/resources" params={{ careerId }} label="Back" />
      {state.kind === "loading" && (
        <div role="status" className="flex flex-col gap-6">
          <span className="sr-only">Loading this quiz</span>
          <Skeleton className="h-24 w-2/3 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      )}
      {state.kind === "error" && (
        <StateMessage
          kind="error"
          title="We couldn’t load this quiz"
          body="Check your connection and try again."
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
      {state.kind === "no-quiz" && (
        <StateMessage
          kind="empty"
          title="This stage has no quiz yet"
          body="Keep going with the steps in this stage. A quiz may be added later."
        />
      )}
    </div>
  );
}
