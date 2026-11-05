import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { CareerProgress } from "../../progress/progress.types";
import { CareerProgressPill } from "./CareerProgressPill";

const useCareerProgress = vi.fn();

vi.mock("../../progress/hooks/useCareerProgress", () => ({
  useCareerProgress: (careerId: string) => useCareerProgress(careerId),
}));

afterEach(() => {
  cleanup();
  useCareerProgress.mockReset();
});

const have = (progress: CareerProgress) => useCareerProgress.mockReturnValue({ progress, retry: vi.fn() });

describe("CareerProgressPill", () => {
  it("asks about the career it is given", () => {
    have({ kind: "loading" });

    render(<CareerProgressPill careerId="c1" />);

    expect(useCareerProgress).toHaveBeenCalledWith("c1");
  });

  it("shows how far they are when this is their active pathway", () => {
    have({
      kind: "active",
      progress: {
        completed: 1,
        total: 16,
        percentage: 6,
        nextStepId: "s2",
        selfReported: true,
        startStepId: null,
      },
      statuses: {},
    });

    render(<CareerProgressPill careerId="c1" />);

    expect(screen.getByText("1 of 16 steps")).toBeTruthy();
    expect(screen.getByText("6%")).toBeTruthy();
  });

  it.each<[string, CareerProgress]>([
    ["not saved yet", { kind: "untracked", activeCareerTitle: null }],
    [
      "saved but not the active one, whose progress it must not show as this career's",
      { kind: "inactive", counts: { completed: 2, total: 5, percentage: 40 }, activeCareerTitle: "UX" },
    ],
    ["signed out", { kind: "signed-out" }],
    ["still loading", { kind: "loading" }],
    ["failed to load", { kind: "error" }],
  ])("shows nothing when it is %s", (_label, progress) => {
    have(progress);

    const { container } = render(<CareerProgressPill careerId="c1" />);

    expect(container.firstChild).toBeNull();
  });
});
