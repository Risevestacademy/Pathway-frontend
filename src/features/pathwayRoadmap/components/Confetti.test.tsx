import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { Confetti } from "./Confetti";

const reducedMotion = (reduce: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

beforeEach(() => {
  vi.useFakeTimers();
  reducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const pieces = (container: HTMLElement) => container.querySelectorAll("[data-confetti-piece]");

describe("Confetti", () => {
  it("falls over the whole screen without getting in the way", () => {
    const { container } = render(<Confetti />);

    const overlay = container.firstElementChild as HTMLElement;
    expect(overlay.className).toContain("fixed");
    expect(overlay.className).toContain("inset-0");
    expect(overlay.className).toContain("pointer-events-none");
  });

  it("is hidden from screen readers, since it is only decoration", () => {
    const { container } = render(<Confetti />);

    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBe("true");
  });

  it("is a good handful of pieces", () => {
    const { container } = render(<Confetti />);

    expect(pieces(container).length).toBeGreaterThanOrEqual(40);
  });

  it("can be asked for a different number of pieces", () => {
    const { container } = render(<Confetti count={12} />);

    expect(pieces(container)).toHaveLength(12);
  });

  it("animates every piece falling, each at its own pace and place", () => {
    const { container } = render(<Confetti count={20} />);

    const all = Array.from(pieces(container)) as HTMLElement[];
    for (const piece of all) {
      expect(piece.className).toContain("confetti-piece");
    }
    expect(new Set(all.map((piece) => piece.style.left)).size).toBeGreaterThan(5);
    expect(new Set(all.map((piece) => piece.style.getPropertyValue("--confetti-duration"))).size).toBeGreaterThan(1);
    expect(new Set(all.map((piece) => piece.style.getPropertyValue("--confetti-delay"))).size).toBeGreaterThan(1);
  });

  it("shows nothing to someone who prefers reduced motion", () => {
    reducedMotion(true);

    const { container } = render(<Confetti />);

    expect(pieces(container)).toHaveLength(0);
  });

  it("says when it is done, once the last piece has landed", () => {
    const onDone = vi.fn();
    render(<Confetti onDone={onDone} />);
    expect(onDone).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(onDone).toHaveBeenCalledOnce();
  });

  it("doesn't report being done if it goes away first", () => {
    const onDone = vi.fn();
    const { unmount } = render(<Confetti onDone={onDone} />);

    unmount();
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(onDone).not.toHaveBeenCalled();
  });
});
