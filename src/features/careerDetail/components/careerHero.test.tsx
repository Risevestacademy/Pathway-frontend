import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Career } from "@/types/career.types";
import { CareerHero } from "./careerHero";

afterEach(cleanup);

const career = {
  id: "backend-developer",
  status: "published",
  title: "Backend Developer",
  description: "Build the logic behind apps.",
  levels: ["university-student"],
  tags: [],
  roleSummary: "Design services.",
  workActivities: [],
  entryConsiderations: [],
  roadmapId: null,
  stats: [],
} satisfies Career;

const stats = { topics: 113, projects: 30, progress: 0 };

describe("CareerHero", () => {
  it("shows the title, description and stats", () => {
    render(
      <CareerHero career={career} icon={null} isActive={false} forStudents={false} stats={stats} />,
    );
    expect(screen.getByRole("heading", { name: "Backend Developer" })).toBeTruthy();
    expect(screen.getByText("Build the logic behind apps.")).toBeTruthy();
    expect(screen.getByText("113")).toBeTruthy();
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("shows the student and active tags only when they apply", () => {
    const { rerender } = render(
      <CareerHero career={career} icon={null} isActive={false} forStudents={false} stats={stats} />,
    );
    expect(screen.queryByText("Active")).toBeNull();
    expect(screen.queryByText("Great for university students")).toBeNull();

    rerender(<CareerHero career={career} icon={null} isActive forStudents stats={stats} />);
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Great for university students")).toBeTruthy();
  });

  it("renders the actions passed in", () => {
    render(
      <CareerHero career={career} icon={null} isActive={false} forStudents={false} stats={stats}>
        <a href="/x">View career</a>
      </CareerHero>,
    );
    expect(screen.getByRole("link", { name: "View career" })).toBeTruthy();
  });
});
