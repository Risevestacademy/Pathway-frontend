import clsx from "clsx";
import { useRef, type CSSProperties } from "react";
import { CAREERS, CAREERS_SECTION, type CareerFolder, type CareerTone } from "../landing.copy";
import { sectionHeading, sectionSubtitle } from "../landing.styles";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { FolderTab } from "./FolderShape";
import { LandingLinkButton } from "./LandingButton";
import iconFullstack from "@/assets/landing/career-fullstack.svg";
import iconData from "@/assets/landing/career-data.svg";
import iconUx from "@/assets/landing/career-ux.svg";
import iconPm from "@/assets/landing/career-pm.svg";

const ICONS: Record<CareerFolder["id"], string> = {
  fullstack: iconFullstack,
  data: iconData,
  ux: iconUx,
  pm: iconPm,
};

const TONES: Record<CareerTone, { body: string; tile: string; chip: string }> = {
  peach: { body: "bg-landing-folder-peach", tile: "bg-[#fcdccb]", chip: "bg-[#f48e52]" },
  white: { body: "border-x border-b border-grey-100 bg-white", tile: "bg-[#fbeec4]", chip: "bg-landing-yellow" },
  green: { body: "border-x border-b border-landing-folder-green-line bg-landing-folder-green", tile: "bg-[#e3f0c8]", chip: "bg-landing-leaf" },
  lavender: { body: "border-x border-b border-grey-100 bg-brand-50", tile: "bg-brand-100", chip: "bg-brand-500" },
};

/** Extra scroll travel while the stack is pinned (md and up). */
const PIN_DISTANCE = 2200;
/**
 * Folder 0 is in place from the start. Folder i (i >= 1) slides in over
 * progress [0.06 + (i - 1) * 0.33, +0.25]; the gaps between windows are the
 * pauses where each folder sits fully visible before the next one moves.
 */
const startFor = (index: number) => (index === 0 ? -1 : 0.06 + (index - 1) * 0.33);
const SPAN = 0.25;

/**
 * Scroll-driven stacking folders (demo 0:23.5 to 0:32). From `md` the section
 * pins a 100svh box and each folder slides up from below the viewport to its
 * resting offset, one at a time and fully reversible; the finished stack then
 * scrolls away as one block. The step between folders shrinks on short
 * viewports so every folder's content is visible before the next one starts.
 * Below `md` the folders are static blocks in normal flow.
 */
export default function CareerFolderStack() {
  const pinRef = useRef<HTMLDivElement>(null);
  useScrollProgress(pinRef, { mode: "pinned" });

  return (
    <section aria-labelledby="landing-careers-heading" className="overflow-x-clip bg-white pt-[100px] lg:pt-[130px]">
      <div className="px-page-mobile text-center">
        <h2
          id="landing-careers-heading"
          className={clsx(sectionHeading, "mx-auto max-w-[520px] sm:whitespace-pre-line")}
        >
          {CAREERS_SECTION.heading}
        </h2>
        <p className={clsx(sectionSubtitle, "mx-auto mt-6 max-w-[380px] sm:whitespace-pre-line")}>
          {CAREERS_SECTION.subtitle}
        </p>
      </div>

      <div
        ref={pinRef}
        style={{ "--pin": `${PIN_DISTANCE}px` } as CSSProperties}
        className={clsx(
          "relative mt-[45px]",
          // Folder 0 rests `--nav` below the box top; pull the box up so it sits 45px under the heading pre-pin.
          "md:mt-[calc(45px-var(--nav))] md:h-[calc(100svh+var(--pin))] motion-reduce:md:h-auto",
          "[--nav:100px] lg:[--nav:120px]",
          "[--step:clamp(80px,calc((100svh-560px)/3),157px)]",
        )}
      >
        <div className="flex flex-col gap-6 md:sticky md:top-0 md:block md:h-svh motion-reduce:md:static">
          {CAREERS.map((career, index) => {
            const tone = TONES[career.tone];
            return (
              <article
                key={career.id}
                aria-labelledby={`landing-career-${career.id}`}
                style={
                  {
                    "--top": `calc(var(--nav) + ${index} * var(--step))`,
                    "--start": startFor(index),
                    "--span": SPAN,
                  } as CSSProperties
                }
                className={clsx(
                  "relative flex w-full flex-col",
                  "md:landing-pin-item md:absolute md:top-(--top) md:h-[calc(100svh-var(--top))]",
                  // No max width: the alternating inset must stay 80px so a folder always covers the previous one's content.
                  "md:w-[calc(100%-24px)] lg:w-[calc(100%-80px)]",
                  index % 2 === 1 ? "md:right-0" : "md:left-0",
                )}
              >
                <FolderTab variant={index} />
                <div
                  className={clsx(
                    "relative flex-1 px-6 pt-8 pb-10 sm:px-10 lg:px-[100px] lg:pt-10 [@media(min-height:1000px)]:lg:pt-20",
                    tone.body,
                  )}
                >
                  <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:gap-10">
                    <div
                      className={clsx(
                        "grid size-24 shrink-0 place-items-center rounded-[20px] lg:size-40 lg:rounded-[32px]",
                        tone.tile,
                      )}
                    >
                      <img
                        src={ICONS[career.id]}
                        alt=""
                        aria-hidden
                        draggable={false}
                        className="size-[82px] lg:size-[136px]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        id={`landing-career-${career.id}`}
                        className="font-landing-body text-2xl leading-tight font-medium text-ink lg:text-[32px]"
                      >
                        {career.title}
                      </h3>
                      <p className="mt-2 font-landing-body text-base text-grey-500 lg:text-lg">
                        {career.description}
                      </p>
                      <ul className="mt-5 flex flex-wrap gap-2 lg:mt-6">
                        {career.chips.map((chip) => (
                          <li
                            key={chip}
                            className={clsx(
                              "rounded-[10px] px-3 py-2 font-landing-body text-[15px] leading-none text-white",
                              tone.chip,
                            )}
                          >
                            {chip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <LandingLinkButton to="/careers" variant="secondary" className="shrink-0">
                      {CAREERS_SECTION.cta}
                      <span className="sr-only">: {career.title}</span>
                    </LandingLinkButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
