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

interface Visual {
  src: string;
  bg: string;
  /** Illustration box inside the card (1x export px). */
  width: number;
  right: number;
  bottom: number;
  /** Resting position on the 1064px column (1x export px) and tilt. */
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

/**
 * "Choosing a career" cards. Entry is scroll-scrubbed: the section writes its
 * progress to `--p`, each card derives its own window from `--i` (see the
 * `landing-scrub-card` utility in index.css).
 */
export default function StickerCardsSection() {
  const rowRef = useRef<HTMLDivElement>(null);
  // All four cards are settled by p = 0.75 (see the utility), which the row
  // reaches while the heading is still comfortably in view.
  useScrollProgress(rowRef, { start: 0.85, end: 0.45 });

  return (
    <section
      aria-labelledby="landing-stickers-heading"
      className="relative overflow-x-clip bg-white pt-[200px] pb-[170px]"
    >
      {/* Decor: green ruled note straddling the hero edge, notebook + pen bottom-left. */}
      <img
        src={noteCorner}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute -top-20 left-1/2 hidden w-[192px] max-w-none translate-x-[545px] select-none lg:block"
      />
      <img
        src={notebook}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute top-[645px] left-1/2 z-10 hidden w-[266px] max-w-none -translate-x-[730px] select-none lg:block"
      />

      <h2
        id="landing-stickers-heading"
        className={clsx(sectionHeading, "mx-auto max-w-[640px] px-page-mobile text-center sm:whitespace-pre-line")}
      >
        {STICKER_SECTION.heading}
      </h2>

      <div
        ref={rowRef}
        className="relative mx-auto mt-[60px] h-[500px] w-full max-w-[1064px]"
      >
        {STICKER_CARDS.map((card, index) => {
          const visual = VISUALS[card.id];
          return (
            <article
              key={card.id}
              style={
                {
                  "--i": index,
                  "--tilt": visual.tilt,
                  left: visual.left,
                  top: visual.top,
                } as CSSProperties
              }
              className={clsx(
                "landing-scrub-card absolute h-[432px] w-[400px] overflow-hidden rounded-[40px] p-12",
                "shadow-[0_12px_32px_rgb(16_16_29/0.06)]",
                visual.bg,
              )}
            >
              <p className="relative z-10 max-w-[290px] font-landing-body text-[26px] leading-[1.15] font-medium tracking-[-0.01em] text-ink">
                {card.copy}
              </p>
              <img
                src={visual.src}
                alt=""
                aria-hidden
                draggable={false}
                loading="lazy"
                style={{ width: visual.width, right: visual.right, bottom: visual.bottom }}
                className="pointer-events-none absolute max-w-none select-none"
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
