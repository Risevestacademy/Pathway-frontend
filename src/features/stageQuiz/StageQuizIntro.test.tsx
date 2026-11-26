import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StageQuizIntro } from "./StageQuizIntro";

vi.mock("../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));

afterEach(cleanup);

const steps = [
  { id: "s1", title: "What design is for", order: 1 },
  { id: "s2", title: "How people think", order: 2 },
];

function renderIntro(overrides: Partial<Parameters<typeof StageQuizIntro>[0]> = {}) {
  const onStart = vi.fn();
  const onSkip = vi.fn();
  render(
    <StageQuizIntro
      careerId="c1"
      stageTitle="Foundations"
      steps={steps}
      questionCount={5}
      onStart={onStart}
      onSkip={onSkip}
      {...overrides}
    />,
  );
  return { onStart, onSkip };
}

describe("StageQuizIntro", () => {
  it("names the stage and says how many questions there are", () => {
    renderIntro();

    expect(screen.getByRole("heading", { level: 1, name: "Foundations Quiz" })).toBeTruthy();
    expect(screen.getByText("Foundations · Stage quiz")).toBeTruthy();
    expect(screen.getByText("5 questions")).toBeTruthy();
    expect(screen.getByText("One question at a time")).toBeTruthy();
  });

  it("doesn't promise how long it takes, which the backend doesn't say", () => {
    renderIntro();

    expect(screen.queryByText(/minutes/i)).toBeNull();
  });

  it("says 1 question, not 1 questions", () => {
    renderIntro({ questionCount: 1 });

    expect(screen.getByText("1 question")).toBeTruthy();
  });

  it("lists the steps it covers, in order", () => {
    renderIntro();

    const covers = screen.getByRole("list", { name: "What it covers" });
    const items = within(covers).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "1Step 1 · What design is for",
      "2Step 2 · How people think",
    ]);
  });

  it("leaves out what it covers when the stage has no steps", () => {
    renderIntro({ steps: [] });

    expect(screen.queryByText("What it covers")).toBeNull();
  });

  it("explains how it works: a self-check that changes nothing, can be skipped and retaken", () => {
    renderIntro();

    const how = screen.getByRole("list", { name: "How it works" });
    expect(within(how).getAllByRole("listitem")).toHaveLength(4);
    expect(within(how).getByText("It is a self-check, not a certificate.")).toBeTruthy();
    expect(within(how).getByText("You can skip it and keep going.")).toBeTruthy();
  });

  it("starts the quiz", async () => {
    const { onStart, onSkip } = renderIntro();

    await userEvent.click(screen.getByRole("button", { name: "Start quiz" }));

    expect(onStart).toHaveBeenCalledOnce();
    expect(onSkip).not.toHaveBeenCalled();
  });

  it("skips it for now", async () => {
    const { onStart, onSkip } = renderIntro();

    await userEvent.click(screen.getByRole("button", { name: "Skip for now" }));

    expect(onSkip).toHaveBeenCalledOnce();
    expect(onStart).not.toHaveBeenCalled();
  });

  it("goes back to the resources", () => {
    renderIntro();

    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe(
      "/my-pathway/$careerId/resources",
    );
  });
});
