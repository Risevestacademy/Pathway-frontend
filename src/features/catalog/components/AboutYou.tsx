import { useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AddRegular, CloseRegular } from "@mingcute/react/core-regular";
import { Button } from "@/components/ui/Button";
import { MAX_EXPERIENCE_ENTRIES, useSession } from "@/lib/stores/session";
import type { OnboardingOption } from "../catalog.types";
import { useOnboardingOptions } from "../hooks/useOnboardingOptions";
import { FIELD_OF_STUDY_OPTIONS, JOB_TYPE_OPTIONS } from "../onboarding.mock";
import { HelperText } from "./HelperText";
import { OnboardingLayout, StepDots, StepHeader } from "./OnboardingLayout";
import { OnboardingSelect } from "./OnboardingSelect";
import { SkillsInput } from "./SkillsInput";

const MAX_SKILLS = 5;
const NO_INTEREST = "none";
const LABEL_CLASS = "text-body-lg-bold text-ink";
const EMPTY_OPTIONS: OnboardingOption[] = [];

export default function AboutYou() {
  const profile = useSession();
  const navigate = useNavigate();
  const options = useOnboardingOptions();
  const [cvNoticeVisible, setCvNoticeVisible] = useState(false);
  const experienceRef = useRef<HTMLDivElement>(null);

  const data = options.data;
  const ready = Boolean(data);
  const skillOptions = (data?.skills ?? []).map((skill) => ({
    value: skill.id,
    label: skill.name,
  }));
  const interestOptions = [
    { value: NO_INTEREST, label: "No preference" },
    ...(data?.fields ?? []).map((field) => ({
      value: field.slug,
      label: field.name,
    })),
  ];
  const interestPlaceholder = options.isPending
    ? "Loading fields…"
    : options.isError
      ? "Couldn’t load fields"
      : "Pick a field you are interested in";
  const atMaxExperience = profile.experience.length >= MAX_EXPERIENCE_ENTRIES;
  const hasSeveralEntries = profile.experience.length > 1;

  const skip = () => {
    profile.clearOptional();
    navigate({ to: "/careers" });
  };

  const next = () => {
    navigate({ to: "/careers/onboarding/goals" });
  };

  const removeEntry = (index: number) => {
    profile.removeExperience(index);
    experienceRef.current?.focus();
  };

  return (
    <OnboardingLayout step={2}>
      <StepHeader
        step={2}
        titleId="about-heading"
        title="Tell us a bit more..."
        description="Add any of these to see careers that fit you best, or skip to browse everything."
      />

      {options.isError && (
        <HelperText role="alert" className="mb-4">
          We couldn’t load the options.{" "}
          <button
            type="button"
            onClick={() => options.refetch()}
            className="focus-ring cursor-pointer font-semibold text-brand-600 underline"
          >
            Try again
          </button>
        </HelperText>
      )}

      <div className="flex flex-col gap-4" aria-busy={options.isPending}>
        <Field label="Education">
          <div className="flex gap-1">
            <OnboardingSelect
              label="Degree"
              placeholder="Degree"
              value={profile.degree ?? ""}
              onValueChange={profile.setDegree}
              options={data?.educationLevels ?? EMPTY_OPTIONS}
              disabled={!ready}
              className="w-[151px] shrink-0"
            />
            <OnboardingSelect
              label="Field of study"
              placeholder="Field of study, e.g. Engineering"
              value={profile.fieldOfStudy ?? ""}
              onValueChange={profile.setFieldOfStudy}
              options={FIELD_OF_STUDY_OPTIONS}
              className="min-w-0 flex-1"
            />
          </div>
        </Field>

        <Field label="Skills">
          <SkillsInput
            values={profile.skills}
            options={skillOptions}
            max={MAX_SKILLS}
            onChange={profile.setSkills}
            disabled={!ready}
          />
        </Field>

        <div>
          <label
            htmlFor="career-interest"
            className={`${LABEL_CLASS} flex items-baseline gap-2`}
          >
            Career interests
            <span className="text-body-sm font-semibold text-ink-muted">
              (Optional)
            </span>
          </label>
          <div className="mt-2">
            <OnboardingSelect
              id="career-interest"
              className="w-full"
              placeholder={interestPlaceholder}
              value={profile.interest ?? ""}
              onValueChange={(value) =>
                profile.setInterest(value === NO_INTEREST ? null : value)
              }
              options={interestOptions}
              disabled={!ready}
            />
          </div>
        </div>

        <div
          ref={experienceRef}
          tabIndex={-1}
          role="group"
          aria-labelledby="experience-heading"
          className="focus-ring rounded-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span id="experience-heading" className={LABEL_CLASS}>
                Experience
              </span>
              <button
                type="button"
                onClick={() => setCvNoticeVisible(true)}
                className="focus-ring cursor-pointer rounded-xs text-body-sm font-medium text-brand-600 underline hover:text-brand-700"
              >
                import cv
              </button>
            </div>
            <button
              type="button"
              aria-label="Add another experience"
              onClick={profile.addExperience}
              disabled={atMaxExperience}
              className="focus-ring inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-b-4 border-grey-50 p-1 text-ink-muted hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AddRegular size={16} aria-hidden />
            </button>
          </div>

          <div role="status">
            {cvNoticeVisible && (
              <HelperText className="mt-1">
                CV import isn’t available yet. You can add your experience
                below.
              </HelperText>
            )}
          </div>

          <div className="mt-2 flex flex-col gap-1">
            {profile.experience.map((entry, index) => {
              const suffix = hasSeveralEntries ? `, entry ${index + 1}` : "";
              return (
                <div key={entry.id} className="flex gap-1">
                  <OnboardingSelect
                    label={`Years of work${suffix}`}
                    placeholder="Years of work"
                    value={entry.years ?? ""}
                    onValueChange={(years) =>
                      profile.updateExperience(index, { years })
                    }
                    options={data?.experienceOptions ?? EMPTY_OPTIONS}
                    disabled={!ready}
                    className="min-w-0 flex-1"
                  />
                  <OnboardingSelect
                    label={`Job type${suffix}`}
                    placeholder="Job type"
                    value={entry.jobType ?? ""}
                    onValueChange={(jobType) =>
                      profile.updateExperience(index, { jobType })
                    }
                    options={JOB_TYPE_OPTIONS}
                    className="min-w-0 flex-1"
                  />
                  {hasSeveralEntries && (
                    <button
                      type="button"
                      aria-label={`Remove experience entry ${index + 1}`}
                      onClick={() => removeEntry(index)}
                      className="focus-ring grid size-10.5 shrink-0 cursor-pointer place-items-center rounded-lg border-[1.33px] border-grey-50 text-ink-muted hover:border-grey-100 hover:text-ink"
                    >
                      <CloseRegular size={16} aria-hidden />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {atMaxExperience && (
            <HelperText className="mt-1">
              You can add up to {MAX_EXPERIENCE_ENTRIES} experiences
            </HelperText>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-stretch gap-2">
        <Button isPrimary={false} size="lg" onClick={skip} className="flex-1">
          Skip for now
        </Button>
        <Button size="lg" onClick={next} className="flex-1">
          Next
        </Button>
      </div>

      <div className="mt-3">
        <StepDots step={2} />
      </div>
    </OnboardingLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className={LABEL_CLASS}>{label}</legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  );
}