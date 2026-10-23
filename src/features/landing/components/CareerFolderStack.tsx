import clsx from "clsx";
import type { CSSProperties } from "react";
import { CAREERS, CAREERS_SECTION, type CareerFolder, type CareerTone } from "../landing.copy";
import { sectionHeading, sectionSubtitle } from "../landing.styles";
import { FolderTab, FOLDER_TAB_HEIGHT } from "./FolderShape";
import { LandingLinkButton } from "./LandingButton";
import iconFullstack from "@/assets/landing/career-fullstack.svg";
import iconData from "@/assets/landing/career-data.svg";
import iconUx from "@/assets/landing/career-ux.svg";
import iconPm from "@/assets/landing/career-pm.svg";

/** Export geometry at the 1440 frame. */
const FOLDER_HEIGHT = 507;
const STEP = 157; // vertical offset between stacked folders (uniform, per design)
const NAV_CLEARANCE = 120; // nav bottom (96) + 24

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

/**
 * Scroll-driven stacking folders, pure CSS. Each folder is `position: sticky`
 * with a top offset that grows by STEP, so the next one slides over the
 * previous one's body and leaves its tab showing (demo 0:23.5 to 0:32).
 * Earlier folders are taller by the same steps so that every folder's bottom
 * edge lines up once stacked: they unstick together and the finished stack
 * scrolls away as one block instead of peeling apart.
 */
export default function CareerFolderStack() {
  return (
    <section aria-labelledby="landing-careers-heading" className="bg-white pt-[130px]">
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

      <div className="relative mt-[45px]">
        {CAREERS.map((career, index) => {
          const tone = TONES[career.tone];
          const last = CAREERS.length - 1;
          return (
            <article
              key={career.id}
              aria-labelledby={`landing-career-${career.id}`}
              style={
                {
                  top: NAV_CLEARANCE + index * STEP,
                  height: FOLDER_HEIGHT + (last - index) * STEP,
                } as CSSProperties
              }
              className={clsx(
                "sticky w-[calc(100%-80px)] max-w-[1360px]",
                index % 2 === 1 ? "ml-auto" : "mr-auto",
              )}
            >
              <FolderTab variant={index} />
              <div
                style={{ top: FOLDER_TAB_HEIGHT }}
                className={clsx("absolute inset-x-0 bottom-0", tone.body)}
              />

              <div className="absolute inset-x-[100px] top-[250px] flex items-center gap-10">
                <div
                  className={clsx("grid size-40 shrink-0 place-items-center rounded-[32px]", tone.tile)}
                >
                  <img src={ICONS[career.id]} alt="" aria-hidden draggable={false} className="size-[136px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    id={`landing-career-${career.id}`}
                    className="font-landing-body text-[32px] leading-tight font-medium text-ink"
                  >
                    {career.title}
                  </h3>
                  <p className="mt-2 font-landing-body text-lg text-grey-500">{career.description}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
