import { useState } from "react";
import { SkillButton } from "./SkillButton";
import { Modal } from "../../../components/ui/Modal";
import { useSkillRatings } from "../hooks/useSkillCheck";
import { useSaveSkillRating } from "../hooks/useSkillCheckActions";
import { getRatingsForSkill, getRatingTrend } from "../rating.utils";
import { RATING_LABELS } from "../skillCheck.mock";
import type { RatingValue, SkillRating } from "../skillCheck.types";
import { RatingOption } from "./RatingOption";
import { Tag } from "./Tag";

type Choice = RatingValue | "NOT_SURE";

const VALUES: RatingValue[] = [0, 1, 2, 3, 4, 5];

export interface RatableSkill {
  id: string;
  name: string;
}

export function RateSkillsDialog({
  open,
  careerId,
  title = "Rate your skills",
  tag,
  skills,
  onClose,
  onSaved,
}: {
  open: boolean;
  careerId: string;
  title?: string;
  tag?: string;
  skills: RatableSkill[];
  onClose: () => void;
  onSaved?: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      className="max-w-140"
      description="Optional. This is your own view of your skill, not a test or a certification."
    >
      {open && tag && <Tag tone="success" className="-mb-2 px-2 font-medium">{tag}</Tag>}
      {open && (
        <RateForm
          careerId={careerId}
          skills={skills}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Modal>
  );
}

function trendText(ratings: SkillRating[], careerId: string, skillId: string): string | null {
  const trend = getRatingTrend(getRatingsForSkill(ratings, careerId, skillId));
  if (trend.kind === "baseline") return `Last time you rated this ${trend.value} of 5.`;
  if (trend.kind === "change") return `Your last two ratings: ${trend.from}, then ${trend.to}.`;
  return null;
}

function RateForm({
  careerId,
  skills,
  onClose,
  onSaved,
}: {
  careerId: string;
  skills: RatableSkill[];
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [failed, setFailed] = useState(false);
  const ratings = useSkillRatings();
  const save = useSaveSkillRating(careerId);
  const chosen = Object.entries(choices);

  const submit = async () => {
    setFailed(false);
    try {
      for (const [skillId, value] of chosen) {
        await save.mutateAsync({ skillId, value });
      }
      onSaved?.();
      onClose();
    } catch {
      setFailed(true);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5">
        {skills.map((skill) => {
          const name = `rating-${skill.id}`;
          const note = ratings.data ? trendText(ratings.data, careerId, skill.id) : null;
          return (
            <fieldset key={skill.id} className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className="mb-1 text-base leading-5 font-medium text-ink">
                {skill.name}
              </legend>
              {note && <p className="text-sm leading-5 text-grey-600">{note}</p>}
              {VALUES.map((value) => (
                <RatingOption
                  key={value}
                  name={name}
                  value={String(value)}
                  prefix={`${value}:`}
                  label={RATING_LABELS[value]}
                  checked={choices[skill.id] === value}
                  onSelect={() => setChoices((prev) => ({ ...prev, [skill.id]: value }))}
                />
              ))}
              <div aria-hidden className="h-px bg-grey-100" />
              <RatingOption
                name={name}
                value="NOT_SURE"
                prefix="Not sure:"
                label="I would rather not rate this one"
                checked={choices[skill.id] === "NOT_SURE"}
                onSelect={() => setChoices((prev) => ({ ...prev, [skill.id]: "NOT_SURE" }))}
              />
            </fieldset>
          );
        })}
      </div>
      {failed && (
        <p
          role="alert"
          className="rounded-xl border border-danger-600/30 bg-danger-50 px-4 py-3 text-sm leading-5 text-danger-700"
        >
          Your rating did not save. Try again, or skip for now.
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <SkillButton isPrimary={false} onClick={onClose} disabled={save.isPending}>
          Skip
        </SkillButton>
        <SkillButton
          onClick={() => void submit()}
          disabled={chosen.length === 0 || save.isPending}
        >
          {save.isPending ? "Saving" : "Save rating"}
        </SkillButton>
      </div>
    </>
  );
}
