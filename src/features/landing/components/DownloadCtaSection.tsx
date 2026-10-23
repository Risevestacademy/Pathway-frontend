import clsx from "clsx";
import { useRef } from "react";
import { DOWNLOAD_CTA } from "../landing.copy";
import { container, sectionHeading } from "../landing.styles";
import { useInView } from "../hooks/useInView";
import { LandingAnchorButton } from "./LandingButton";
import appleLogo from "@/assets/landing/apple-logo.svg";
import googlePlayLogo from "@/assets/landing/google-play-logo.svg";
import wave from "@/assets/landing/cta-wave.svg";
import keychain from "@/assets/landing/cta-keychain.webp";

/**
 * Lavender download card. The keychain hangs from the card's top edge and
 * sways gently while the card is on screen (approved addition, not in the
 * demo); the pink wave is static and clipped by the card.
 */
export default function DownloadCtaSection() {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { rootMargin: "80px" });

  return (
    <section aria-labelledby="landing-cta-heading" className="bg-white pt-[110px]">
      <div className={container}>
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-[40px] border border-brand-100 bg-brand-50 px-6 py-12 sm:px-[54px] sm:py-[75px]"
        >
          <div className="relative z-10 max-w-[520px]">
            <h2 id="landing-cta-heading" className={clsx(sectionHeading, "max-w-[420px]")}>
              {DOWNLOAD_CTA.heading}
            </h2>
            <p className="mt-6 max-w-[520px] font-landing-body text-base leading-6 text-grey-600">
              {DOWNLOAD_CTA.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LandingAnchorButton href="#" aria-disabled="true">
                <img src={appleLogo} alt="" aria-hidden className="size-5" />
                {DOWNLOAD_CTA.ios}
              </LandingAnchorButton>
              <LandingAnchorButton href="#" aria-disabled="true" variant="secondary" className="text-brand-500">
                <img src={googlePlayLogo} alt="" aria-hidden className="size-5" />
                {DOWNLOAD_CTA.android}
              </LandingAnchorButton>
            </div>
          </div>

          {/* Desktop: graphic sits at the export's position on the right. */}
          <img
            src={wave}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute top-[145px] left-[627px] hidden w-[438px] max-w-none select-none lg:block"
          />
          <img
            src={keychain}
            alt=""
            aria-hidden
            draggable={false}
            className={clsx(
              "pointer-events-none absolute -top-[30px] left-[777px] hidden h-[340px] w-auto max-w-none origin-top select-none lg:block",
              "animate-landing-sway motion-reduce:animate-none",
              inView ? "running" : "paused",
            )}
          />

          {/* Below lg: the same graphic stacked under the copy, scaled with the card. */}
          <div aria-hidden className="relative mt-10 h-[220px] overflow-hidden sm:h-[260px] lg:hidden">
            <img
              src={wave}
              alt=""
              draggable={false}
              className="pointer-events-none absolute top-[70px] left-1/2 w-[438px] max-w-none -translate-x-1/2 select-none"
            />
            <img
              src={keychain}
              alt=""
              draggable={false}
              className={clsx(
                "pointer-events-none absolute -top-10 left-1/2 h-[280px] w-auto max-w-none origin-top -translate-x-[40%] select-none",
                "animate-landing-sway motion-reduce:animate-none",
                inView ? "running" : "paused",
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
