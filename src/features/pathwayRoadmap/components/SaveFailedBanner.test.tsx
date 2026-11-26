import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SaveFailedBanner } from "./SaveFailedBanner";

afterEach(cleanup);

const banner = (onRetry = vi.fn()) => {
  render(<SaveFailedBanner resourceTitle="Laws of UX" onRetry={onRetry} />);
  return onRetry;
};

describe("SaveFailedBanner", () => {
  it("is an alert, so a screen reader announces it", () => {
    banner();

    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("says the last change wasn't saved", () => {
    banner();

    expect(screen.getByText("We could not save your last change")).toBeTruthy();
  });

  it("names the resource whose tick wasn't saved, and what to do", () => {
    banner();

    expect(
      screen.getByText("Your tick on “Laws of UX” is not saved yet. Check your connection and try again."),
    ).toBeTruthy();
  });

  it("offers to try again", () => {
    const onRetry = banner();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("SaveFailedBanner when the pathway isn't tracked", () => {
  it("says to start tracking, and offers no retry that could never work", () => {
    cleanup();
    render(<SaveFailedBanner resourceTitle="Laws of UX" notTracking onRetry={vi.fn()} />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Start tracking this pathway to save your progress.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(screen.queryByText(/Check your connection/)).toBeNull();
  });
});
