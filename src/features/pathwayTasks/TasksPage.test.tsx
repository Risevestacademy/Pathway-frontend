import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TasksPage } from "./TasksPage";
import type { PathwayTasksState } from "./usePathwayTasks";

const usePathwayTasks = vi.fn();

vi.mock("./usePathwayTasks", () => ({
  usePathwayTasks: (careerId: string) => usePathwayTasks(careerId),
}));
vi.mock("../skillCheck/components/BackLink", () => ({
  BackLinkTo: ({ label, to }: { label: string; to: string }) => <a href={to}>{label}</a>,
}));
vi.mock("./TasksScreen", () => ({
  TasksScreen: ({ careerTitle, sections, pathwayId }: { careerTitle: string; sections: unknown[]; pathwayId: string }) => (
    <p>{`${careerTitle}: ${sections.length} stages in ${pathwayId}`}</p>
  ),
}));

afterEach(() => {
  cleanup();
  usePathwayTasks.mockReset();
});

const have = (state: PathwayTasksState, retry = vi.fn()) => {
  usePathwayTasks.mockReturnValue({ state, retry });
  return retry;
};

describe("TasksPage", () => {
  it("asks for the career it is given", () => {
    have({ kind: "loading" });

    render(<TasksPage careerId="c1" />);

    expect(usePathwayTasks).toHaveBeenCalledWith("c1");
  });

  it("says it is loading, with a way back", () => {
    have({ kind: "loading" });

    render(<TasksPage careerId="c1" />);

    expect(screen.getByRole("status").textContent).toContain("Loading the practice tasks");
    expect(screen.getByRole("link", { name: "Back" }).getAttribute("href")).toBe("/my-pathway");
  });

  it("offers a retry when the tasks can't be loaded", () => {
    const retry = have({ kind: "error" });

    render(<TasksPage careerId="c1" />);

    expect(screen.getByRole("alert").textContent).toContain("We couldn’t load the practice tasks");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("says so when the career has no roadmap yet", () => {
    have({ kind: "unavailable" });

    render(<TasksPage careerId="c1" />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
  });

  it("shows the practice tasks once loaded", () => {
    have({
      kind: "ready",
      pathwayId: "p1",
      careerTitle: "Product Designer",
      stepCount: 4,
      sections: [{ id: "g1", title: "Foundations", done: 0, total: 4, steps: [] }],
    });

    render(<TasksPage careerId="c1" />);

    expect(screen.getByText("Product Designer: 1 stages in p1")).toBeTruthy();
  });
});
