import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { HOW_IT_WORKS, STEPS } from "../landing.copy";
import { eyebrow, sectionHeading } from "../landing.styles";
import stepCard from "@/assets/landing/step-card.webp";
import stepClip from "@/assets/landing/step-clip.webp";

const wheelGestures = [WheelGesturesPlugin()];

export default function HowItWorksSection() {
  const [viewportRef] = useEmblaCarousel(
    {
      dragFree: true,
      containScroll: "trimSnaps",
      align: "start",
      skipSnaps: true,
    },
    wheelGestures,
  );

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

      {/* Vertical padding keeps the paperclip and hover growth inside Embla's clipping viewport. */}
      <div
        ref={viewportRef}
        role="region"
        aria-label="How it works, drag to see all steps"
        className="mt-10 cursor-grab overflow-hidden pt-10 pb-6 active:cursor-grabbing"
      >
        <ol className="flex gap-5 pr-(--landing-gutter) pl-[calc((100%-var(--landing-w))/2)]">
          {STEPS.map((step, index) => (
            <li
              key={step.id}
              className={clsx(
                "relative h-[360px] w-[360px] shrink-0 origin-left select-none",
                // The margin matches the 8% growth so the cards after it are pushed along.
                "transition-[scale,margin] duration-300 ease-out hover:mr-[29px] hover:scale-[1.08]",
                "motion-reduce:transition-none motion-reduce:hover:mr-0 motion-reduce:hover:scale-100",
              )}
            >
              <img
                src={stepCard}
                alt=""
                loading="lazy"
                aria-hidden
                draggable={false}
                className="absolute inset-0 size-full"
              />
              <img
                src={stepClip}
                alt=""
                loading="lazy"
                aria-hidden
                draggable={false}
                className="absolute -top-6 left-[255px] w-[39px]"
              />
              <div className="relative px-14 pt-[70px]">
                <h3 className="font-landing-body text-[28px] leading-[1.15] font-medium whitespace-pre-line text-ink">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-6 max-w-[180px] font-landing-body text-[17px] leading-[1.55] text-ink">
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
