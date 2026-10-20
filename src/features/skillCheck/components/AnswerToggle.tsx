import clsx from "clsx";
import { ANSWER_LABELS } from "../skillCheck.copy";
import type { SkillAnswer } from "../skillCheck.types";

const OPTIONS: SkillAnswer[] = ["HAVE", "NOT_YET", "NOT_SURE"];

const SELECTED_STYLES: Record<SkillAnswer, string> = {
  HAVE: "bg-success-50 text-success-700",
  NOT_YET: "bg-warning-50 text-warning-700",
  NOT_SURE: "bg-grey-100 text-grey-600",
};

export function AnswerToggle({
  skillId,
  skillName,
  value,
  onChange,
}: {
  skillId: string;
  skillName: string;
  value: SkillAnswer | undefined;
  onChange: (answer: SkillAnswer) => void;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">{`Your answer for ${skillName}`}</legend>
      <div className="flex gap-0.5 rounded-xl border border-grey-100 bg-surface p-0.75">
        {OPTIONS.map((option) => (
          <label key={option} className="relative flex-1 sm:flex-none">
            <input
              type="radio"
              name={`answer-${skillId}`}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span
              className={clsx(
                "block cursor-pointer rounded-lg px-3.5 py-1.5 text-center text-sm leading-5 font-medium transition-colors motion-reduce:transition-none",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-1",
                value === option
                  ? SELECTED_STYLES[option]
                  : "text-grey-500 hover:bg-grey-50",
              )}
            >
              {ANSWER_LABELS[option]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
