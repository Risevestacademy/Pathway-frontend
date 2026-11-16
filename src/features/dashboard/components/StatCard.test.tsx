import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

afterEach(cleanup);

describe("StatCard", () => {
  it("shows its title and value, with the art hidden from screen readers", () => {
    const { container } = render(<StatCard title="Pathways" value={2} art="/art.png" tone="yellow" />);

    expect(screen.getByRole("heading", { name: "Pathways" })).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("shows zero as a value, not as nothing", () => {
    render(<StatCard title="Steps Completed" value={0} art="/art.png" tone="pink" />);

    expect(screen.getByText("0")).toBeTruthy();
  });
});
