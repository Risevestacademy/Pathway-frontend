import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import { HOW_IT_WORKS, STEPS } from "../landing.copy";
import { eyebrow, sectionHeading } from "../landing.styles";
import stepCard from "@/assets/landing/step-card.webp";
import stepClip from "@/assets/landing/step-clip.webp";

/**
 * Mint band with a drag-to-scroll row of sticky-note cards. The row starts on
 * the content column and overflows the right edge, as in the export; dragging
 * is free (no snapping), matching the demo at 0:19 to 0:22.5.
 */
export default function HowItWorksSection() {
  const [viewportRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps",
    align: "start",
    skipSnaps: true,
  });

  return (
    <section
      id={HOW_IT_WORKS.anchor}
      aria-labelledby="landing-how-heading"
      className="scroll-mt-24 bg-landing-mint pt-[95px] pb-20"
    >
      <div className="px-page-mobile text-center">
        <p className={eyebrow}>{HOW_IT_WORKS.eyebrow}</p>
        <h2
          id="landing-how-heading"
          className={clsx(sectionHeading, "mx-auto mt-4 max-w-[560px] sm:whitespace-pre-line")}
        >
          {HOW_IT_WORKS.heading}
        </h2>
      </div>

      <div
        ref={viewportRef}
        role="region"
        aria-label="How it works, drag to see all steps"
        className="mt-14 cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <ol className="flex gap-5 pr-page-mobile pl-[max(var(--spacing-page-mobile),calc((100%-1064px)/2))]">
          {STEPS.map((step, index) => (
            <li
              key={step.id}
              className={clsx(
                "relative mt-6 h-[360px] w-[360px] shrink-0 select-none",
                "transition-transform duration-200 ease-out hover:scale-[1.04] motion-reduce:transition-none motion-reduce:hover:scale-100",
              )}
            >
              <img
                src={stepCard}
                alt=""
                aria-hidden
                draggable={false}
                className="absolute inset-0 size-full"
              />
              <img
                src={stepClip}
                alt=""
                aria-hidden
                draggable={false}
                className="absolute -top-6 left-[255px] w-[39px]"
              />
              <div className="relative px-14 pt-[70px]">
                <h3 className="font-landing-body text-2xl leading-[1.15] font-medium whitespace-pre-line text-ink">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-7 max-w-[170px] font-landing-body text-base leading-[1.6] text-ink">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
