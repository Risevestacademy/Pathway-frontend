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

  describe("leaving room for the buttons beside it", () => {
    it("keeps the bar short, with a fixed width", () => {
      render(<ProgressPill completed={5} total={16} />);

      const bar = screen.getByRole("progressbar");
      expect(bar.className).toContain("w-24");
      expect(bar.className).toContain("shrink-0");
      expect(bar.className).not.toMatch(/w-(40|48|56|64)/);
    });

    it("only appears where the top bar has room for it", () => {
      const { container } = render(<ProgressPill completed={5} total={16} />);

      const pill = container.firstElementChild as HTMLElement;
      expect(pill.className).toContain("hidden");
      expect(pill.className).toContain("xl:flex");
      expect(pill.className).not.toContain("lg:flex");
    });

    it("doesn't squeeze the other buttons, and keeps its own text on one line", () => {
      const { container } = render(<ProgressPill completed={5} total={16} />);

      expect((container.firstElementChild as HTMLElement).className).toContain("shrink-0");
    });
  });
});
