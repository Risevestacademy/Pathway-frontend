import type { SkillCheckSkill } from "../skillCheck.types";
import type { RatableSkill } from "./RateSkillsDialog";
import { Tag } from "./Tag";

/** Skills marked Have. Only these can carry a rating. */
export function HaveSkillsList({
  skills,
  ratings,
  onRate,
}: {
  skills: SkillCheckSkill[];
  ratings: Record<string, number>;
  onRate: (skill: RatableSkill) => void;
}) {
  if (skills.length === 0) return null;

  return (
    <section
      aria-labelledby="have-title"
      className="overflow-hidden rounded-[20px] border border-grey-100 bg-surface"
    >
      <div className="flex flex-col gap-0.5 px-6 py-5">
        <h2 id="have-title" className="font-display text-xl leading-6 font-medium text-ink">
          Skills you have
        </h2>
        <p className="text-sm leading-5 text-grey-600">
          Optional: rate how strong each one is. Only you see your ratings.
        </p>
      </div>
      <ul>
        {skills.map((skill) => {
          const rating = ratings[skill.id];
          return (
            <li
              key={skill.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-grey-100 px-6 py-4"
            >
              <p className="flex min-w-0 flex-wrap items-center gap-2 text-base leading-5 font-medium text-ink">
                {skill.name}
                {rating !== undefined && <Tag tone="success">{`${rating} of 5`}</Tag>}
              </p>
              <button
                type="button"
                onClick={() => onRate({ id: skill.id, name: skill.name, rating: rating ?? null })}
                className="focus-ring w-fit cursor-pointer rounded text-sm leading-5 text-grey-600 underline transition-colors duration-200 hover:text-ink motion-reduce:transition-none"
              >
                <span aria-hidden>{rating !== undefined ? "Update rating" : "Rate this skill"}</span>
                <span className="sr-only">{`${rating !== undefined ? "Update rating for" : "Rate"} ${skill.name}`}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
