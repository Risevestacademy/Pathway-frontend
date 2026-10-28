import { useSkillRatings } from "../hooks/useSkillCheck";
import { getRatingsForSkill } from "../rating.utils";
import type { SkillGap } from "../skillCheck.types";
import type { RatableSkill } from "./RateSkillsDialog";
import { Tag } from "./Tag";

export function SkillGapList({
  gaps,
  careerId,
  isRetakeChange,
  onRate,
}: {
  gaps: SkillGap[];
  careerId: string;
  isRetakeChange: boolean;
  onRate: (skill: RatableSkill) => void;
}) {
  const ratings = useSkillRatings().data ?? [];

  return (
    <section
      aria-labelledby="gaps-title"
      className="overflow-hidden rounded-[20px] border border-grey-100 bg-surface"
    >
      <div className="flex flex-col gap-0.5 bg-brand-50 px-6 py-5">
        <h2 id="gaps-title" className="font-display text-xl leading-6 font-medium text-ink">
          {isRetakeChange ? "Remaining skill gaps, in roadmap order" : "Skill gaps, in roadmap order"}
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
          {gaps.map((gap, index) => {
            const latest = getRatingsForSkill(ratings, careerId, gap.skill.id).at(-1);
            const ratedLabel = latest
              ? latest.value === "NOT_SURE"
                ? "Your rating: not sure"
                : `Your rating: ${latest.value} of 5`
              : null;
            return (
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
                    <Tag tone={gap.answer === "NOT_YET" ? "warning" : "neutral"}>
                      {gap.answer === "NOT_YET" ? "Not yet" : "Not sure"}
                    </Tag>
                  </p>
                  <p className="text-sm leading-5 text-grey-600">{gap.skill.reason}</p>
                  <p className="text-sm leading-5 font-medium text-brand-600">
                    Step {gap.step.order} · {gap.step.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRate({ id: gap.skill.id, name: gap.skill.name })}
                    className="focus-ring w-fit cursor-pointer rounded text-sm leading-5 text-grey-600 underline transition-colors duration-200 hover:text-ink motion-reduce:transition-none"
                  >
                    <span aria-hidden>{ratedLabel ? "Update rating" : "Rate this skill"}</span>
                    <span className="sr-only">{`${ratedLabel ? "Update rating for" : "Rate"} ${gap.skill.name}`}</span>
                  </button>
                  {ratedLabel && <p className="text-sm leading-5 text-grey-600">{ratedLabel}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
