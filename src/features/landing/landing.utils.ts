// Passed to router hash links so the router owns the URL and the scroll respects reduced motion.
export function hashScrollOptions(): ScrollIntoViewOptions {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { behavior: reduce ? "auto" : "smooth", block: "start" };
}
