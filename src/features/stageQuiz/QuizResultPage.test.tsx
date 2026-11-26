import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { QuizResultDto, QuizSubmissionDto } from "../../lib/api/pathwayQuiz.api";
import { queryKeys } from "../../lib/queryKeys";
import { QuizResultPage } from "./QuizResultPage";
import type { QuizResultState } from "./useQuizResult";

const useQuizResult = vi.fn();
const navigate = vi.fn();

vi.mock("./useQuizResult", () => ({
  useQuizResult: (careerId: string, stageId: string) => useQuizResult(careerId, stageId),
}));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock("../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  useQuizResult.mockReset();
  navigate.mockReset();
});

const have = (state: QuizResultState, retry = vi.fn()) => {
  useQuizResult.mockReturnValue({ state, retry });
  return retry;
};

const result: QuizResultDto = {
  quizId: "q1",
  score: { correct: 5, total: 5 },
  passed: true,
  revisitStepId: null,
  breakdown: [
    { questionId: "a1", prompt: "What is design for?", selectedOptionId: "o1", selectedOptionText: "People", correctOptionId: "o1", correctOptionText: "People", isCorrect: true },
  ],
  submittedAt: "2026-11-23T14:45:47.582Z",
};

const ready: QuizResultState = {
  kind: "ready",
  pathwayId: "p1",
  careerTitle: "Designer",
  stage: { id: "g1", title: "Foundations" },
  nextStage: { id: "g2", title: "Core Skills" },
  revisit: null,
  result,
};

const submission: QuizSubmissionDto = {
  ...result,
  xpAwarded: 20,
  nextStepId: "s2",
  streak: { current: 3, longest: 7 },
};

const submissionKey = queryKeys.stageQuiz.submission("c1", "g1");

const renderPage = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <QuizResultPage careerId="c1" stageId="g1" />
    </QueryClientProvider>,
  );

describe("QuizResultPage", () => {
  it("asks for the result of the stage it is given, in its career", () => {
    have({ kind: "loading" });

    renderPage();

    expect(useQuizResult).toHaveBeenCalledWith("c1", "g1");
  });

  it("says it is loading, with a way back to the resources", () => {
    have({ kind: "loading" });

    renderPage();

    expect(screen.getByRole("status").textContent).toContain("Loading your result");
    expect(screen.getByRole("link", { name: "Back to resources" }).getAttribute("href")).toBe(
      "/my-pathway/$careerId/resources",
    );
  });

  it("offers a retry when the result can't be loaded", async () => {
    const retry = have({ kind: "error" });

    renderPage();

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load your result");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("says so when the stage can't be found", () => {
    have({ kind: "unavailable" });

    renderPage();

    expect(screen.getByText("We couldn’t find this quiz")).toBeTruthy();
  });

  it("says the quiz hasn't been taken, and offers to take it", async () => {
    have({ kind: "not-taken" });

    renderPage();

    expect(screen.getByText("You haven’t taken this quiz yet")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Take the quiz" }));
    expect(navigate).toHaveBeenCalledWith({
      to: "/my-pathway/$careerId/quiz/$stageId",
      params: { careerId: "c1", stageId: "g1" },
    });
  });

  it("shows the result, with no celebration and no XP, when they come back to it later", () => {
    have(ready);

    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Your Result" })).toBeTruthy();
    expect(screen.getByText("5 of 5")).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText(/XP/)).toBeNull();
  });

  it("celebrates right after a submit, and shows the XP it earned", () => {
    have(ready);
    queryClient.setQueryData(submissionKey, submission);

    renderPage();

    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Full marks!");
    expect(dialog.textContent).toContain("+20 XP");
    expect(dialog.textContent).toContain("3-day streak");
  });

  it("celebrates only once: the hand-over is used up as soon as the page opens", async () => {
    have(ready);
    queryClient.setQueryData(submissionKey, submission);

    renderPage();

    await waitFor(() => expect(queryClient.getQueryData(submissionKey)).toBeUndefined());
  });

  it("doesn't celebrate over a result that is still loading", () => {
    have({ kind: "loading" });
    queryClient.setQueryData(submissionKey, submission);

    renderPage();

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the celebration to show the answers, keeping the XP on the page", async () => {
    have(ready);
    queryClient.setQueryData(submissionKey, submission);
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "See my answers" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("+20 XP")).toBeTruthy();
  });

  it("continues to the next step from the celebration", async () => {
    have(ready);
    queryClient.setQueryData(submissionKey, submission);
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Continue to next step" }));

    expect(navigate).toHaveBeenCalledWith({
      to: "/my-pathway/$careerId/resources",
      params: { careerId: "c1" },
      search: { step: submission.nextStepId },
    });
  });

  it("offers no next step in the celebration when the backend names none", () => {
    have(ready);
    queryClient.setQueryData(submissionKey, { ...submission, nextStepId: null });

    renderPage();

    expect(screen.queryByRole("button", { name: "Continue to next step" })).toBeNull();
  });

  it("retakes the quiz from the result", async () => {
    have(ready);
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Retake quiz" }));

    expect(navigate).toHaveBeenCalledWith({
      to: "/my-pathway/$careerId/quiz/$stageId",
      params: { careerId: "c1", stageId: "g1" },
    });
  });

  it("moves on to the next stage from the result", async () => {
    have(ready);
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Continue to Core Skills" }));

    expect(navigate).toHaveBeenCalledWith({
      to: "/my-pathway/$careerId/resources",
      params: { careerId: "c1" },
      search: { stage: "g2" },
    });
  });

  it("opens the step worth revisiting", async () => {
    have({
      ...ready,
      revisit: { step: { id: "s2", title: "How people think", order: 2 }, missedPrompt: "Prompt 2" },
    });
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Open Step" }));

    expect(navigate).toHaveBeenCalledWith({
      to: "/my-pathway/$careerId/resources",
      params: { careerId: "c1" },
      search: { step: "s2" },
    });
  });
});
