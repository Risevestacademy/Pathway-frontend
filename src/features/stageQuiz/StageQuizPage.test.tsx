import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { QuizDto, QuizSubmissionDto } from "../../lib/api/pathwayQuiz.api";
import { CareerNotSavedError } from "../../lib/api/pathways.api";
import { queryKeys } from "../../lib/queryKeys";
import { StageQuizPage } from "./StageQuizPage";
import type { StageQuizState } from "./useStageQuiz";

const useStageQuiz = vi.fn();
const submitQuiz = vi.fn();
const navigate = vi.fn();

vi.mock("./useStageQuiz", () => ({
  useStageQuiz: (careerId: string, stageId: string) => useStageQuiz(careerId, stageId),
}));
vi.mock("../../lib/api/pathwayQuiz.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api/pathwayQuiz.api")>()),
  submitQuiz: (...args: unknown[]) => submitQuiz(...args),
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
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
});
afterEach(() => {
  cleanup();
  useStageQuiz.mockReset();
  submitQuiz.mockReset();
  navigate.mockReset();
});

const have = (state: StageQuizState, retry = vi.fn()) => {
  useStageQuiz.mockReturnValue({ state, retry });
  return retry;
};

const quiz: QuizDto = {
  id: "q1",
  stageId: "g1",
  questions: [
    { id: "a1", prompt: "Prompt 1", options: [{ id: "a1-x", text: "Option X" }, { id: "a1-y", text: "Option Y" }] },
    { id: "a2", prompt: "Prompt 2", options: [{ id: "a2-x", text: "Option P" }, { id: "a2-y", text: "Option Q" }] },
  ],
};

const ready: StageQuizState = {
  kind: "ready",
  pathwayId: "p1",
  careerTitle: "Designer",
  stage: { id: "g1", title: "Foundations", steps: [{ id: "s1", title: "What design is for", order: 1 }] },
  quiz,
};

const submission: QuizSubmissionDto = {
  quizId: "q1",
  score: { correct: 2, total: 2 },
  passed: true,
  revisitStepId: null,
  breakdown: [],
  submittedAt: "2026-11-23T14:45:47.582Z",
  xpAwarded: 20,
  nextStepId: "s2",
  streak: { current: 1, longest: 1 },
};

const renderPage = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <StageQuizPage careerId="c1" stageId="g1" />
    </QueryClientProvider>,
  );

const start = () => userEvent.click(screen.getByRole("button", { name: "Start quiz" }));
const choose = (text: string) => userEvent.click(screen.getByRole("radio", { name: text }));
const next = () => userEvent.click(screen.getByRole("button", { name: "Next question" }));
const finish = () => userEvent.click(screen.getByRole("button", { name: "Finish quiz" }));

async function answerEverything() {
  await start();
  await choose("Option X");
  await next();
  await choose("Option Q");
}

describe("StageQuizPage", () => {
  it("asks for the quiz of the stage it is given, in its career", () => {
    have({ kind: "loading" });

    renderPage();

    expect(useStageQuiz).toHaveBeenCalledWith("c1", "g1");
  });

  it("says it is loading, with a way back to the resources", () => {
    have({ kind: "loading" });

    renderPage();

    expect(screen.getByRole("status").textContent).toContain("Loading this quiz");
    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe(
      "/my-pathway/$careerId/resources",
    );
  });

  it("offers a retry when the quiz can't be loaded", async () => {
    const retry = have({ kind: "error" });

    renderPage();

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load this quiz");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("says so when the stage can't be found", () => {
    have({ kind: "unavailable" });

    renderPage();

    expect(screen.getByText("We couldn’t find this quiz")).toBeTruthy();
  });

  it("says so when the stage has no quiz", () => {
    have({ kind: "no-quiz" });

    renderPage();

    expect(screen.getByText("This stage has no quiz yet")).toBeTruthy();
  });

  it("opens on the intro, with the stage's steps and the number of questions", () => {
    have(ready);

    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "Foundations Quiz" })).toBeTruthy();
    expect(screen.getByText("2 questions")).toBeTruthy();
    expect(screen.getByText("Step 1 · What design is for")).toBeTruthy();
  });

  it("goes back to the resources when they skip it for now", async () => {
    have(ready);
    renderPage();

    await userEvent.click(screen.getByRole("button", { name: "Skip for now" }));

    expect(navigate).toHaveBeenCalledWith({
      to: "/my-pathway/$careerId/resources",
      params: { careerId: "c1" },
    });
  });

  it("starts on the first question", async () => {
    have(ready);
    renderPage();

    await start();

    expect(screen.getByRole("heading", { level: 1, name: "Question 1 of 2" })).toBeTruthy();
  });

  it("leaves for the resources from Exit quiz", async () => {
    have(ready);
    renderPage();
    await start();

    await userEvent.click(screen.getByRole("button", { name: "Exit quiz" }));

    expect(navigate).toHaveBeenCalledWith({
      to: "/my-pathway/$careerId/resources",
      params: { careerId: "c1" },
    });
  });

  it("sends the answers for this stage's quiz when they finish", async () => {
    have(ready);
    submitQuiz.mockResolvedValue(submission);
    renderPage();
    await answerEverything();

    await finish();

    await waitFor(() =>
      expect(submitQuiz).toHaveBeenCalledWith("p1", "g1", [
        { questionId: "a1", optionId: "a1-x" },
        { questionId: "a2", optionId: "a2-y" },
      ]),
    );
  });

  it("hands what the submit returned to the result page, and goes there", async () => {
    have(ready);
    submitQuiz.mockResolvedValue(submission);
    renderPage();
    await answerEverything();

    await finish();

    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: "/my-pathway/$careerId/quiz/$stageId/result",
        params: { careerId: "c1", stageId: "g1" },
      }),
    );
    expect(queryClient.getQueryData(queryKeys.stageQuiz.submission("c1", "g1"))).toEqual(submission);
  });

  it("marks the old result stale, so the result page shows this attempt", async () => {
    have(ready);
    submitQuiz.mockResolvedValue(submission);
    const resultKey = queryKeys.stageQuiz.result("p1", "g1");
    queryClient.setQueryData(resultKey, { stale: true });
    renderPage();
    await answerEverything();

    await finish();

    await waitFor(() => expect(queryClient.getQueryState(resultKey)?.isInvalidated).toBe(true));
  });

  it("shows it is sending while it waits", async () => {
    have(ready);
    submitQuiz.mockReturnValue(new Promise(() => {}));
    renderPage();
    await answerEverything();

    await finish();

    expect(await screen.findByRole("button", { name: "Submitting" })).toBeTruthy();
  });

  it("stays on the question and says so when the answers couldn't be sent, then lets them try again", async () => {
    have(ready);
    submitQuiz.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(submission);
    renderPage();
    await answerEverything();

    await finish();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "We couldn’t send your answers. Try again.",
    );
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1, name: "Question 2 of 2" })).toBeTruthy();

    await finish();

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(submitQuiz).toHaveBeenCalledTimes(2);
  });

  it("says the pathway has to be saved first when the server answers 409", async () => {
    have(ready);
    submitQuiz.mockRejectedValue(new CareerNotSavedError());
    renderPage();
    await answerEverything();

    await finish();

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Start tracking this pathway to save your quiz.",
    );
  });
});
