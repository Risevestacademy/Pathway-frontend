import { useEffect, useState, type RefObject } from "react";

const hasObserver = () => typeof IntersectionObserver !== "undefined";

// Without IntersectionObserver (tests, old browsers) it reports in view, so nothing stays hidden.
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = "0px", threshold = 0 }: { rootMargin?: string; threshold?: number } = {},
) {
  const [inView, setInView] = useState(() => !hasObserver());

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasObserver()) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold]);

  return inView;
}
