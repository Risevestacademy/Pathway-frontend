import { act, cleanup, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInView } from "./useInView";

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return <div ref={ref}>{inView ? "in" : "out"}</div>;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("useInView", () => {
  it("defaults to true when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Probe />);
    expect(screen.getByText("in")).not.toBeNull();
  });

  it("follows the observer's intersection state", () => {
    let callback: Callback = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: Callback) {
          callback = cb;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );

    const { unmount } = render(<Probe />);
    expect(screen.getByText("out")).not.toBeNull();
    expect(observe).toHaveBeenCalledTimes(1);

    act(() => callback([{ isIntersecting: true }]));
    expect(screen.getByText("in")).not.toBeNull();

    act(() => callback([{ isIntersecting: false }]));
    expect(screen.getByText("out")).not.toBeNull();

    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
