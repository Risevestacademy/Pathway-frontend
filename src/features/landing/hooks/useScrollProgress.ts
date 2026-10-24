import { useEffect, type RefObject } from "react";

export interface ScrollProgressOptions {
  /**
   * `pinned`: the element is taller than the viewport and holds a sticky
   * 100vh box; progress is how far the element has scrolled past the top
   * (0 when its top hits the viewport top, 1 when its bottom hits the
   * viewport bottom). `viewport`: progress is where the element's top sits
   * between the `start` and `end` viewport fractions.
   */
  mode?: "pinned" | "viewport";
  /** Viewport fraction (0 = top, 1 = bottom) where the element's top maps to progress 0. */
  start?: number;
  /** Viewport fraction where the element's top maps to progress 1. */
  end?: number;
  /** CSS custom property written on the element. */
  property?: string;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Pure mappings so they can be unit tested without a DOM. */
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

/**
 * Writes the element's scroll progress (0..1) to a CSS variable so CSS can
 * drive scroll-scrubbed motion. One passive listener, one rAF per frame, no
 * React re-renders. Under reduced motion the variable is pinned to 1.
 */
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
