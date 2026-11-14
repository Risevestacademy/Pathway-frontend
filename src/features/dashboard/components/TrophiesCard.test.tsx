import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { TrophiesCard } from "./TrophiesCard";

afterEach(cleanup);

describe("TrophiesCard", () => {
  it("shows zero trophies and five locked slots", () => {
    render(<TrophiesCard />);

    expect(screen.getByRole("heading", { name: "Trophies" })).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    const slots = within(screen.getByRole("list", { name: "Trophies to earn" })).getAllByRole("listitem");
    expect(slots).toHaveLength(5);
    expect(within(slots[0]).getByText("Locked")).toBeTruthy();
  });
});
