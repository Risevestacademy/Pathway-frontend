import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { QuizQuestionDto } from "../../lib/api/pathwayQuiz.api";
import { QuizQuestionScreen } from "./QuizQuestionScreen";

afterEach(cleanup);

const question = (id: string): QuizQuestionDto => ({
  id,
  prompt: `Prompt ${id}`,
  options: [
    { id: `${id}-a`, text: `${id} option A` },
    { id: `${id}-b`, text: `${id} option B` },
  ],
});
const questions = [question("q1"), question("q2"), question("q3")];

function renderScreen(overrides: Partial<Parameters<typeof QuizQuestionScreen>[0]> = {}) {
  const onSubmit = vi.fn();
  const onExit = vi.fn();
  render(
    <QuizQuestionScreen
      stageTitle="Foundations"
      questions={questions}
      onSubmit={onSubmit}
      onExit={onExit}
      isSubmitting={false}
      {...overrides}
    />,
  );
  return { onSubmit, onExit };
}

const choose = (text: string) => userEvent.click(screen.getByRole("radio", { name: text }));
const next = () => userEvent.click(screen.getByRole("button", { name: "Next question" }));
const skip = () => userEvent.click(screen.getByRole("button", { name: "Skip this question" }));
const heading = (text: string) => screen.getByRole("heading", { level: 1, name: text });

describe("QuizQuestionScreen", () => {
  it("shows the first question with its options, none chosen", () => {
    renderScreen();

    expect(screen.getByText("Foundations · Stage quiz")).toBeTruthy();
    expect(heading("Question 1 of 3")).toBeTruthy();
    expect(screen.getByText("Prompt q1")).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect((screen.getByRole("radio", { name: "q1 option A" }) as HTMLInputElement).checked).toBe(false);
  });

  it("says answers are a self-check that don't affect progress", () => {
    renderScreen();

    expect(
      screen.getByText("Self-check only. Your answers are not marked by a person and do not affect your progress."),
    ).toBeTruthy();
  });

  it("can't go on until an option is chosen", async () => {
    renderScreen();
    const nextButton = screen.getByRole("button", { name: "Next question" }) as HTMLButtonElement;
    expect(nextButton.disabled).toBe(true);

    await choose("q1 option A");

    expect(nextButton.disabled).toBe(false);
  });

  it("moves to the next question", async () => {
    renderScreen();

    await choose("q1 option A");
    await next();

    expect(heading("Question 2 of 3")).toBeTruthy();
    expect(screen.getByText("Prompt q2")).toBeTruthy();
  });

  it("goes back with the earlier choice still picked", async () => {
    renderScreen();
    await choose("q1 option B");
    await next();

    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(heading("Question 1 of 3")).toBeTruthy();
    expect((screen.getByRole("radio", { name: "q1 option B" }) as HTMLInputElement).checked).toBe(true);
  });

  it("can't go back from the first question", () => {
    renderScreen();

    expect((screen.getByRole("button", { name: "Back" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("skips a question without an answer", async () => {
    renderScreen();

    await skip();

    expect(heading("Question 2 of 3")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Next question" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("finishes on the last question, sending the answered ones in order and leaving out the skipped", async () => {
    const { onSubmit } = renderScreen();
    await choose("q1 option A");
    await next();
    await skip();
    await choose("q3 option B");

    await userEvent.click(screen.getByRole("button", { name: "Finish quiz" }));

    expect(onSubmit).toHaveBeenCalledWith([
      { questionId: "q1", optionId: "q1-a" },
      { questionId: "q3", optionId: "q3-b" },
    ]);
  });

  it("finishes from 'Skip this question' on the last question when something was answered", async () => {
    const { onSubmit } = renderScreen();
    await choose("q1 option A");
    await next();
    await skip();

    await skip();

    expect(onSubmit).toHaveBeenCalledWith([{ questionId: "q1", optionId: "q1-a" }]);
  });

  it("leaves out the last question's own answer when it is skipped", async () => {
    const { onSubmit } = renderScreen();
    await choose("q1 option A");
    await next();
    await skip();
    await choose("q3 option B");

    await skip();

    expect(onSubmit).toHaveBeenCalledWith([{ questionId: "q1", optionId: "q1-a" }]);
  });

  it("doesn't offer to skip the last question when only its own answer exists, since nothing else would be sent", async () => {
    renderScreen();
    await skip();
    await skip();

    await choose("q3 option A");

    expect(screen.queryByRole("button", { name: "Skip this question" })).toBeNull();
  });

  it("doesn't offer to skip the last question when nothing has been answered, since there would be nothing to submit", async () => {
    renderScreen();
    await skip();
    await skip();

    expect(heading("Question 3 of 3")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Skip this question" })).toBeNull();
  });

  it("leaves the quiz from Exit quiz", async () => {
    const { onExit } = renderScreen();

    await userEvent.click(screen.getByRole("button", { name: "Exit quiz" }));

    expect(onExit).toHaveBeenCalledOnce();
  });

  it("shows it is saving, and stops further clicks, while submitting", () => {
    renderScreen({ questions: [question("q1")], isSubmitting: true });

    const finish = screen.getByRole("button", { name: "Submitting" }) as HTMLButtonElement;
    expect(finish.disabled).toBe(true);
    expect((screen.getByRole("radio", { name: "q1 option A" }) as HTMLInputElement).disabled).toBe(true);
  });

  it("shows why the quiz couldn't be sent", () => {
    renderScreen({ errorMessage: "We couldn't send your answers." });

    expect(screen.getByRole("alert").textContent).toContain("We couldn't send your answers.");
  });
});
