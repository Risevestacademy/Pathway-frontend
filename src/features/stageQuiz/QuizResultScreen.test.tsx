import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { QuizResultDto } from "../../lib/api/pathwayQuiz.api";
import { QuizResultScreen } from "./QuizResultScreen";

vi.mock("../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));

afterEach(cleanup);

const answer = (n: number, isCorrect: boolean) => ({
  questionId: `a${n}`,
  prompt: `Prompt ${n}`,
  selectedOptionId: `o${n}`,
  selectedOptionText: `Chosen ${n}`,
  correctOptionId: `c${n}`,
  correctOptionText: `Correct ${n}`,
  isCorrect,
});

const result: QuizResultDto = {
  quizId: "q1",
  score: { correct: 2, total: 3 },
  passed: true,
  revisitStepId: "s2",
  breakdown: [answer(1, true), answer(2, false), answer(3, true)],
  submittedAt: "2026-11-23T14:45:47.582Z",
};

function renderScreen(overrides: Partial<Parameters<typeof QuizResultScreen>[0]> = {}) {
  const onRetake = vi.fn();
  const onContinue = vi.fn();
  const onOpenStep = vi.fn();
  render(
    <QuizResultScreen
      careerId="c1"
      stageTitle="Foundations"
      result={result}
      nextStage={{ id: "g2", title: "Core Skills" }}
      revisit={{ step: { id: "s2", title: "How people think", order: 2 }, missedPrompt: "Prompt 2" }}
      onRetake={onRetake}
      onContinue={onContinue}
      onOpenStep={onOpenStep}
      {...overrides}
    />,
  );
  return { onRetake, onContinue, onOpenStep };
}

describe("QuizResultScreen", () => {
  it("shows the score, and says it is only a self-check", () => {
    renderScreen();

    expect(screen.getByText("Foundations · Stage quiz")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: "Your Result" })).toBeTruthy();
    expect(screen.getByText("2 of 3")).toBeTruthy();
    expect(screen.getByText("Self-check")).toBeTruthy();
    expect(
      screen.getByText("This is a self-check. It does not change your progress, and nothing is locked or unlocked."),
    ).toBeTruthy();
  });

  it("shows the XP this attempt earned, when it earned some", () => {
    renderScreen({ xpAwarded: 20 });

    expect(screen.getByText("+20 XP")).toBeTruthy();
  });

  it.each([[0], [undefined]])("shows no XP badge when the XP is %s, as on a retake or a later visit", (xpAwarded) => {
    renderScreen({ xpAwarded });

    expect(screen.queryByText(/XP/)).toBeNull();
  });

  it("lists every question, marking each right or wrong", () => {
    renderScreen();

    const items = within(screen.getByRole("list", { name: "Your answers" })).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText("Question 1")).toBeTruthy();
    expect(within(items[0]).getByText("Prompt 1")).toBeTruthy();
    expect(within(items[0]).getByText("Right")).toBeTruthy();
    expect(within(items[1]).getByText("Wrong")).toBeTruthy();
  });

  it("shows what was chosen and what was right only for the questions they got wrong", () => {
    renderScreen();

    const items = within(screen.getByRole("list", { name: "Your answers" })).getAllByRole("listitem");
    expect(within(items[1]).getByText("Your answer: Chosen 2")).toBeTruthy();
    expect(within(items[1]).getByText("Correct answer: Correct 2")).toBeTruthy();
    expect(within(items[0]).queryByText(/Your answer/)).toBeNull();
  });

  it("offers to retake the quiz and to move on to the next stage", async () => {
    const { onRetake, onContinue } = renderScreen();
    expect(
      screen.getByText(
        "Move on to Core Skills, or retake the quiz after revisiting the step above. We show your latest score.",
      ),
    ).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Retake quiz" }));
    await userEvent.click(screen.getByRole("button", { name: "Continue to Core Skills" }));

    expect(onRetake).toHaveBeenCalledOnce();
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("only offers a retake after the last stage, since nothing comes next", () => {
    renderScreen({ nextStage: null, revisit: null });

    expect(screen.getByText("You can retake the quiz any time. We show your latest score.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Continue to/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Retake quiz" })).toBeTruthy();
  });

  it("points at the step worth revisiting, and what was missed there", async () => {
    const { onOpenStep } = renderScreen();

    const card = screen.getByRole("region", { name: "Worth revisiting" });
    expect(within(card).getByText("Step 2 · How people think")).toBeTruthy();
    expect(within(card).getByText("You missed: Prompt 2")).toBeTruthy();

    await userEvent.click(within(card).getByRole("button", { name: "Open Step" }));

    expect(onOpenStep).toHaveBeenCalledWith("s2");
  });

  it("names the step without a missed question when none can be singled out", () => {
    renderScreen({ revisit: { step: { id: "s2", title: "How people think", order: 2 }, missedPrompt: null } });

    const card = screen.getByRole("region", { name: "Worth revisiting" });
    expect(within(card).getByText("Step 2 · How people think")).toBeTruthy();
    expect(within(card).queryByText(/You missed/)).toBeNull();
  });

  it("leaves out 'Worth revisiting' when there is nothing to revisit", () => {
    renderScreen({ revisit: null });

    expect(screen.queryByRole("region", { name: "Worth revisiting" })).toBeNull();
    expect(screen.getByText(/or retake the quiz any time/)).toBeTruthy();
  });

  it("goes back to the resources", () => {
    renderScreen();

    expect(screen.getByRole("link", { name: "Back to resources" }).getAttribute("href")).toBe(
      "/my-pathway/$careerId/resources",
    );
  });
});
