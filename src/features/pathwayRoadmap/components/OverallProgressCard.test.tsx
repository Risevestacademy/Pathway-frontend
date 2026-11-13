import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { OverallProgressCard } from "./OverallProgressCard";

afterEach(cleanup);

const card = (completed: number, total: number) =>
  render(<OverallProgressCard completed={completed} total={total} />);

describe("OverallProgressCard", () => {
  it("is a titled section", () => {
    card(0, 16);

    const section = screen.getByRole("region", { name: /Overall progress/ });
    expect(within(section).getByRole("heading", { level: 2, name: "Overall progress" })).toBeTruthy();
  });

  it("says the progress is self-reported", () => {
    card(0, 16);

    expect(screen.getByText("Self-reported")).toBeTruthy();
  });

  it("shows how many steps are complete", () => {
    card(3, 8);

    expect(screen.getByText("3 of 8 steps complete")).toBeTruthy();
  });

  it("starts at none complete", () => {
    card(0, 16);

    expect(screen.getByText("0 of 16 steps complete")).toBeTruthy();
  });

  it("uses the singular for one step", () => {
    card(0, 1);

    expect(screen.getByText("0 of 1 step complete")).toBeTruthy();
  });

  it("shows a progress bar with the same numbers", () => {
    card(3, 8);

    const bar = screen.getByRole("progressbar", { name: "Overall progress" });
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
    expect(bar.getAttribute("aria-valuemax")).toBe("8");
  });

  it("copes with a pathway that has no steps", () => {
    card(0, 0);

    expect(screen.getByText("0 of 0 steps complete")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
  });

  it("explains that nothing checks the steps were really done", () => {
    card(0, 16);

    expect(
      screen.getByText(
        "Progress counts the steps you mark complete. We do not check that you finished them.",
      ),
    ).toBeTruthy();
  });
});
