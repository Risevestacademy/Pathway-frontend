import { useState } from "react";
import { SkillButton } from "./SkillButton";
import { Modal } from "../../../components/ui/Modal";
import { useSaveSkillRating } from "../hooks/useSkillCheckActions";
import { RATING_LABELS, RATING_VALUES } from "../skillCheck.copy";
import type { RatingValue } from "../skillCheck.types";
import { RatingOption } from "./RatingOption";

export interface RatableSkill {
  id: string;
  name: string;
  /** The saved rating, if any. */
  rating: number | null;
}

export function RateSkillsDialog({
  open,
  skill,
  onClose,
  onSaved,
}: {
  open: boolean;
  skill: RatableSkill | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={skill ? `Rate ${skill.name}` : "Rate your skill"}
      className="max-w-[560px]"
      description="Optional. This is your own view of your skill, not a test or a certification."
      tight
    >
      {open && skill && (
        <RateForm key={skill.id} skill={skill} onClose={onClose} onSaved={onSaved} />
      )}
    </Modal>
  );
}

function RateForm({
  skill,
  onClose,
  onSaved,
}: {
  skill: RatableSkill;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [choice, setChoice] = useState<number | null>(skill.rating);
  const save = useSaveSkillRating();
  const name = `rating-${skill.id}`;
  const changed = choice !== null && choice !== skill.rating;

  const submit = async () => {
    if (choice === null) return;
    try {
      await save.mutateAsync({ skillId: skill.id, rating: choice });
      onSaved?.();
      onClose();
    } catch {
      return;
    }
  };

  return (
    <>
      <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
        <legend className="mb-1 text-base leading-5 font-medium text-ink">{skill.name}</legend>
        {skill.rating !== null && (
          <p className="text-sm leading-5 text-grey-600">
            Your current rating is {skill.rating} of 5.
          </p>
        )}
        {RATING_VALUES.map((value: RatingValue) => (
          <RatingOption
            key={value}
            name={name}
            value={String(value)}
            prefix={`${value}:`}
            label={RATING_LABELS[value]}
            checked={choice === value}
            onSelect={() => setChoice(value)}
          />
        ))}
      </fieldset>
      {save.isError && (
        <p
          role="alert"
          className="rounded-lg border border-danger-600/30 bg-danger-50 px-4 py-3 text-sm leading-5 text-danger-700"
        >
          Your rating did not save. Try again, or skip for now.
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <SkillButton
          isPrimary={false}
          className="sm:flex-1"
          onClick={onClose}
          disabled={save.isPending}
        >
          Skip
        </SkillButton>
        <SkillButton
          className="sm:flex-1"
          onClick={() => void submit()}
          disabled={!changed || save.isPending}
        >
          {save.isPending ? "Saving" : "Save rating"}
        </SkillButton>
      </div>
    </>
  );
}
