import clsx from "clsx";
import { useRef, type ReactNode } from "react";
import { sectionHeading } from "../landing.styles";
import { useInView } from "../hooks/useInView";
import wave from "@/assets/landing/cta-wave.svg";
import keychain from "@/assets/landing/cta-keychain.webp";

/**
 * Lavender promo card with the pink wave and the hanging keychain, used by the
 * landing download CTA and the "Not sure which career fits you?" CTA on the
 * explore pages. The keychain sways gently while the card is on screen; the
 * wave is static and clipped by the card.
 */
export default function PromoCard({
  headingId,
  heading,
  subtitle,
  actions,
}: {
  headingId: string;
  heading: string;
  subtitle: string;
  actions: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { rootMargin: "80px" });

  return (
    <div
      ref={cardRef}
      // From lg the card is a size container: the graphic is placed in design px * 100cqw / 1064,
      // and the card keeps at least the design's 1064 x 374 proportions, with the copy centred.
      className={clsx(
        "relative overflow-hidden rounded-[40px] border border-brand-300 bg-brand-50 px-6 py-12 sm:px-[54px] sm:py-[75px]",
        "lg:flex lg:aspect-[1064/374] lg:flex-col lg:justify-center lg:[container-type:inline-size]",
      )}
    >
      <div className="relative z-10 max-w-[520px]">
        <h2 id={headingId} className={clsx(sectionHeading, "max-w-[480px]")}>
          {heading}
        </h2>
        <p className="mt-6 max-w-[520px] font-landing-body text-base leading-6 text-grey-600">{subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
      </div>

      {/* Desktop: geometry measured from the demo. The keychain's ring sits above the card
          (clipped), so the chain enters from the top edge and the P hangs over the wave. */}
      <img
        src={wave}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute top-[calc(120*100cqw/1064)] left-[calc(627*100cqw/1064)] hidden w-[calc(438*100cqw/1064)] max-w-none select-none lg:block"
      />
      <img
        src={keychain}
        alt=""
        aria-hidden
        draggable={false}
        className={clsx(
          "pointer-events-none absolute top-[calc(-183*100cqw/1064)] left-[calc(692*100cqw/1064)] hidden w-[calc(195*100cqw/1064)] max-w-none origin-top select-none lg:block",
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
  );
}
