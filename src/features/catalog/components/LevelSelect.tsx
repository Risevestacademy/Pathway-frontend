import clsx from "clsx";
import { CheckRegular } from "@mingcute/react/core-regular";
import levelIcon from "@/assets/icons/level-icon.svg";
import levelIconSelected from "@/assets/icons/level-icon-selected.svg";
import { Button } from "@/components/ui/Button";
import { CAREER_LEVELS } from "@/types/career.types";
import { useSession } from "@/lib/stores/session";
import { HelperText } from "./HelperText";
import { OnboardingLayout, StepDots, StepHeader } from "./OnboardingLayout";

interface LevelSelectProps {
  onContinue: () => void;
}

export default function LevelSelect({ onContinue }: LevelSelectProps) {
  const { level, setLevel } = useSession();

  return (
    <OnboardingLayout step={1}>
      <StepHeader
        step={1}
        titleId="level-heading"
        title="Where are you in your career?"
        description="We'll put the most relevant careers first. You can change this any time."
      />

      <div
        role="radiogroup"
        aria-labelledby="level-heading"
        className="flex flex-col gap-2"
      >
        {CAREER_LEVELS.map((l) => {
          const active = level === l.id;
          return (
            <label
              key={l.id}
              className={clsx(
                "flex cursor-pointer items-center gap-3 rounded-2xl border border-b-4 p-4",
                "transition-[background-color,border-color] duration-200 motion-reduce:transition-none",
                "has-focus-visible:ring-2 has-focus-visible:ring-brand-500 has-focus-visible:ring-offset-2",
                active
                  ? "border-transparent border-b-brand-400 bg-brand-50"
                  : "border-grey-50 hover:bg-surface-muted",
              )}
            >
              <input
                type="radio"
                name="career-level"
                value={l.id}
                checked={active}
                onChange={() => setLevel(l.id)}
                className="sr-only"
              />
              <img
                src={active ? levelIconSelected : levelIcon}
                alt=""
                className="size-9 shrink-0"
              />
              <span className="flex flex-1 flex-col gap-1">
                <span className="text-body-lg-bold text-ink">{l.label}</span>
                <span
                  className={clsx(
                    "text-body-md",
                    active ? "text-brand-600" : "text-ink-muted",
                  )}
                >
                  {l.blurb}
                </span>
              </span>
              {active ? (
                <span
                  aria-hidden
                  className="grid size-5 shrink-0 animate-in place-items-center rounded-pill bg-brand-500 text-white duration-200 ease-out zoom-in-50 motion-reduce:animate-none"
                >
                  <CheckRegular size={14} />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="size-5 shrink-0 rounded-pill border-[1.5px] border-ink-subtle"
                />
              )}
            </label>
          );
        })}
      </div>

      <Button
        size="lg"
        disabled={!level}
        aria-describedby={level ? undefined : "level-hint"}
        onClick={onContinue}
        className="mt-6 w-full"
      >
        Next
      </Button>
      <p id="level-hint" className="sr-only">
        Choose an option to continue.
      </p>
      <HelperText className="mt-3 text-center">
        No account needed. Your answers are kept only for this browsing session.
      </HelperText>

      <StepDots step={1} />
    </OnboardingLayout>
  );
}