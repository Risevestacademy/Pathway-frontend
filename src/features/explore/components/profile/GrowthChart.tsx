import type { ProjectionPoint } from "../../explore.utils";
import { projectionGeometry } from "../../explore.utils";

const WIDTH = 600;
const HEIGHT = 200;

// The API gives only a base and a projected value, so both are labelled to avoid implying yearly data.
export default function GrowthChart({ points, unit }: { points: ProjectionPoint[]; unit?: string }) {
  const g = projectionGeometry(points, WIDTH, HEIGHT);
  const first = points[0];
  const last = points[points.length - 1];
  const labelled = new Set([first.year, last.year]);
  // Skips the years next to the end labels so they never collide.
  const middle = g.ticks.filter(
    (tick) =>
      !labelled.has(tick.year) &&
      tick.year > first.year + 1 &&
      tick.year < last.year - 1 &&
      (tick.year - first.year) % 2 === 1,
  );
  const fmt = (value: number) => `${value.toLocaleString("en")}${unit === "thousand jobs" ? "k" : ""}`;
  const summary = `Employment projected to change from ${fmt(first.value)} ${unit ?? ""} in ${first.year} to ${fmt(last.value)} ${unit ?? ""} in ${last.year}.`;

  return (
    <figure className="mt-6">
      <div className="relative">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="block h-[200px] w-full" role="img" aria-label={summary}>
          {g.grid.map((y) => (
            <line key={y} x1="0" x2={WIDTH} y1={y} y2={y} stroke="var(--color-grey-100)" strokeDasharray="8 6" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={g.area} fill="var(--color-brand-50)" />
          <path d={g.line} fill="none" stroke="var(--color-brand-500)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2={WIDTH} y1={HEIGHT} y2={HEIGHT} stroke="var(--color-grey-200)" vectorEffect="non-scaling-stroke" />
          {g.ticks.map((tick) => (
            <line key={tick.year} x1={tick.x} x2={tick.x} y1={HEIGHT} y2={HEIGHT - 8} stroke="var(--color-grey-200)" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {/* Positioned in % so they track the stretched chart. */}
        {[{ point: first, at: g.first }, { point: last, at: g.last }].map(({ point, at }, i) => (
          <span
            key={point.year}
            aria-hidden
            style={{ top: `${(at.y / HEIGHT) * 100}%`, ...(i === 0 ? { left: 0 } : { right: 0 }) }}
            className="absolute -translate-y-[calc(100%+6px)] rounded-[6px] bg-white px-1.5 font-landing-body text-[13px] font-medium text-brand-600"
          >
            {fmt(point.value)}
          </span>
        ))}
      </div>
      <div aria-hidden className="relative mt-3 h-10 font-landing-body text-[14px] text-grey-500">
        <span className="absolute left-0 leading-tight">
          <span className="block text-ink">{first.year}</span>initial
        </span>
        {middle.map((tick) => (
          <span key={tick.year} style={{ left: `${(tick.x / WIDTH) * 100}%` }} className="absolute top-1.5 -translate-x-1/2">
            {tick.year}
          </span>
        ))}
        <span className="absolute right-0 text-right leading-tight">
          <span className="block text-ink">{last.year}</span>projected
        </span>
      </div>
      {unit && <figcaption className="sr-only">{summary}</figcaption>}
    </figure>
  );
}
