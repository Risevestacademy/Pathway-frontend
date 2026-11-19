import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import { renderWithRouter } from "../../../test/renderWithRouter";
import type { DashboardCurrentProjectDto } from "../../../lib/api/dashboard.api";
import { CurrentProjectsCard } from "./CurrentProjectsCard";

afterEach(cleanup);

const project: DashboardCurrentProjectDto = {
  stageId: "st1",
  stageTitle: "Build a landing page",
  stageDescription: "Put the basics together in one small site.",
  stageOrder: 2,
  completed: 1,
  total: 3,
  percentage: 33,
  skills: ["HTML", "CSS"],
  steps: [
    { id: "s3", title: "Deploy it", order: 3, status: "NOT_STARTED" },
    { id: "s1", title: "Write the markup", order: 1, status: "COMPLETED" },
    { id: "s2", title: "Style the page", order: 2, status: "IN_PROGRESS" },
  ],
};

describe("CurrentProjectsCard", () => {
  it("says there are no projects yet and points to Explore careers when there is no current project", async () => {
    await renderWithRouter(() => <CurrentProjectsCard project={null} />);

    expect(screen.getByRole("heading", { name: "Current Projects" })).toBeTruthy();
    expect(screen.getByText("No projects yet")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Explore careers" }).getAttribute("href")).toBe("/careers");
  });

  it("shows the current project's title, description and progress instead of the empty state", async () => {
    await renderWithRouter(() => <CurrentProjectsCard project={project} />);

    expect(screen.getByRole("heading", { name: "Build a landing page" })).toBeTruthy();
    expect(screen.getByText("Put the basics together in one small site.")).toBeTruthy();
    expect(screen.queryByText("No projects yet")).toBeNull();
    const bar = screen.getByRole("progressbar", { name: "Project progress" });
    expect(bar.getAttribute("aria-valuenow")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe("3");
  });

  it("lists the skills", async () => {
    await renderWithRouter(() => <CurrentProjectsCard project={project} />);

    const skills = within(screen.getByRole("list", { name: "Skills" })).getAllByRole("listitem");
    expect(skills.map((skill) => skill.textContent)).toEqual(["HTML", "CSS"]);
  });

  it("omits the skills list when there are none", async () => {
    await renderWithRouter(() => <CurrentProjectsCard project={{ ...project, skills: [] }} />);

    expect(screen.queryByRole("list", { name: "Skills" })).toBeNull();
  });

  it("lists the steps in order with their status for screen readers", async () => {
    await renderWithRouter(() => <CurrentProjectsCard project={project} />);

    const steps = within(screen.getByRole("list", { name: "Steps" })).getAllByRole("listitem");
    expect(steps.map((step) => step.textContent)).toEqual([
      "Completed: Write the markup",
      "In progress: Style the page",
      "Not started: Deploy it",
    ]);
  });

  it("links on to the pathway", async () => {
    await renderWithRouter(() => <CurrentProjectsCard project={project} />);

    expect(screen.getByRole("link", { name: "Continue your pathway" }).getAttribute("href")).toBe("/my-pathway");
  });
});
