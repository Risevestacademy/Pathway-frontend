import clsx from "clsx";
import { useRef, type CSSProperties } from "react";
import { STICKER_CARDS, STICKER_SECTION, type StickerTone } from "../landing.copy";
import { sectionHeading } from "../landing.styles";
import { useScrollProgress } from "../hooks/useScrollProgress";
import stickerBlue from "@/assets/landing/sticker-blue.webp";
import stickerPurple from "@/assets/landing/sticker-purple.webp";
import stickerYellow from "@/assets/landing/sticker-yellow.webp";
import stickerPink from "@/assets/landing/sticker-pink.webp";
import noteCorner from "@/assets/landing/decor-note-corner.webp";
import notebook from "@/assets/landing/decor-notebook.webp";

/** Sizes are export px; left/top place the card on the 1064px column. */
interface Visual {
  src: string;
  bg: string;
  width: number;
  right: number;
  bottom: number;
  left: number;
  top: number;
  tilt: string;
}

const VISUALS: Record<StickerTone, Visual> = {
  blue: { src: stickerBlue, bg: "bg-landing-sticker-blue", width: 300, right: -6, bottom: -8, left: 20, top: 62, tilt: "-1.5deg" },
  purple: { src: stickerPurple, bg: "bg-brand-50", width: 300, right: 2, bottom: -6, left: 218, top: 0, tilt: "1.5deg" },
  yellow: { src: stickerYellow, bg: "bg-landing-sticker-cream", width: 360, right: -14, bottom: -10, left: 428, top: 58, tilt: "-1.5deg" },
  pink: { src: stickerPink, bg: "bg-landing-sticker-pink", width: 300, right: -4, bottom: -4, left: 664, top: 4, tilt: "1.5deg" },
};

const PIN_DISTANCE = 1600;
// Card i slides in over progress [START + i * GAP, START + i * GAP + SPAN].
const START = 0.04;
const GAP = 0.22;
const SPAN = 0.2;

// The decor sits outside the pinned box so it scrolls with the page, as in the demo.
export default function StickerCardsSection() {
  const pinRef = useRef<HTMLDivElement>(null);
  useScrollProgress(pinRef, { mode: "pinned" });

  return (
    <section
      aria-labelledby="landing-stickers-heading"
      className="relative overflow-x-clip bg-white xl:pb-[120px] motion-reduce:xl:pb-0"
    >
      <img
        src={noteCorner}
        alt=""
        loading="lazy"
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute -top-20 -right-4 z-10 hidden w-[192px] max-w-none select-none xl:block"
      />
      <img
        src={notebook}
        alt=""
        loading="lazy"
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute -bottom-[170px] -left-3 z-10 hidden w-[266px] max-w-none select-none xl:block"
      />

      <div
        ref={pinRef}
        style={{ "--pin": `${PIN_DISTANCE}px` } as CSSProperties}
        className="xl:h-[calc(100svh+var(--pin))] motion-reduce:xl:h-auto"
      >
        <div
          className={clsx(
            "relative pt-[120px] pb-[100px]",
            // Clears the sticky nav; up to the export's 200px on tall viewports.
            "xl:sticky xl:top-0 xl:h-svh xl:[--pt:clamp(120px,calc(100svh-860px),200px)] xl:pt-(--pt) xl:pb-0",
            "motion-reduce:xl:static",
          )}
        >
          <h2
            id="landing-stickers-heading"
            className={clsx(sectionHeading, "mx-auto max-w-[640px] px-page-mobile text-center sm:whitespace-pre-line")}
          >
            {STICKER_SECTION.heading}
          </h2>

          {/* From xl: a 1064 x 500 artboard in design px * 100cqw / 1064, capped to fit the pinned viewport. */}
          <div
            className={clsx(
              "mx-auto mt-[60px] w-full",
              "grid grid-cols-1 gap-6 px-page-mobile sm:grid-cols-2 sm:px-page-tablet",
              "xl:relative xl:block xl:aspect-[1064/500] xl:px-0 xl:[container-type:inline-size]",
              "xl:w-[min(var(--landing-w),max(1064px,calc((100svh-var(--pt)-197px)*1064/500)))]",
            )}
          >
            {STICKER_CARDS.map((card, index) => {
              const visual = VISUALS[card.id];
              return (
                <article
                  key={card.id}
                  style={
                    {
                      "--start": START + index * GAP,
                      "--span": SPAN,
                      "--tilt": visual.tilt,
                      "--x": visual.left,
                      "--y": visual.top,
                      "--r": visual.right,
                      "--b": visual.bottom,
                    } as CSSProperties
                  }
                  className={clsx(
                    "relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[40px] p-10",
                    "aspect-[400/432] sm:mx-0 sm:max-w-none",
                    "xl:landing-pin-item xl:absolute xl:mx-0",
                    "xl:top-[calc(var(--y)*100cqw/1064)] xl:left-[calc(var(--x)*100cqw/1064)]",
                    "xl:w-[calc(400*100cqw/1064)] xl:rounded-[calc(40*100cqw/1064)] xl:p-[calc(48*100cqw/1064)]",
                    "shadow-[0_12px_32px_rgb(16_16_29/0.06)] hover:z-10 hover:[--tilt-k:0]",
                    visual.bg,
                  )}
                >
                  <p className="relative z-10 max-w-[290px] font-landing-body text-[22px] leading-[1.15] font-medium tracking-[-0.01em] text-ink xl:max-w-[calc(290*100cqw/1064)] xl:text-[calc(26*100cqw/1064)]">
                    {card.copy}
                  </p>
                  <img
                    src={visual.src}
                    alt=""
                    aria-hidden
                    draggable={false}
                    loading="lazy"
                    style={{ width: `${(visual.width / 400) * 100}%` }}
                    className="pointer-events-none absolute right-[calc(var(--r)*1px)] bottom-[calc(var(--b)*1px)] max-w-none select-none xl:right-[calc(var(--r)*100cqw/1064)] xl:bottom-[calc(var(--b)*100cqw/1064)]"
                  />
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
