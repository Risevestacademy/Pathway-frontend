import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Career } from "@/types/career.types";
import { DetailHero } from "./DetailHero";

vi.mock("@/components/ui/Button", () => ({
  LinkButton: ({ children }: { children: ReactNode }) => (
    <a href="/careers/frontend-developer/roadmap">{children}</a>
  ),
}));

afterEach(cleanup);

const career = {
  id: "frontend-developer",
  status: "published",
  title: "Frontend Developer",
  description: "Builds interfaces for the web.",
  levels: ["early-career"],
  tags: [],
  roleSummary: "Builds interfaces.",
  workActivities: [],
  entryConsiderations: [],
  stats: [],
} satisfies Omit<Career, "roadmapId"> & { roadmapId?: string | null };

describe("DetailHero", () => {
  it("links to the roadmap when one exists", () => {
    render(<DetailHero career={{ ...career, roadmapId: "rm-frontend" }} />);

    expect(
      screen.getByRole("link", { name: /begin roadmap/i }).getAttribute("href"),
    ).toBe("/careers/frontend-developer/roadmap");
  });

  it("shows text instead of a disabled action without a roadmap", () => {
    render(<DetailHero career={{ ...career, roadmapId: null }} />);

    expect(screen.getByText("Roadmap coming soon")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
