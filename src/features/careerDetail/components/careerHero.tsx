import { FlashRegular, MagicHatRegular } from "@mingcute/react/core-regular";
import type { ReactNode } from "react";
import heroCubes from "@/assets/images/discover-hero-cubes.svg";
import { TrackIcon } from "@/components/TrackIcon";
import type { Career } from "@/types/career.types";
import { Tag } from "@/features/skillCheck/components/Tag";
import type { TrackIconKey } from "@/features/skillCheck/skillCheck.types";
import type { HeroStats } from "../careerHero.placeholders";

export function CareerHero({
  career,
  icon,
  isActive,
  forStudents,
  stats,
  children,
}: {
  career: Career;
  icon: TrackIconKey | null;
  isActive: boolean;
  forStudents: boolean;
  stats: HeroStats;
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="career-heading"
      className="relative flex flex-col gap-6 overflow-hidden rounded-[24px] border border-grey-100 bg-surface p-6 sm:p-10 lg:min-h-[262px] lg:justify-center"
    >
      <div className="relative flex flex-col gap-4 lg:max-w-[55%]">
        {(forStudents || isActive) && (
          <ul className="flex flex-wrap gap-2">
            {forStudents && (
              <li>
                <Tag tone="warning" className="gap-1.5 text-sm! leading-5! font-medium!">
                  <MagicHatRegular aria-hidden size={16} />
                  Great for university students
                </Tag>
              </li>
            )}
            {isActive && (
              <li>
                <Tag tone="brand" className="gap-1.5 text-sm! leading-5! font-medium!">
                  <FlashRegular aria-hidden size={16} />
                  Active
                </Tag>
              </li>
            )}
          </ul>
        )}
        <div className="flex flex-col gap-2">
          <h1
            id="career-heading"
            className="font-display text-4xl leading-tight font-semibold text-ink lg:text-[2.5rem]"
          >
            {career.title}
          </h1>
          <p className="max-w-[65ch] text-base leading-5 text-grey-600">{career.description}</p>
        </div>
        {children}
      </div>

      {icon ? (
        <TrackIcon
          icon={icon}
          size={420}
          className="pointer-events-none absolute -right-16 -bottom-28 hidden select-none lg:block"
        />
      ) : (
        <img
          src={heroCubes}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-auto max-w-[45%] object-cover object-left select-none lg:block"
        />
      )}

      <dl className="relative grid w-full grid-cols-3 divide-x divide-grey-100 rounded-2xl bg-surface p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] sm:p-5 lg:absolute lg:right-10 lg:bottom-10 lg:w-auto lg:min-w-[328px]">
        <Stat label="Topics" value={String(stats.topics)} />
        <Stat label="Projects" value={String(stats.projects)} />
        <Stat label="Progress" value={`${stats.progress}%`} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-3 first:pl-0 last:pr-0 sm:px-4 sm:first:pl-0">
      <dt className="text-sm leading-5 text-grey-600 sm:text-base">{label}</dt>
      <dd className="font-display text-2xl leading-8 font-medium text-ink sm:text-[28px]">
        {value}
      </dd>
    </div>
  );
}
