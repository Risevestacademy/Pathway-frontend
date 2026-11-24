import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ActivityHeatmap } from "./ActivityHeatmap";

afterEach(cleanup);

const empty = { from: "2025-09-21", to: "2026-09-20", days: [] };

describe("ActivityHeatmap", () => {
  it("shows an empty year grid, described once rather than cell by cell", () => {
    const { container } = render(<ActivityHeatmap heatmap={empty} />);

    expect(screen.getByRole("img", { name: "No activity yet" })).toBeTruthy();
    expect(container.querySelectorAll("[data-cell]")).toHaveLength(53 * 7);
  });

  it("labels the months, ending with the month the history ends in", () => {
    render(<ActivityHeatmap heatmap={empty} />);

    expect(screen.getByText("Oct")).toBeTruthy();
    expect(screen.getByText("Sep")).toBeTruthy();
  });

  it("shades each day by how much was done and summarises the total", () => {
    const { container } = render(
      <ActivityHeatmap
        heatmap={{
          from: "2026-09-14",
          to: "2026-09-16",
          days: [
            { date: "2026-09-14", count: 0 },
            { date: "2026-09-15", count: 1 },
            { date: "2026-09-16", count: 6 },
          ],
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "7 activities in the last year" })).toBeTruthy();
    const levels = Array.from(container.querySelectorAll("[data-cell][data-date]")).map((cell) => [
      cell.getAttribute("data-date"),
      cell.getAttribute("data-level"),
    ]);
    expect(levels).toEqual([
      ["2026-09-14", "0"],
      ["2026-09-15", "1"],
      ["2026-09-16", "4"],
    ]);
  });

  it("says activity in the singular for a single one", () => {
    render(
      <ActivityHeatmap
        heatmap={{ from: "2026-09-15", to: "2026-09-15", days: [{ date: "2026-09-15", count: 1 }] }}
      />,
    );

    expect(screen.getByRole("img", { name: "1 activity in the last year" })).toBeTruthy();
  });
});
