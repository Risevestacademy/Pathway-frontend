import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { buildAssessment } from "../skillCheck.fixtures";
import { SettledPanel } from "./SettledPanel";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: { children: React.ReactNode; to: string; params?: Record<string, string> }) => (
    <a href={Object.entries(params ?? {}).reduce((path, [k, v]) => path.replace(`$${k}`, v), to)}>{children}</a>
  ),
}));

afterEach(cleanup);

const assessment = buildAssessment();
const startStep = { id: "st3", order: 3, title: "JavaScript basics" };

describe("SettledPanel", () => {
  it("names the step they start at", () => {
    render(<SettledPanel assessment={assessment} startStep={startStep} />);

    expect(screen.getByText("Step 3, JavaScript basics")).toBeTruthy();
  });

  it("says the earlier steps stay open", () => {
    render(<SettledPanel assessment={assessment} startStep={startStep} />);

    expect(screen.getByText(/Steps 1 and 2 stay open/)).toBeTruthy();
  });

  it("takes them on to the career's pathway overview", () => {
    render(<SettledPanel assessment={assessment} startStep={startStep} />);

    expect(screen.getByRole("link", { name: /Go to roadmap/ }).getAttribute("href")).toBe(
      "/my-pathway/c1/overview",
    );
  });

  it("can still go back to Skill check", () => {
    render(<SettledPanel assessment={assessment} startStep={startStep} />);

    expect(screen.getByRole("link", { name: "Back to Skill check" }).getAttribute("href")).toBe(
      "/my-pathway/skill-check",
    );
  });
});
