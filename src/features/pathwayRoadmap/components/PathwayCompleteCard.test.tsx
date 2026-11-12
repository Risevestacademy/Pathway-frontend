import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PathwayCompleteCard } from "./PathwayCompleteCard";

afterEach(cleanup);

describe("PathwayCompleteCard", () => {
  it("is a section titled for finishing the pathway", () => {
    render(<PathwayCompleteCard total={16} />);

    const section = screen.getByRole("region", { name: "You finished your pathway" });
    expect(section).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "You finished your pathway" })).toBeTruthy();
  });

  it("says how many steps they marked complete, and that it is their own record", () => {
    render(<PathwayCompleteCard total={16} />);

    expect(
      screen.getByText("You marked all 16 steps complete. This is your own record, not a certificate."),
    ).toBeTruthy();
  });

  it("reads naturally for a pathway with a single step", () => {
    render(<PathwayCompleteCard total={1} />);

    expect(
      screen.getByText("You marked your only step complete. This is your own record, not a certificate."),
    ).toBeTruthy();
  });
});
