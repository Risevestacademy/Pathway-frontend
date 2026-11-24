import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import { FEATURE_CARDS, FEATURE_SECTION, type FeatureCard, type FeatureId } from "../landing.copy";
import { sectionHeading } from "../landing.styles";
import noteCorner from "@/assets/landing/decor-note-corner.webp";
import notebook from "@/assets/landing/decor-notebook.webp";
import folderBack from "@/assets/landing/feature-folder-back.webp";
import folderFront from "@/assets/landing/feature-folder-front.webp";
import paperclip from "@/assets/landing/feature-paperclip.webp";
import blankSheet from "@/assets/landing/feature-sheet-blank.webp";
import profileSheet from "@/assets/landing/feature-profile-sheet.webp";
import corkboard from "@/assets/landing/feature-corkboard.webp";
import note1 from "@/assets/landing/feature-note-1.webp";
import note2 from "@/assets/landing/feature-note-2.webp";
import note3 from "@/assets/landing/feature-note-3.webp";
import clipboard from "@/assets/landing/feature-clipboard.webp";

// All numbers are px on the export's 520px-wide card. A card is idle until one in its column is
// hovered, then the hovered card is open and its neighbour is shut.
type Point = readonly [number, number];
interface States<T> {
  idle: T;
  open: T;
  shut: T;
}
interface Pose {
  dx?: number;
  dy?: number;
  r?: number;
  o?: number;
}

const u = (n: number) => `calc(${n} * var(--u))`;
const transform = ({ dx = 0, dy = 0, r = 0 }: Pose) => `translate(${u(dx)}, ${u(dy)}) rotate(${r}deg)`;

function poseVars({ idle = {}, open = {}, shut = idle }: Partial<States<Pose>>) {
  return {
    "--idle": transform(idle),
    "--open": transform(open),
    "--shut": transform(shut),
    "--o-idle": idle.o ?? 1,
    "--o-open": open.o ?? 1,
    "--o-shut": shut.o ?? 1,
  } as CSSProperties;
}

const partClass = "feature-part pointer-events-none absolute max-w-none select-none";

interface LayerProps extends Partial<States<Pose>> {
  src: string;
  x: number;
  y: number;
  w: number;
  origin?: Point;
}

function Layer({ src, x, y, w, origin, ...poses }: LayerProps) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      loading="lazy"
      className={partClass}
      style={{
        left: u(x),
        top: u(y),
        width: u(w),
        transformOrigin: origin ? `${u(origin[0])} ${u(origin[1])}` : "center",
        ...poseVars(poses),
      }}
    />
  );
}

/** Placed by where its pin goes in, and rotated around that point. */
function Note({ src, w, pin, at, r = {}, o = {} }: {
  src: string;
  w: number;
  pin: Point;
  at: States<Point>;
  r?: Partial<States<number>>;
  o?: Partial<States<number>>;
}) {
  const pose = (state: keyof States<Point>): Pose => ({
    dx: at[state][0] - at.open[0],
    dy: at[state][1] - at.open[1],
    r: r[state],
    o: o[state],
  });
  return (
    <Layer
      src={src}
      x={at.open[0] - pin[0]}
      y={at.open[1] - pin[1]}
      w={w}
      origin={pin}
      idle={pose("idle")}
      open={pose("open")}
      shut={pose("shut")}
    />
  );
}

/**
 * The red string between two pins. The curve is stretched to the pins' distance and turned to face
 * them, so it can follow the notes with transforms alone (Safari can't animate an SVG path).
 */
function Thread({ from, to, bend, o = {} }: {
  from: States<Point>;
  to: States<Point>;
  bend: number;
  o?: Partial<States<number>>;
}) {
  const vars: Record<string, string | number> = {};
  for (const state of ["idle", "open", "shut"] as const) {
    const [x1, y1] = from[state];
    const [x2, y2] = to[state];
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    vars[`--${state}`] = `translate(${u(x1)}, ${u(y1)}) rotate(${angle}deg)`;
    vars[`--w-${state}`] = Math.hypot(x2 - x1, y2 - y1);
    vars[`--o-${state}`] = o[state] ?? 1;
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 1"
      preserveAspectRatio="none"
      className={clsx(partClass, "feature-thread top-0 left-0 overflow-visible")}
      style={{ height: u(1), transformOrigin: "0 0", ...vars } as CSSProperties}
    >
      <path
        d={`M0 0 Q50 ${bend} 100 0`}
        fill="none"
        stroke="#c0101e"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="[stroke-width:calc(2.2*var(--u))]"
      />
    </svg>
  );
}

// The folder's contents tuck up as the card shuts, so its top edge stays in view.
const FOLDER_SHUT: Pose = { dy: -18 };

