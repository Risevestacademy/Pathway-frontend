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
      // From lg the card keeps at least the design's 1064 x 374 proportions, with the copy centred.
      className={clsx(
        "relative overflow-hidden rounded-[40px] border border-brand-300 bg-brand-50 px-6 py-12 sm:px-[54px] sm:py-[75px]",
        "lg:flex lg:aspect-[1064/374] lg:flex-col lg:justify-center",
      )}
    >
      {/* Below lg: the desktop composition as a strip across the top of the card. It bleeds to the
          card edges, so the card's top edge cuts the chain (as on desktop) and the wave runs off the
          right edge. It shows the design's x 560-1065 region; --u is one design px, capped so the
          strip stays at most 300px tall on wider cards, with the graphic anchored right. The height
          is the card's width (viewport minus page gutters) at 505:380, not aspect-ratio, because
          aspect-ratio with a max-height would shrink the strip's width too. */}
      <div
        aria-hidden
        className="pointer-events-none relative -mx-6 -mt-12 mb-4 h-[min(calc((100vw-2*var(--landing-gutter)-2px)*380/505),300px)] [container-type:inline-size] [--u:calc(min(100cqw,399px)/505)] sm:-mx-[54px] sm:-mt-[75px] lg:hidden"
      >
        <img
          src={wave}
          alt=""
          draggable={false}
          className="absolute top-[calc(120*var(--u))] right-0 w-[calc(438*var(--u))] max-w-none select-none"
        />
        <img
          src={keychain}
          alt=""
          draggable={false}
          className={clsx(
            "absolute top-[calc(-183*var(--u))] right-[calc(178*var(--u))] w-[calc(195*var(--u))] max-w-none origin-top select-none",
            "animate-landing-sway motion-reduce:animate-none",
            inView ? "running" : "paused",
          )}
        />
      </div>

      <div className="relative z-10 max-w-[520px]">
        <h2 id={headingId} className={clsx(sectionHeading, "max-w-[480px]")}>
          {heading}
        </h2>
        <p className="mt-6 max-w-[520px] font-landing-body text-base leading-6 text-grey-600">{subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
      </div>

      {/* Desktop: geometry measured from the demo, in design px * 100cqw / 1064. The layer covers
          the whole card (not just its padded content box), so the units scale with the full card
          width and the wave always ends at the card's right edge. The keychain's ring sits above
          the card (clipped), so the chain enters from the top edge and the P hangs over the wave. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden [container-type:inline-size] lg:block">
        <img
          src={wave}
          alt=""
          draggable={false}
          className="absolute top-[calc(120*100cqw/1064)] left-[calc(627*100cqw/1064)] w-[calc(438*100cqw/1064)] max-w-none select-none"
        />
        <img
          src={keychain}
          alt=""
          draggable={false}
          className={clsx(
            "absolute top-[calc(-183*100cqw/1064)] left-[calc(692*100cqw/1064)] w-[calc(195*100cqw/1064)] max-w-none origin-top select-none",
            "animate-landing-sway motion-reduce:animate-none",
            inView ? "running" : "paused",
          )}
        />
      </div>
    </div>
  );
}
