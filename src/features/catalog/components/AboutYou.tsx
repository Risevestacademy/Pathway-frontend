import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/stores/session";
import { useFields } from "../hooks/useFields";
import { HelperText } from "./HelperText";
import { OnboardingLayout, StepDots, StepHeader } from "./OnboardingLayout";
import { OnboardingSelect } from "./OnboardingSelect";
import { SkillsInput } from "./SkillsInput";

type AnswerKey = "degree" | "fieldOfStudy" | "yearsOfWork" | "internships";

interface SelectConfig {
  key: AnswerKey;
  label?: string;
  placeholder: string;
  options: string[];
  className?: string;
}

const SELECT_ROWS: { title: string; selects: SelectConfig[] }[] = [
  {
    title: "Education",
    selects: [
      {
        key: "degree",
        placeholder: "Degree",
        options: [
          "Secondary school",
          "Diploma / OND",
          "Bachelor's (in progress)",
          "Bachelor's",
          "Master's",
          "Other",
        ],
        className: "w-[151px] shrink-0",
      },
      {
        key: "fieldOfStudy",
        label: "Field of study",
        placeholder: "Field of study, e.g. Engineering",
        options: [
          "Computer Science",
          "Engineering",
          "Business",
          "Economics",
          "Health Sciences",
          "Law",
          "Arts and Humanities",
          "Social Sciences",
          "Natural Sciences",
          "Other",
        ],
      },
    ],
  },
  {
    title: "Experience",
    selects: [
      {
        key: "yearsOfWork",
        placeholder: "Years of work",
        options: ["None yet", "Less than 1 year", "1–2 years", "3–5 years"],
      },
      {
        key: "internships",
        placeholder: "Internships",
        options: ["None", "1", "2", "3 or more"],
      },
    ],
  },
];

const EMPTY_ANSWERS: Record<AnswerKey, string> = {
  degree: "",
  fieldOfStudy: "",
  yearsOfWork: "",
  internships: "",
};

const SKILL_OPTIONS = [
  "JavaScript",
  "Python",
  "SQL",
  "Excel",
  "Design",
  "Communication",
];
const MAX_SKILLS = 5;
const NO_INTEREST = "none";
const LABEL_CLASS = "text-body-lg-bold text-ink";

const toOptions = (items: string[]) =>
  items.map((item) => ({ value: item, label: item }));

export default function AboutYou() {
  const profile = useSession();
  const navigate = useNavigate();
  const fields = useFields();

  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [interest, setInterest] = useState<string | null>(profile.interest);

  const hasInput =
    Object.values(answers).some(Boolean) || skills.length > 0 || !!interest;

  const submit = () => {
    profile.setSkills(skills);
    profile.setInterest(interest);
    navigate({ to: "/careers" });
  };

  const skip = () => {
    profile.clearOptional();
    navigate({ to: "/careers" });
  };

  const interestOptions = [
    { value: NO_INTEREST, label: "No preference" },
    ...(fields.data ?? []).map((f) => ({ value: f.slug, label: f.name })),
  ];

  const interestPlaceholder = fields.isPending
    ? "Loading fields…"
    : fields.isError
      ? "Couldn’t load fields"
      : "Add an interest";

  return (
    <OnboardingLayout step={2}>
      <StepHeader
        step={2}
        titleId="about-heading"
        title="Tell us a bit more..."
        description="Add any of these to see careers that fit you best, or skip to browse everything."
      />

      <div className="flex flex-col gap-4">
        {SELECT_ROWS.map(({ title, selects }) => (
          <Field key={title} label={title}>
            <div className="flex gap-1">
              {selects.map(({ key, label, placeholder, options, className }) => (
                <OnboardingSelect
                  key={key}
                  label={label}
                  placeholder={placeholder}
                  value={answers[key]}
                  onValueChange={(value) =>
                    setAnswers((prev) => ({ ...prev, [key]: value }))
                  }
                  options={toOptions(options)}
                  className={className ?? "min-w-0 flex-1"}
                />
              ))}
            </div>
          </Field>
        ))}

        <Field label="Skills">
          <SkillsInput
            values={skills}
            options={SKILL_OPTIONS}
            max={MAX_SKILLS}
            onChange={setSkills}
          />
        </Field>

        <div>
          <label
            htmlFor="career-interest"
            className={`${LABEL_CLASS} flex items-baseline gap-2`}
          >
            Career interests
            <span className="font-medium text-[#ADADAD]">Optional</span>
          </label>
          <div className="mt-2">
            <OnboardingSelect
              id="career-interest"
              className="w-full"
              placeholder={interestPlaceholder}
              value={interest ?? ""}
              onValueChange={(v) => setInterest(v === NO_INTEREST ? null : v)}
              options={interestOptions}
              disabled={!fields.data}
            />
          </div>
          {fields.isError ? (
            <HelperText role="alert" className="mt-1">
              We couldn’t load fields.{" "}
              <button
                type="button"
                onClick={() => fields.refetch()}
                className="focus-ring cursor-pointer font-semibold text-brand-600 underline"
              >
                Try again
              </button>
            </HelperText>
          ) : (
            <HelperText className="mt-1">Pick one interest for now</HelperText>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-stretch gap-2">
        <Button isPrimary={false} size="lg" onClick={skip} className="flex-1">
          Skip for now
        </Button>
        <Button size="lg" onClick={submit} disabled={!hasInput} className="flex-1">
          Show careers
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
    <fieldset>
      <legend className={LABEL_CLASS}>{label}</legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  );
}