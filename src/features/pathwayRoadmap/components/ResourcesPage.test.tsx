import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PathwayResourcesState } from "../hooks/usePathwayResources";
import { ResourcesPage } from "./ResourcesPage";

const usePathwayResources = vi.fn();
const usePathwayStages = vi.fn();

vi.mock("../../stageQuiz/usePathwayStages", () => ({
  usePathwayStages: (careerId: string) => usePathwayStages(careerId),
}));

vi.mock("../hooks/usePathwayResources", () => ({
  usePathwayResources: (careerId: string) => usePathwayResources(careerId),
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("./ResourcesScreen", () => ({
  ResourcesScreen: ({
    careerTitle,
    groups,
    stages,
    stagesFailed,
    onRetryStages,
  }: {
    careerTitle: string;
    groups: unknown[];
    stages?: unknown[];
    stagesFailed?: boolean;
    onRetryStages?: () => void;
  }) => (
    <>
      <p>{`${careerTitle}: ${groups.length} groups, ${stages?.length ?? "no"} stages${stagesFailed ? ", stages failed" : ""}`}</p>
      <button type="button" onClick={onRetryStages}>
        retry stages
      </button>
    </>
  ),
}));

beforeEach(() => {
  usePathwayStages.mockReturnValue({ stages: [], failed: false, retry: vi.fn() });
});
afterEach(() => {
  cleanup();
  usePathwayResources.mockReset();
  usePathwayStages.mockReset();
});

const have = (state: PathwayResourcesState, retry = vi.fn()) => {
  usePathwayResources.mockReturnValue({ state, retry });
  return retry;
};

describe("ResourcesPage", () => {
  it("asks for the career it is given", () => {
    have({ kind: "loading" });

    render(<ResourcesPage careerId="c1" />);

    expect(usePathwayResources).toHaveBeenCalledWith("c1");
  });

  it("says it is loading, with a way back", () => {
    have({ kind: "loading" });

    render(<ResourcesPage careerId="c1" />);

    expect(screen.getByRole("status").textContent).toContain("Loading the resources");
    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });

  it("offers a retry when the resources can't be loaded", () => {
    const retry = have({ kind: "error" });

    render(<ResourcesPage careerId="c1" />);

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load these resources");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });

  it("says so when the career has no roadmap yet", () => {
    have({ kind: "unavailable" });

    render(<ResourcesPage careerId="c1" />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back" })).toBeTruthy();
  });

  it("shows the career's resources once loaded", () => {
    have({
      kind: "ready",
      careerTitle: "Product Designer",
      stepCount: 2,
      groups: [{ stepId: "s1", number: 1, title: "Step 1", resources: [], paid: [] }],
      statuses: null,
      progress: null,
    });

    render(<ResourcesPage careerId="c1" />);

    expect(screen.getByText("Product Designer: 1 groups, 0 stages")).toBeTruthy();
  });

  it("gives the screen the career's stages, for the optional quiz", () => {
    usePathwayStages.mockReturnValue({
      stages: [{ id: "g1", title: "Foundations", stepIds: ["s1"] }],
      failed: false,
      retry: vi.fn(),
    });
    have({
      kind: "ready",
      careerTitle: "Product Designer",
      stepCount: 2,
      groups: [{ stepId: "s1", number: 1, title: "Step 1", resources: [], paid: [] }],
      statuses: null,
      progress: null,
    });

    render(<ResourcesPage careerId="c1" />);

    expect(usePathwayStages).toHaveBeenCalledWith("c1");
    expect(screen.getByText("Product Designer: 1 groups, 1 stages")).toBeTruthy();
  });

  it("tells the screen when the stages could not be loaded, and lets it retry them", () => {
    const retry = vi.fn();
    usePathwayStages.mockReturnValue({ stages: [], failed: true, retry });
    have({
      kind: "ready",
      careerTitle: "Product Designer",
      stepCount: 2,
      groups: [{ stepId: "s1", number: 1, title: "Step 1", resources: [], paid: [] }],
      statuses: null,
      progress: null,
    });

    render(<ResourcesPage careerId="c1" />);

    expect(screen.getByText("Product Designer: 1 groups, 0 stages, stages failed")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "retry stages" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
