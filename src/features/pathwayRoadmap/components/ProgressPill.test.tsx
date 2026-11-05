import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ProgressPill } from "./ProgressPill";

afterEach(cleanup);

describe("ProgressPill", () => {
  it("shows the percentage of steps complete", () => {
    render(<ProgressPill completed={1} total={16} />);

    expect(screen.getByText("6%")).toBeTruthy();
  });

  it("shows how many steps are complete, out of how many", () => {
    render(<ProgressPill completed={1} total={16} />);

    expect(screen.getByText("1 of 16 steps")).toBeTruthy();
  });

  it("uses the singular for a pathway of one step", () => {
    render(<ProgressPill completed={0} total={1} />);

    expect(screen.getByText("0 of 1 step")).toBeTruthy();
  });

  it("has a bar with the same numbers, named for screen readers", () => {
    render(<ProgressPill completed={5} total={16} />);

    const bar = screen.getByRole("progressbar", { name: "Pathway progress" });
    expect(bar.getAttribute("aria-valuenow")).toBe("5");
    expect(bar.getAttribute("aria-valuemax")).toBe("16");
  });

  it("fills the bar as far as the steps are done", () => {
    render(<ProgressPill completed={4} total={16} />);

    const fill = screen.getByRole("progressbar").firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("25%");
  });

  it("reads 0% for a pathway with no steps, and doesn't divide by zero", () => {
    render(<ProgressPill completed={0} total={0} />);

    expect(screen.getByText("0%")).toBeTruthy();
    expect((screen.getByRole("progressbar").firstElementChild as HTMLElement).style.width).toBe("0%");
  });
});
