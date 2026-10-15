import clsx from "clsx";
import { useNavigate } from "@tanstack/react-router";
import { CheckRegular } from "@mingcute/react/core-regular";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/stores/session";
import {
  GOAL_OPTIONS,
  SKILL_CHIP_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
} from "../onboarding.mock";
import { HelperText } from "./HelperText";
import { OnboardingLayout, StepDots, StepHeader } from "./OnboardingLayout";
import { OnboardingSelect } from "./OnboardingSelect";

const LABEL_CLASS = "text-body-lg-bold text-ink";
const NO_PREFERENCE = "none";
const NO_PREFERENCE_OPTION = { value: NO_PREFERENCE, label: "No preference" };
const goalOptions = [NO_PREFERENCE_OPTION, ...GOAL_OPTIONS];
const timeCommitmentOptions = [
  NO_PREFERENCE_OPTION,
  ...TIME_COMMITMENT_OPTIONS,
];

export default function GoalsStep() {
  const profile = useSession();
  const navigate = useNavigate();

  const toggleStrength = (value: string) => {
    profile.setStrengths(
      profile.strengths.includes(value)
        ? profile.strengths.filter((v) => v !== value)
        : [...profile.strengths, value],
    );
  };

  const skip = () => {
    profile.clearGoals();
    navigate({ to: "/careers" });
  };

  const showCareers = () => {
    navigate({ to: "/careers" });
  };

  return (
    <OnboardingLayout step={3}>
      <StepHeader
        step={3}
        titleId="goals-heading"
        title="Tell us a bit more..."
        description="Tell us more about your career interests"
      />

      <div className="flex flex-col gap-4">
        <fieldset className="min-w-0" aria-describedby="strengths-hint">
          <legend className={LABEL_CLASS}>Skills Required</legend>
          <div className="mt-2 flex flex-wrap gap-2 rounded-lg border-[1.33px] border-grey-50 bg-surface px-3.5 py-1.5">
            {SKILL_CHIP_OPTIONS.map((option) => {
              const selected = profile.strengths.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={clsx(
                    "inline-flex h-7 cursor-pointer items-center gap-1 rounded-[4px] pr-1 pl-2 text-xs font-semibold transition-colors motion-reduce:transition-none",
                    "has-focus-visible:ring-2 has-focus-visible:ring-brand-500 has-focus-visible:ring-offset-2",
                    selected
                      ? "bg-brand-100 text-brand-700"
                      : "text-ink-muted hover:bg-surface-muted",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleStrength(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                  <span
                    aria-hidden
                    className={clsx(
                      "grid size-3.5 shrink-0 place-items-center rounded-pill border-[1.67px]",
                      selected
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-ink-muted",
                    )}
                  >
                    {selected && <CheckRegular size={10} />}
                  </span>
                </label>
              );
            })}
          </div>
          <HelperText id="strengths-hint" className="mt-2">
            Pick skills you currently have
          </HelperText>
        </fieldset>

        <div>
          <label
            htmlFor="career-goal"
            className={`${LABEL_CLASS} flex items-baseline gap-2`}
          >
            Goals
            <span className="text-body-sm font-semibold text-ink-muted">
              (Optional)
            </span>
          </label>
          <div className="mt-2">
            <OnboardingSelect
              id="career-goal"
              className="w-full"
              placeholder="Select possible goals for career interests"
              value={profile.goal ?? ""}
              onValueChange={(value) =>
                profile.setGoal(value === NO_PREFERENCE ? null : value)
              }
              options={goalOptions}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="time-commitment"
            className={`${LABEL_CLASS} flex items-baseline gap-2`}
          >
            Roadmap
            <span className="text-body-sm font-semibold text-ink-muted">
              (Optional)
            </span>
          </label>
          <div className="mt-2">
            <OnboardingSelect
              id="time-commitment"
              className="w-full"
              placeholder="Select time commitment to your pathway"
              value={profile.timeCommitment ?? ""}
              onValueChange={(value) =>
                profile.setTimeCommitment(
                  value === NO_PREFERENCE ? null : value,
                )
              }
              options={timeCommitmentOptions}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-stretch gap-2">
        <Button isPrimary={false} size="lg" onClick={skip} className="flex-1">
          Skip for now
        </Button>
        <Button size="lg" onClick={showCareers} className="flex-1">
          Show careers
        </Button>
      </div>

      <div className="mt-3">
        <StepDots step={3} />
      </div>
    </OnboardingLayout>
  );
}