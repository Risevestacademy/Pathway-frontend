import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { DashboardBadgeDto } from "../../../lib/api/dashboard.api";
import { TrophiesCard } from "./TrophiesCard";

afterEach(cleanup);

const badge = (id: string, name: string): DashboardBadgeDto => ({
  id,
  name,
  description: `${name} description`,
  iconKey: "star",
  xpThreshold: 100,
  awardedAt: "2026-11-10T08:00:00.000Z",
});

describe("TrophiesCard", () => {
  it("shows zero and no placeholder slots when there are no badges at all", () => {
    render(<TrophiesCard badges={[]} earned={0} total={0} />);

    expect(screen.getByRole("heading", { name: "Trophies" })).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByText("Trophies you earn will show up here.")).toBeTruthy();
  });

  it("shows the earned badges by name, then a locked slot for each one still to earn", () => {
    render(
      <TrophiesCard badges={[badge("b1", "First Step"), badge("b2", "Week Streak")]} earned={2} total={5} />,
    );

    expect(screen.getByText("of 5")).toBeTruthy();
    const items = within(screen.getByRole("list", { name: "Trophies" })).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(within(items[0]).getByText("First Step")).toBeTruthy();
    expect(items[0].getAttribute("title")).toBe("First Step description");
    expect(within(items[1]).getByText("Week Streak")).toBeTruthy();
    expect(within(items[2]).getByText("Locked")).toBeTruthy();
    expect(within(items[4]).getByText("Locked")).toBeTruthy();
  });

  it("has no locked slots once every badge is earned", () => {
    render(<TrophiesCard badges={[badge("b1", "First Step")]} earned={1} total={1} />);

    expect(screen.queryByText("Locked")).toBeNull();
    expect(screen.getByText("First Step")).toBeTruthy();
  });

  it("caps how many locked slots it draws, while the count still says how many exist", () => {
    render(<TrophiesCard badges={[]} earned={0} total={20} />);

    expect(screen.getByText("of 20")).toBeTruthy();
    expect(screen.getAllByText("Locked")).toHaveLength(5);
  });

  it("draws each earned badge with its own icon and the locked ones with the locked icon", () => {
    const names = ["One", "Two", "Three", "Four", "Five"];
    render(<TrophiesCard badges={names.map((name, i) => badge(`b${i}`, name))} earned={5} total={6} />);

    const items = within(screen.getByRole("list", { name: "Trophies" })).getAllByRole("listitem");
    const src = (item: HTMLElement) => item.querySelector("img")?.getAttribute("src") ?? "";
    expect(src(items[0])).toContain("badge-cube");
    expect(src(items[1])).toContain("badge-hexagon");
    expect(src(items[2])).toContain("badge-sparkle");
    expect(src(items[3])).toContain("badge-flame");
    expect(src(items[4])).toContain("trophy");
    expect(src(items[5])).toContain("badge-locked");
  });
});
