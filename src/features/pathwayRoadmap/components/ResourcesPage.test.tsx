import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PathwayResourcesState } from "../hooks/usePathwayResources";
import { ResourcesPage } from "./ResourcesPage";

const usePathwayResources = vi.fn();

vi.mock("../hooks/usePathwayResources", () => ({
  usePathwayResources: (careerId: string) => usePathwayResources(careerId),
}));
vi.mock("../../skillCheck/components/BackLink", () => ({
  BackLink: ({ label = "Back" }: { label?: string }) => <button type="button">{label}</button>,
}));
vi.mock("./ResourcesScreen", () => ({
  ResourcesScreen: ({ careerTitle, groups }: { careerTitle: string; groups: unknown[] }) => (
    <p>{`${careerTitle}: ${groups.length} groups`}</p>
  ),
}));

afterEach(() => {
  cleanup();
  usePathwayResources.mockReset();
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
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
  });

  it("offers a retry when the resources can't be loaded", () => {
    const retry = have({ kind: "error" });

    render(<ResourcesPage careerId="c1" />);

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load these resources");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
  });

  it("says so when the career has no roadmap yet", () => {
    have({ kind: "unavailable" });

    render(<ResourcesPage careerId="c1" />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
  });

  it("shows the career's resources once loaded", () => {
    have({
      kind: "ready",
      careerTitle: "Product Designer",
      stepCount: 2,
      groups: [{ stepId: "s1", number: 1, title: "Step 1", resources: [] }],
      statuses: null,
    });

    render(<ResourcesPage careerId="c1" />);

    expect(screen.getByText("Product Designer: 1 groups")).toBeTruthy();
  });
});
