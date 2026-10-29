import clsx from "clsx";
import { useRef, type ReactNode } from "react";
import { sectionHeading } from "../landing.styles";
import { useInView } from "../hooks/useInView";
import wave from "@/assets/landing/cta-wave.svg";
import keychain from "@/assets/landing/cta-keychain.webp";

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
      className={clsx(
        "relative overflow-hidden rounded-[40px] border border-brand-300 bg-brand-50 px-6 py-12 sm:px-[54px] sm:py-[75px]",
        "lg:flex lg:aspect-[1064/374] lg:flex-col lg:justify-center",
      )}
    >
      {/* Mobile: the design's x 560-1065 region as a top strip; --u is one design px. The height is
          computed, since aspect-ratio under a max-height would also shrink the width. */}
      <div
        aria-hidden
        className="pointer-events-none relative -mx-6 -mt-12 mb-4 h-[min(calc((100vw-2*var(--landing-gutter)-2px)*380/505),300px)] [container-type:inline-size] [--u:calc(min(100cqw,399px)/505)] sm:-mx-[54px] sm:-mt-[75px] lg:hidden"
      >
        <img
          src={wave}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute top-[calc(120*var(--u))] right-0 w-[calc(438*var(--u))] max-w-none select-none"
        />
        <img
          src={keychain}
          alt=""
          loading="lazy"
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

      {/* Covers the whole card, not its padded content box, so cqw scales with the full width and
          the wave ends at the right edge. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden [container-type:inline-size] lg:block">
        <img
          src={wave}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute top-[calc(120*100cqw/1064)] left-[calc(627*100cqw/1064)] w-[calc(438*100cqw/1064)] max-w-none select-none"
        />
        <img
          src={keychain}
          alt=""
          loading="lazy"
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
