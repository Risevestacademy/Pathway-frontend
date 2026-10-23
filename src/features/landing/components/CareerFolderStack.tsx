import clsx from "clsx";
import type { CSSProperties } from "react";
import { CAREERS, CAREERS_SECTION, type CareerFolder, type CareerTone } from "../landing.copy";
import { sectionHeading, sectionSubtitle } from "../landing.styles";
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

/**
 * Scroll-driven stacking folders, pure CSS. Each folder is `position: sticky`
 * with a top offset that grows by `--step`, so the next one slides over the
 * previous one's body and leaves its tab showing (demo 0:23.5 to 0:32).
 * Earlier folders are taller by the same steps so that every folder's bottom
 * edge lines up once stacked: they unstick together and the finished stack
 * scrolls away as one block instead of peeling apart.
 *
 * Geometry (export, 1440 frame): folder 507 tall, 157px step, nav clearance
 * 120. Smaller screens use a shorter step and a taller base so the wrapped
 * content still fits; both live in CSS variables on the article.
 */
export default function CareerFolderStack() {
  const last = CAREERS.length - 1;

  return (
    <section aria-labelledby="landing-careers-heading" className="bg-white pt-[100px] lg:pt-[130px]">
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
          return (
            <article
              key={career.id}
              aria-labelledby={`landing-career-${career.id}`}
              style={
                {
                  top: `calc(var(--nav-clearance) + ${index} * var(--step))`,
                  height: `calc(var(--folder-h) + ${last - index} * var(--step))`,
                } as CSSProperties
              }
              className={clsx(
                "sticky flex flex-col",
                "[--nav-clearance:100px] [--step:120px] [--folder-h:480px]",
                "lg:[--nav-clearance:120px] lg:[--step:157px] lg:[--folder-h:507px]",
                "w-[calc(100%-24px)] max-w-[1360px] lg:w-[calc(100%-80px)]",
                index % 2 === 1 ? "ml-auto" : "mr-auto",
              )}
            >
              <FolderTab variant={index} />
              <div className={clsx("relative flex-1 px-6 pt-8 sm:px-10 lg:px-[100px] lg:pt-20", tone.body)}>
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
    </section>
  );
}
