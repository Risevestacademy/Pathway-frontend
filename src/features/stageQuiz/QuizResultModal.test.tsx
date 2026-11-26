import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizResultModal } from "./QuizResultModal";

afterEach(cleanup);

function renderModal(overrides: Partial<Parameters<typeof QuizResultModal>[0]> = {}) {
  const onOpenChange = vi.fn();
  const onSeeAnswers = vi.fn();
  const onContinue = vi.fn();
  render(
    <QuizResultModal
      open
      onOpenChange={onOpenChange}
      stageTitle="Foundations"
      score={{ correct: 5, total: 5 }}
      xpAwarded={20}
      streak={{ current: 3, longest: 7 }}
      hasRevisit={false}
      canContinue
      onSeeAnswers={onSeeAnswers}
      onContinue={onContinue}
      {...overrides}
    />,
  );
  return { onOpenChange, onSeeAnswers, onContinue };
}

describe("QuizResultModal", () => {
  it("celebrates full marks when every question was right", () => {
    renderModal({ score: { correct: 5, total: 5 } });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Foundations quiz done")).toBeTruthy();
    expect(within(dialog).getByRole("heading", { name: "Full marks!" })).toBeTruthy();
    expect(within(dialog).getByText("You got every question right.")).toBeTruthy();
  });

  it("says nice work from 70% up, and points at a step to revisit when there is one", () => {
    renderModal({ score: { correct: 4, total: 5 }, hasRevisit: true });

    expect(screen.getByRole("heading", { name: "Nice work!" })).toBeTruthy();
    expect(
      screen.getByText("You got 4 of 5 right. One step is worth another look before you move on."),
    ).toBeTruthy();
  });

  it("leaves out the revisit sentence when there is no step to revisit", () => {
    renderModal({ score: { correct: 4, total: 5 }, hasRevisit: false });

    expect(screen.getByText("You got 4 of 5 right.")).toBeTruthy();
  });

  it("calls anything lower a good start, and says it can be retaken", () => {
    renderModal({ score: { correct: 2, total: 5 } });

    expect(screen.getByRole("heading", { name: "Good start!" })).toBeTruthy();
    expect(
      screen.getByText("You finished the quiz. A few steps are worth another look, and you can retake it any time."),
    ).toBeTruthy();
  });

  it("shows the score, the XP earned, and that it is a self-check", () => {
    renderModal({ score: { correct: 4, total: 5 }, xpAwarded: 20 });

    expect(screen.getByText("4 of 5")).toBeTruthy();
    expect(screen.getByText("+20 XP")).toBeTruthy();
    expect(screen.getByText("Self-check")).toBeTruthy();
  });

  it("shows no XP chip when nothing was earned, as on a retake", () => {
    renderModal({ xpAwarded: 0 });

    expect(screen.queryByText(/XP/)).toBeNull();
  });

  it("shows the streak", () => {
    renderModal({ streak: { current: 3, longest: 7 } });

    expect(screen.getByText("3-day streak")).toBeTruthy();
    expect(screen.getByText("Come back tomorrow to keep it going.")).toBeTruthy();
  });

  it("shows no streak when there isn't one", () => {
    renderModal({ streak: { current: 0, longest: 7 } });

    expect(screen.queryByText(/streak/)).toBeNull();
  });

  it("takes them to their answers", async () => {
    const { onSeeAnswers, onContinue } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: "See my answers" }));

    expect(onSeeAnswers).toHaveBeenCalledOnce();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it("takes them on to the next step", async () => {
    const { onContinue } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: "Continue to next step" }));

    expect(onContinue).toHaveBeenCalledOnce();
  });

  it("doesn't offer a next step when there isn't one", () => {
    renderModal({ canContinue: false });

    expect(screen.queryByRole("button", { name: "Continue to next step" })).toBeNull();
    expect(screen.getByRole("button", { name: "See my answers" })).toBeTruthy();
  });

  it("closes from the close button", async () => {
    const { onOpenChange } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows nothing while closed", () => {
    renderModal({ open: false });

    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
