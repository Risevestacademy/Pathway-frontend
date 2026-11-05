import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { SkillCheckCareer } from "../skillCheck.types";
import { SettledPanel } from "./SettledPanel";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
}));

afterEach(cleanup);

const career: SkillCheckCareer = {
  careerId: "c1",
  name: "Frontend Developer",
  icon: "frontend-developer",
  reviewed: true,
  areas: [],
  skills: [],
  steps: [
    { order: 1, title: "HTML" },
    { order: 2, title: "CSS" },
  ],
};

describe("SettledPanel", () => {
  it("names the step they start at", () => {
    render(<SettledPanel career={career} startingPoint={{ stepOrder: 2, source: "ACCEPTED" }} />);

    expect(screen.getByText("Step 2, CSS")).toBeTruthy();
  });

  it("takes them on to the career's pathway overview", () => {
    render(<SettledPanel career={career} startingPoint={{ stepOrder: 1, source: "DEFAULT" }} />);

    expect(screen.getByRole("link", { name: /Go to roadmap/ }).getAttribute("href")).toBe(
      "/my-pathway/c1/overview",
    );
  });

  it("can still go back to Skill check", () => {
    render(<SettledPanel career={career} startingPoint={{ stepOrder: 1, source: "DEFAULT" }} />);

    expect(screen.getByRole("link", { name: "Back to Skill check" }).getAttribute("href")).toBe(
      "/my-pathway/skill-check",
    );
  });
});
