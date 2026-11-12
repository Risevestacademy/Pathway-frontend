import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { CareerProgress } from "../../progress/progress.types";
import { BeginRoadmapLink } from "./BeginRoadmapLink";

const useCareerProgress = vi.fn();

vi.mock("../../progress/hooks/useCareerProgress", () => ({
  useCareerProgress: (careerId: string) => useCareerProgress(careerId),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
}));

afterEach(() => {
  cleanup();
  useCareerProgress.mockReset();
});

const have = (progress: CareerProgress) => useCareerProgress.mockReturnValue({ progress, retry: vi.fn() });

const active: CareerProgress = {
  kind: "active",
  progress: {
    completed: 1,
    total: 3,
    percentage: 33,
    nextStepId: "s2",
    selfReported: true,
    startStepId: null,
  },
  statuses: {},
};

describe("BeginRoadmapLink", () => {
  it("says the roadmap is coming soon when the career has none", () => {
    have({ kind: "untracked", activeCareerTitle: null });

    render(<BeginRoadmapLink careerId="c1" hasRoadmap={false} />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("asks about this career's progress", () => {
    have(active);

    render(<BeginRoadmapLink careerId="c1" hasRoadmap />);

    expect(useCareerProgress).toHaveBeenCalledWith("c1");
  });

  it("opens My Pathway, where their active pathway is, when this career is their active one", () => {
    have(active);

    render(<BeginRoadmapLink careerId="c1" hasRoadmap />);

    expect(screen.getByRole("link", { name: /Begin roadmap/ }).getAttribute("href")).toBe("/my-pathway");
  });

  it.each<[string, CareerProgress]>([
    ["not saved yet", { kind: "untracked", activeCareerTitle: null }],
    ["saved but another is active", { kind: "inactive", counts: { completed: 1, total: 3, percentage: 33 }, activeCareerTitle: "UX" }],
    ["signed out", { kind: "signed-out" }],
    ["still loading", { kind: "loading" }],
    ["progress failed to load", { kind: "error" }],
  ])("opens this career's pathway overview when it is %s", (_label, progress) => {
    have(progress);

    render(<BeginRoadmapLink careerId="c1" hasRoadmap />);

    expect(screen.getByRole("link", { name: /Begin roadmap/ }).getAttribute("href")).toBe(
      "/my-pathway/c1/overview",
    );
  });
});
