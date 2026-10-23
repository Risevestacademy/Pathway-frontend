import clsx from "clsx";
import { HERO } from "../landing.copy";
import { container } from "../landing.styles";
import { LandingLinkButton } from "./LandingButton";
import briefcaseIcon from "@/assets/landing/hero-icon-briefcase.svg";
import sendIcon from "@/assets/landing/hero-icon-send.svg";
import cloudBack from "@/assets/landing/hero-cloud-back.webp";
import cloudFront from "@/assets/landing/hero-cloud-front.webp";
import card1 from "@/assets/landing/hero-card-1.webp";
import card2 from "@/assets/landing/hero-card-2.webp";
import card3 from "@/assets/landing/hero-card-3.webp";

/**
 * The three profile cards are pre-rotated exports. Positions are the 1440px
 * export coordinates relative to the 1440 x 470 stage that holds the cards
 * and the two cloud bands (stage top = export y 540).
 */
const CARDS = [
  { src: card3, width: 695, left: 285, top: 42, delay: "0ms" }, // back: Taiwo Talaricp
  { src: card2, width: 787, left: 326, top: 14, delay: "110ms" }, // middle: Ethel Chidera
  { src: card1, width: 876, left: 340, top: 115, delay: "220ms" }, // front: Taiwo Mufidat-Prince
] as const;

const rise = "animate-landing-fade-up motion-reduce:animate-none";

export default function HeroSection() {
  return (
    <section
      aria-labelledby="landing-hero-heading"
      className="relative overflow-hidden bg-white pt-20 lg:pt-[114px]"
    >
      <div className={clsx(container, "relative z-10 text-center")}>
        <h1
          id="landing-hero-heading"
          className={clsx(
            rise,
            "mx-auto max-w-[14ch] font-landing-display text-[2.75rem] leading-[1.05] font-bold tracking-[-0.02em] text-ink sm:text-[3.5rem] lg:text-[4rem]",
          )}
        >
          {HERO.headingStart}{" "}
          <img src={briefcaseIcon} alt="" aria-hidden className="inline-block size-[0.94em] align-[-0.12em]" />{" "}
          <span className="whitespace-nowrap">
            {HERO.headingEnd}{" "}
            <img src={sendIcon} alt="" aria-hidden className="inline-block size-[0.94em] align-[-0.12em]" />
          </span>
        </h1>
        <p
          className={clsx(
            rise,
            "mx-auto mt-6 max-w-[430px] font-landing-body text-lg leading-7 text-ink-subtle [animation-delay:80ms]",
          )}
        >
          {HERO.subtitle}
        </p>
        <div className={clsx(rise, "mt-10 flex flex-wrap items-center justify-center gap-3 [animation-delay:160ms]")}>
          <LandingLinkButton to="/careers" variant="secondary">
            {HERO.explore}
          </LandingLinkButton>
          <LandingLinkButton to="/careers/onboarding">{HERO.getStarted}</LandingLinkButton>
        </div>
      </div>

      {/* Stage: clouds + cards. Fixed 1440px artboard, centred and cropped on narrower screens. */}
      <div aria-hidden className="relative mt-8 h-[470px] w-full overflow-hidden lg:mt-10">
        <div className="absolute left-1/2 h-full w-[1440px] -translate-x-1/2">
          <img
            src={cloudBack}
            alt=""
            draggable={false}
            className="absolute bottom-0 left-0 w-[1440px] max-w-none select-none"
          />
          {CARDS.map((card) => (
            <img
              key={card.src}
              src={card.src}
              alt=""
              draggable={false}
              style={{ width: card.width, left: card.left, top: card.top, animationDelay: card.delay }}
              className="absolute max-w-none select-none animate-landing-card-rise motion-reduce:animate-none"
            />
          ))}
          <img
            src={cloudFront}
            alt=""
            draggable={false}
            className="absolute bottom-0 left-0 w-[1440px] max-w-none select-none"
          />
        </div>
      </div>
    </section>
  );
}