function ExploreArt() {
  return (
    <>
      <Layer src={folderBack} x={0} y={163} w={253} shut={FOLDER_SHUT} />
      <Layer
        src={profileSheet}
        x={196}
        y={167}
        w={279}
        idle={{ dx: -195, dy: -5, r: -4.5 }}
        shut={{ dx: -195, dy: -23, r: -4.5 }}
      />
      <Layer src={blankSheet} x={0} y={166} w={231} shut={FOLDER_SHUT} />
      <Layer src={folderFront} x={0} y={163} w={229.5} shut={FOLDER_SHUT} />
      <Layer src={paperclip} x={201} y={147} w={24} shut={FOLDER_SHUT} />
    </>
  );
}

const NOTE_W = 218.5;
const NOTE_PIN: Point = [137.25, 87.75];
const PIN_1: States<Point> = { idle: [111, 189], open: [151.5, 248.5], shut: [111, 157] };
const PIN_2: States<Point> = { idle: [477, 223], open: [439, 221], shut: [477, 191] };
const PIN_3: States<Point> = { idle: [344, 378.5], open: [344, 378.5], shut: [344, 378.5] };
const HIDDEN_UNTIL_OPEN = { idle: 0, open: 1, shut: 0 };

function RoadmapArt() {
  return (
    <>
      <Layer src={corkboard} x={24} y={125} w={497.5} idle={{ o: 0 }} />
      <Note src={note1} w={261} pin={[122, 81]} at={PIN_1} r={{ idle: -1, shut: -1 }} />
      <Note src={note2} w={NOTE_W} pin={NOTE_PIN} at={PIN_2} r={{ idle: 10, shut: 10 }} />
      <Note src={note3} w={NOTE_W} pin={NOTE_PIN} at={PIN_3} o={HIDDEN_UNTIL_OPEN} />
      <Thread from={PIN_1} to={PIN_2} bend={42} />
      <Thread from={PIN_2} to={PIN_3} bend={-57} o={HIDDEN_UNTIL_OPEN} />
    </>
  );
}

function PlanArt() {
  return <Layer src={clipboard} x={0} y={13} w={520} />;
}

const BAR_H = 360;
const BARS = [
  { idle: 39, open: 181 },
  { idle: 30, open: 139 },
  { idle: 43, open: 200 },
  { idle: 73, open: 339, highlight: true },
  { idle: 61, open: 283 },
  { idle: 13, open: 60 },
];

function ProgressArt() {
  return BARS.map((bar, index) => (
    <div
      key={index}
      aria-hidden
      className={clsx(
        partClass,
        "bottom-0 rounded-t-[calc(12*var(--u))]",
        bar.highlight ? "bg-[#ad7000]" : "bg-[#f4d8a4]",
      )}
      style={{
        left: u(96 + index * 72),
        width: u(64),
        height: u(BAR_H),
        ...poseVars({
          idle: { dy: BAR_H - bar.idle },
          open: { dy: BAR_H - bar.open },
          // Shutting lowers every bar by the same amount; the shortest drop out of sight.
          shut: { dy: BAR_H - Math.max(0, bar.idle - 32) },
        }),
      }}
    />
  ));
}

const CARDS: Record<FeatureId, { className: string; Art: () => ReactNode }> = {
  explore: { className: "bg-landing-sticker-blue text-[#00457a]", Art: ExploreArt },
  roadmap: { className: "bg-brand-50 text-[#1f054c]", Art: RoadmapArt },
  plan: { className: "bg-landing-sticker-pink text-[#520027]", Art: PlanArt },
  progress: { className: "bg-landing-sticker-cream text-[#523500]", Art: ProgressArt },
};

const byId = (id: FeatureId) => FEATURE_CARDS.find((card) => card.id === id) as FeatureCard;
const COLUMNS: FeatureCard[][] = [
  [byId("explore"), byId("plan")],
  [byId("roadmap"), byId("progress")],
];

export default function FeatureCardsSection() {
  return (
    <section
      aria-labelledby="landing-features-heading"
      className="relative overflow-x-clip bg-white pt-[120px] pb-[120px]"
    >
      <img
        src={noteCorner}
        alt=""
        loading="lazy"
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute top-[70px] -right-4 z-10 hidden w-[192px] max-w-none select-none xl:block"
      />
      <img
        src={notebook}
        alt=""
        loading="lazy"
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute -bottom-[95px] -left-3 z-10 hidden w-[266px] max-w-none select-none xl:block"
      />

      <h2
        id="landing-features-heading"
        className={clsx(sectionHeading, "mx-auto max-w-[640px] px-page-mobile text-center sm:whitespace-pre-line")}
      >
        {FEATURE_SECTION.heading}
      </h2>

      <div className="feature-grid landing-container mt-[60px]">
        <div className="feature-cols">
          {COLUMNS.map((column) => (
            <div key={column[0].id} className="feature-col">
              {column.map((card) => {
                const { className, Art } = CARDS[card.id];
                return (
                  <article key={card.id} className={clsx("feature-card", className)}>
                    <h3 className="relative z-10 px-[calc(42*var(--u))] pt-[calc(41*var(--u))] font-landing-body text-[length:calc(32*var(--u))] leading-[calc(40*var(--u))] font-medium tracking-[-0.03em] whitespace-pre-line">
                      {card.copy}
                    </h3>
                    <Art />
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
