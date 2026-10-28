import { Link } from "@tanstack/react-router";
import { describeReason } from "../resultCopy";
import type {
  SkillCheckCareer,
  SkillCheckRecord,
  StartSuggestion,
  StartingPoint,
} from "../skillCheck.types";
import { NoGapPanel } from "./NoGapPanel";
import { SettledPanel } from "./SettledPanel";
import { SuggestionPanel } from "./SuggestionPanel";

export function StartingPointAside({
  career,
  record,
  suggestion,
  decisionOpen,
  isRetakeChange,
  otherActiveName,
  busy,
  onChoose,
  onKeep,
  onSaveAndStay,
}: {
  career: SkillCheckCareer;
  record: SkillCheckRecord;
  suggestion: StartSuggestion | null;
  decisionOpen: boolean;
  isRetakeChange: boolean;
  otherActiveName: string | null;
  busy: boolean;
  onChoose: (decision: StartingPoint) => void;
  onKeep: () => void;
  onSaveAndStay: () => void;
}) {
  return (
    <aside
      aria-label="Your starting point"
      className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-brand-100 bg-brand-50 p-6 lg:sticky lg:top-32"
    >
      {decisionOpen && suggestion ? (
        <SuggestionPanel
          career={career}
          record={record}
          stepOrder={suggestion.stepOrder}
          reason={describeReason(
            suggestion.reasonSkills.map((skill) => skill.name),
            suggestion.coveredStepOrders,
            isRetakeChange,
          )}
          isRetakeChange={isRetakeChange}
          otherActiveName={otherActiveName}
          busy={busy}
          onAccept={() => onChoose({ stepOrder: suggestion.stepOrder, source: "ACCEPTED" })}
          onDecline={() => onChoose({ stepOrder: 1, source: "DECLINED" })}
          onKeep={onKeep}
          onSaveAndStay={onSaveAndStay}
        />
      ) : record.startingPoint ? (
        <SettledPanel career={career} startingPoint={record.startingPoint} />
      ) : (
        <NoGapPanel busy={busy} onStart={() => onChoose({ stepOrder: 1, source: "DEFAULT" })} />
      )}
      <div className="border-t border-brand-200 pt-4">
        <Link
          to="/skill-check/$careerId"
          params={{ careerId: career.careerId }}
          className="focus-ring rounded text-sm leading-5 font-medium text-brand-600 hover:underline"
        >
          Edit my answers
        </Link>
      </div>
    </aside>
  );
}
