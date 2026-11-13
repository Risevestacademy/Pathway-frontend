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
