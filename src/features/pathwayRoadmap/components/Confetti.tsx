import { useEffect, useState } from "react";

const COLORS = [
  "var(--color-brand-600)",
  "var(--color-brand-300)",
  "var(--color-accent-500)",
  "var(--color-success-600)",
  "var(--color-danger-600)",
];

// The slowest piece, plus its delay, is about this long. A little more, to be sure.
const DONE_AFTER_MS = 5000;

interface Piece {
  left: number;
  size: number;
  delay: number;
  duration: number;
  spin: number;
  color: string;
  round: boolean;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, index) => ({
    left: between(0, 100),
    size: between(6, 12),
    delay: between(0, 0.8),
    duration: between(2.4, 3.6),
    spin: between(360, 900) * (Math.random() < 0.5 ? -1 : 1),
    color: COLORS[index % COLORS.length],
    round: Math.random() < 0.3,
  }));
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Paper falling over the whole page, for a moment of celebration. Decoration
 * only: it never takes clicks, screen readers skip it, and anyone who prefers
 * reduced motion doesn't see it.
 */
export function Confetti({ count = 60, onDone }: { count?: number; onDone?: () => void }) {
  const [reduced] = useState(prefersReducedMotion);
  const [pieces] = useState(() => (reduced ? [] : makePieces(count)));

  useEffect(() => {
    if (!onDone) return;
    const timer = setTimeout(onDone, DONE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((piece, index) => (
        <span
          key={index}
          data-confetti-piece
          className="confetti-piece absolute top-0 block"
          style={
            {
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.round ? piece.size : piece.size * 1.6,
              borderRadius: piece.round ? "9999px" : 2,
              backgroundColor: piece.color,
              "--confetti-delay": `${piece.delay}s`,
              "--confetti-duration": `${piece.duration}s`,
              "--confetti-spin": `${piece.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
