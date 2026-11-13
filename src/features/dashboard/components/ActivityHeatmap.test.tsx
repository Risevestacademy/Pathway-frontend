import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ActivityHeatmap } from "./ActivityHeatmap";

afterEach(cleanup);

describe("ActivityHeatmap", () => {
  it("shows an empty year grid, described once rather than cell by cell", () => {
    const { container } = render(<ActivityHeatmap today={new Date(2026, 8, 20)} />);

    expect(screen.getByRole("img", { name: "No activity yet" })).toBeTruthy();
    expect(container.querySelectorAll("[data-cell]")).toHaveLength(53 * 7);
  });

  it("labels the months, ending with the current one", () => {
    render(<ActivityHeatmap today={new Date(2026, 8, 20)} />);

    expect(screen.getByText("Oct")).toBeTruthy();
    expect(screen.getByText("Sep")).toBeTruthy();
  });
});
