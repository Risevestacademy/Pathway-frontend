import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { renderWithRouter } from "../../test/renderWithRouter";
import { StageQuizCard } from "./StageQuizCard";

let hasQuiz = true;
vi.mock("./useStageHasQuiz", () => ({ useStageHasQuiz: () => hasQuiz }));

afterEach(() => {
  cleanup();
  hasQuiz = true;
});

const card = (complete: boolean) =>
  renderWithRouter(() => (
    <StageQuizCard careerId="c1" stageId="g1" stageTitle="Foundations" complete={complete} />
  ));

describe("StageQuizCard", () => {
  it("links to that stage's quiz, whether or not the stage is complete", async () => {
    await card(true);
    expect(screen.getByRole("link", { name: "Take the Foundations quiz" }).getAttribute("href")).toBe(
      "/my-pathway/c1/quiz/g1",
    );
    cleanup();

    await card(false);
    expect(screen.getByRole("link", { name: "Take the Foundations quiz" }).getAttribute("href")).toBe(
      "/my-pathway/c1/quiz/g1",
    );
  });

  it("shows nothing for a stage that has no quiz, rather than a link to a page saying so", async () => {
    hasQuiz = false;

    await card(true);

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  describe("when every step in the stage is complete", () => {
    it("says so, and offers the quiz as an optional check", async () => {
      await card(true);

      expect(screen.getByRole("heading", { name: "Foundations stage complete" })).toBeTruthy();
      expect(screen.getByText(/It.s optional/)).toBeTruthy();
      expect(screen.getByText(/keep going/)).toBeTruthy();
    });

    it("makes the button the primary action", async () => {
      await card(true);

      expect(screen.getByRole("link", { name: /Take the Foundations quiz/ }).className).toContain("bg-brand-600");
    });
  });

  describe("while steps in the stage are still to do", () => {
    it("offers the quiz anyway, saying it is best taken after the steps", async () => {
      await card(false);

      expect(screen.getByRole("heading", { name: "Foundations quiz" })).toBeTruthy();
      expect(screen.getByText(/Best taken after you finish the steps in this stage, but you can take it now/)).toBeTruthy();
      expect(screen.queryByText(/stage complete/)).toBeNull();
    });

    it("makes the button a quieter, secondary action", async () => {
      await card(false);

      expect(screen.getByRole("link", { name: /Take the Foundations quiz/ }).className).not.toContain("bg-brand-600");
    });
  });
});
