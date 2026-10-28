import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { earlierNote } from "../resultCopy";
import { getStep } from "../skillCheck.utils";
import type { SkillCheckCareer, SkillCheckRecord } from "../skillCheck.types";
import { SkillButton } from "./SkillButton";
import { Tag } from "./Tag";

export function SuggestionPanel({
  career,
  record,
  stepOrder,
  reason,
  isRetakeChange,
  otherActiveName,
  busy,
  onAccept,
  onDecline,
  onKeep,
  onSaveAndStay,
}: {
  career: SkillCheckCareer;
  record: SkillCheckRecord;
  stepOrder: number;
  reason: string;
  isRetakeChange: boolean;
  otherActiveName: string | null;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onKeep: () => void;
  onSaveAndStay: () => void;
}) {
  const step = getStep(career, stepOrder);
  const current = record.startingPoint;
  const currentStep = current ? getStep(career, current.stepOrder) : null;
  const switching = otherActiveName !== null;
  const verb = switching ? "Switch and start at" : "Start at";
  const note = earlierNote(career, stepOrder);

  return (
    <>
      {isRetakeChange && current && currentStep && (
        <div className="flex flex-col gap-1 rounded-lg border border-grey-50 bg-surface px-4 py-3 shadow-[0_4px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm leading-5 text-grey-600">Current starting point</p>
          <p className="text-base leading-5 font-medium text-ink">
            Step {current.stepOrder} · {currentStep.title}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <Tag tone="brand" className="font-medium">
          {isRetakeChange ? "New suggestion" : "Suggestion based on your answers"}
        </Tag>
        <h2 className="font-display text-xl leading-6 font-medium text-ink">
          Start at step {stepOrder}, {step?.title}
        </h2>
        <p className="text-base leading-5 text-grey-600">{reason}</p>
      </div>
      <div className="flex flex-col gap-3">
        <SkillButton disabled={busy} onClick={onAccept}>
          {isRetakeChange ? `Accept step ${stepOrder}` : `${verb} step ${stepOrder}`}
          <ArrowRightRegular aria-hidden className="size-5" />
        </SkillButton>
        {isRetakeChange && current ? (
          <SkillButton isPrimary={false} disabled={busy} onClick={onKeep}>
            Keep step {current.stepOrder}
          </SkillButton>
        ) : (
          stepOrder !== 1 && (
            <SkillButton isPrimary={false} disabled={busy} onClick={onDecline}>
              {verb} step 1
            </SkillButton>
          )
        )}
      </div>
      <p className="text-sm leading-5 text-grey-600">
        {isRetakeChange
          ? "Your completed steps and ratings are not changed."
          : switching
            ? `Switching keeps your ${otherActiveName} progress.${note ? ` ${note}` : ""}`
            : note}
      </p>
      {switching && !isRetakeChange && (
        <button
          type="button"
          disabled={busy}
          onClick={onSaveAndStay}
          className="focus-ring w-fit cursor-pointer rounded text-sm leading-5 font-medium text-brand-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save result, stay on my pathway
        </button>
      )}
    </>
  );
}
