import type { SkillGap } from "../skillCheck.types";
import { Tag } from "./Tag";

export function SkillGapList({ gaps }: { gaps: SkillGap[] }) {
  return (
    <section
      aria-labelledby="gaps-title"
      className="overflow-hidden rounded-[20px] border border-grey-100 bg-surface"
    >
      <div className="flex flex-col gap-0.5 bg-brand-50 px-6 py-5">
        <h2 id="gaps-title" className="font-display text-xl leading-6 font-medium text-ink">
          Skill gaps, in roadmap order
        </h2>
        <p className="text-sm leading-5 text-grey-600">
          Each gap links to the step where you&rsquo;ll learn it.
        </p>
      </div>
      {gaps.length === 0 ? (
        <p className="border-t border-grey-100 px-6 py-4 text-base leading-5 text-grey-600">
          No gaps found. You marked every skill as Have.
        </p>
      ) : (
        <ol>
          {gaps.map((gap, index) => (
            <li
              key={gap.skill.id}
              className="flex items-start gap-4 border-t border-grey-100 px-6 py-4"
            >
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-lg border border-brand-200 bg-brand-100 text-sm leading-4 font-medium text-brand-700"
              >
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="flex flex-wrap items-center gap-2 text-base leading-5 font-medium text-ink">
                  {gap.skill.name}
                  <Tag tone={gap.answer === "DONT_HAVE" ? "warning" : "neutral"}>
                    {gap.answer === "DONT_HAVE" ? "Not yet" : "Not sure"}
                  </Tag>
                </p>
                <p className="text-sm leading-5 font-medium text-brand-600">
                  Step {gap.step.order} · {gap.step.title}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
