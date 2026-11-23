import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { renderWithRouter } from "../../test/renderWithRouter";
import { StageQuizCard } from "./StageQuizCard";

afterEach(cleanup);

describe("StageQuizCard", () => {
  it("says the stage is complete and offers its quiz, which is optional", async () => {
    await renderWithRouter(() => <StageQuizCard careerId="c1" stageId="g1" stageTitle="Foundations" />);

    expect(screen.getByRole("heading", { name: "Foundations stage complete" })).toBeTruthy();
    expect(screen.getByText(/It.s optional/)).toBeTruthy();
    expect(screen.getByText(/keep going/)).toBeTruthy();
  });

  it("links to that stage's quiz", async () => {
    await renderWithRouter(() => <StageQuizCard careerId="c1" stageId="g1" stageTitle="Foundations" />);

    const link = screen.getByRole("link", { name: "Take the Foundations quiz" });
    expect(link.getAttribute("href")).toBe("/my-pathway/c1/quiz/g1");
  });
});
