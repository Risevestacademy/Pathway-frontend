import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { UpNextCard, type UpNextCardProps } from "./UpNextCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

afterEach(cleanup);

const card = (over: Partial<UpNextCardProps> = {}) =>
  render(
    <UpNextCard
      careerId="career-1"
      step={{ id: "step-1", number: 1, title: "What design is for", resourceCount: 1 }}
      started={false}
      {...over}
    />,
  );

describe("UpNextCard", () => {
  it("says it is the step to do next", () => {
    card();

    expect(screen.getByText("Up next")).toBeTruthy();
  });

  it("names the step with its number", () => {
    card();

    expect(
      screen.getByRole("heading", { level: 2, name: "Step 1 · What design is for" }),
    ).toBeTruthy();
  });

  it("is a section named after the step", () => {
    card();

    expect(screen.getByRole("region", { name: "Step 1 · What design is for" })).toBeTruthy();
  });

  it.each([
    [1, "1 resource"],
    [3, "3 resources"],
  ])("counts the step's resources (%i)", (resourceCount, text) => {
    card({ step: { id: "s", number: 2, title: "Core skills", resourceCount } });

    expect(screen.getByText(text)).toBeTruthy();
  });

  it("says nothing about resources when the step has none", () => {
    card({ step: { id: "s", number: 2, title: "Core skills", resourceCount: 0 } });

    expect(screen.queryByText(/resource/)).toBeNull();
  });

  it("offers to start the step when nothing has been done yet", () => {
    card({ started: false });

    const link = screen.getByRole("link", { name: "Start step 1" });
    expect(link.getAttribute("href")).toBe("/careers/$careerId/roadmap/$stepId");
  });

  it("offers to continue the step once they have started", () => {
    card({ started: true, step: { id: "s", number: 4, title: "Career readiness", resourceCount: 2 } });

    expect(screen.getByRole("link", { name: "Continue step 4" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Start step/ })).toBeNull();
  });
});
