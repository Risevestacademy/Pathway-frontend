import { useEffect, type RefObject } from "react";

export interface ScrollProgressOptions {
  /** Viewport fraction (0 = top, 1 = bottom) where the element's top maps to progress 0. */
  start?: number;
  /** Viewport fraction where the element's top maps to progress 1. */
  end?: number;
  /** CSS custom property written on the element. */
  property?: string;
}

/** Pure mapping so it can be unit tested without a DOM. */
export function scrollProgress(top: number, viewportHeight: number, start: number, end: number) {
  const from = viewportHeight * start;
  const to = viewportHeight * end;
  if (from === to) return 1;
  const p = (from - top) / (from - to);
  return Math.min(1, Math.max(0, p));
}

/**
 * Writes the element's scroll progress (0..1) to a CSS variable so CSS can
 * drive scroll-scrubbed motion. One passive listener, one rAF per frame, no
 * React re-renders. Under reduced motion the variable is pinned to 1.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { start = 0.85, end = 0.35, property = "--p" }: ScrollProgressOptions = {},
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
      const { top } = el.getBoundingClientRect();
      el.style.setProperty(property, scrollProgress(top, window.innerHeight, start, end).toFixed(4));
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
  }, [ref, start, end, property]);
}
