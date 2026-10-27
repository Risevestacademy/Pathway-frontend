import { useEffect, type RefObject } from "react";

export interface ScrollProgressOptions {
  /** `pinned` measures scroll through a section taller than the viewport; `viewport` measures its top edge between `start` and `end`. */
  mode?: "pinned" | "viewport";
  /** Viewport fractions, 0 = top. */
  start?: number;
  end?: number;
  property?: string;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function scrollProgress(top: number, viewportHeight: number, start: number, end: number) {
  const from = viewportHeight * start;
  const to = viewportHeight * end;
  if (from === to) return 1;
  return clamp01((from - top) / (from - to));
}

export function pinnedProgress(top: number, height: number, viewportHeight: number) {
  const distance = height - viewportHeight;
  if (distance <= 0) return 1;
  return clamp01(-top / distance);
}

// Writes progress to a CSS variable rather than state, so scrolling never re-renders React.
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { mode = "viewport", start = 0.85, end = 0.35, property = "--p" }: ScrollProgressOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      el.style.setProperty(property, "1");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const p =
        mode === "pinned"
          ? pinnedProgress(rect.top, rect.height, window.innerHeight)
          : scrollProgress(rect.top, window.innerHeight, start, end);
      el.style.setProperty(property, p.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, mode, start, end, property]);
}
