import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { CompletedCard } from "./CompletedCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
}));
vi.mock("../../progress/components/StepCompletionButton", () => ({
  default: ({ stepId, status, variant }: { stepId: string; status: string; variant?: string }) => (
    <button type="button" data-variant={variant}>{`undo ${stepId} (${status})`}</button>
  ),
}));

afterEach(cleanup);

const steps = [
  { id: "s5", number: 5, title: "Plan and run user research" },
  { id: "s2", number: 2, title: "How people think" },
];

const resources = [
  { id: "r1", title: "Laws of UX", step: { number: 2, title: "How people think" } },
];

const card = (over: Partial<Parameters<typeof CompletedCard>[0]> = {}) =>
  render(<CompletedCard careerId="c1" steps={steps} resources={resources} {...over} />);

describe("CompletedCard", () => {
  it("is a titled section", () => {
    card();

    expect(screen.getByRole("region", { name: "Completed" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "Completed" })).toBeTruthy();
  });

  it("has a Steps tab and a Resources tab, with Steps showing first", () => {
    card();

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Steps", "Resources"]);
    expect(screen.getByRole("tab", { name: "Steps" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Resources" }).getAttribute("aria-selected")).toBe("false");
  });

  it("lists the steps they marked complete, each with an Undo", () => {
    card();

    const panel = within(screen.getByRole("tabpanel"));
    expect(panel.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Step 5 · Plan and run user researchundo s5 (COMPLETED)",
      "Step 2 · How people thinkundo s2 (COMPLETED)",
    ]);
    expect(panel.getByRole("button", { name: "undo s5 (COMPLETED)" }).getAttribute("data-variant")).toBe("undo");
  });

  it("says so when no step has been marked complete", () => {
    card({ steps: [] });

    expect(screen.getByText("No steps marked complete yet")).toBeTruthy();
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("lists the resources they ticked, saying which step each is in, when Resources is chosen", () => {
    card();

    fireEvent.click(screen.getByRole("tab", { name: "Resources" }));

    expect(screen.getByRole("tab", { name: "Resources" }).getAttribute("aria-selected")).toBe("true");
    const panel = within(screen.getByRole("tabpanel"));
    expect(panel.getByRole("link", { name: "Laws of UX" }).getAttribute("href")).toBe(
      "/my-pathway/c1/resources/r1",
    );
    expect(panel.getByText("Step 2 · How people think")).toBeTruthy();
    expect(panel.queryByRole("button")).toBeNull();
  });

  it("says so when no resource has been ticked", () => {
    card({ resources: [] });

    fireEvent.click(screen.getByRole("tab", { name: "Resources" }));

    expect(screen.getByText("No resources ticked yet")).toBeTruthy();
  });

  it("goes back to the steps when Steps is chosen again", () => {
    card();
    fireEvent.click(screen.getByRole("tab", { name: "Resources" }));

    fireEvent.click(screen.getByRole("tab", { name: "Steps" }));

    expect(screen.getByText("Step 5 · Plan and run user research")).toBeTruthy();
  });
});
