import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SkillButton } from "./SkillButton";
import { useSkillCheckUserId } from "../hooks/useSkillCheck";
import { useSaveAssessment } from "../hooks/useSkillCheckActions";
import { readDraft, writeDraft } from "../skillCheck.storage";
import {
  countAnswered,
  getAreaProgress,
  getInitialAnswers,
  getResumeAreaId,
  groupSkillsByArea,
  isCheckComplete,
  toAssessmentInput,
} from "../skillCheck.utils";
import type { SkillAnswer, SkillAnswerMap, SkillAssessment } from "../skillCheck.types";
import { AnswerToggle } from "./AnswerToggle";
import { AreaNav } from "./AreaNav";
import { BackLink } from "./BackLink";
import { InfoNote } from "./InfoNote";
import { PageHeading } from "./PageHeading";
import { ProgressSavedDialog } from "./ProgressSavedDialog";

export function Questionnaire({ assessment }: { assessment: SkillAssessment }) {
  const navigate = useNavigate();
  const userId = useSkillCheckUserId();
  const { careerId } = assessment;
  const groups = groupSkillsByArea(assessment);
  const [initial] = useState(() => {
    const draft = readDraft(userId, careerId);
    const answers = getInitialAnswers(assessment, draft?.answers ?? null);
    const known = groups.some((group) => group.area.id === draft?.areaId);
    return {
      answers,
      areaId: (known ? draft?.areaId : null) ?? getResumeAreaId(assessment, answers) ?? groups[0].area.id,
    };
  });
  const [answers, setAnswers] = useState<SkillAnswerMap>(initial.answers);
  const [areaId, setAreaId] = useState<string>(initial.areaId);
  const [savedOpen, setSavedOpen] = useState(false);
  const save = useSaveAssessment(careerId);

  const areaIndex = Math.max(
    0,
    groups.findIndex((group) => group.area.id === areaId),
  );
  const group = groups[areaIndex];
  const isLastArea = areaIndex === groups.length - 1;
  const areaProgress = getAreaProgress(group.skills, answers);
  const areaDone = areaProgress.answered === areaProgress.total;
  const total = assessment.skills.length;
  const answered = countAnswered(assessment.skills, answers);
  const allDone = isCheckComplete(assessment.skills, answers);
  const firstOpenSkillId = group.skills.find((skill) => answers[skill.id] === undefined)?.id;
  const canAdvance = isLastArea ? allDone : areaDone;
  const remainingInArea = areaProgress.total - areaProgress.answered;
  const remainingOverall = total - answered;

  const keepDraft = (nextAnswers: SkillAnswerMap, nextAreaId: string) =>
    writeDraft(userId, careerId, { answers: nextAnswers, areaId: nextAreaId });

  const handleAnswer = (skillId: string, answer: SkillAnswer) => {
    const next = { ...answers, [skillId]: answer };
    setAnswers(next);
    keepDraft(next, areaId);
  };

  const goToArea = (nextAreaId: string) => {
    setAreaId(nextAreaId);
    keepDraft(answers, nextAreaId);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const handleContinue = async () => {
    if (!isLastArea) {
      goToArea(groups[areaIndex + 1].area.id);
      return;
    }
    try {
      await save.mutateAsync(toAssessmentInput(assessment.skills, answers, assessment.ratings));
      await navigate({
        to: "/my-pathway/skill-check/$careerId/result",
        params: { careerId },
      });
    } catch {
      return;
    }
  };

  const handleSaveAndExit = () => {
    keepDraft(answers, areaId);
    setSavedOpen(true);
  };

  return (
    <>
      <BackLink />
      <div>
        <PageHeading
          eyebrow={`${assessment.name} · Stage ${areaIndex + 1} of ${groups.length}`}
          title={group.area.name}
          description="Choose what you can do. Not sure is a fine answer."
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <AreaNav groups={groups} answers={answers} activeAreaId={group.area.id} onSelect={goToArea} />
        <div
          key={group.area.id}
          className="flex min-w-0 flex-1 flex-col gap-3 animate-in fade-in duration-300 ease-out motion-reduce:animate-none"
        >
          <ul className="overflow-hidden rounded-lg border border-grey-100 bg-surface">
            {group.skills.map((skill) => (
              <li
                key={skill.id}
                className={
                  skill.id === firstOpenSkillId
                    ? "flex flex-col gap-3 border-t border-grey-100 bg-brand-50 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    : "flex flex-col gap-3 border-t border-grey-100 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                }
              >
                <p className="min-w-0 text-base leading-5 font-medium text-ink">{skill.name}</p>
                <AnswerToggle
                  skillId={skill.id}
                  skillName={skill.name}
                  value={answers[skill.id]}
                  onChange={(answer) => handleAnswer(skill.id, answer)}
                />
              </li>
            ))}
          </ul>
          <InfoNote boxed>
            Have means you could do it on a real project without looking everything up.
            Not yet means you are still learning. Not sure is fine too.
          </InfoNote>
        </div>
      </div>

      {save.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger-600/30 bg-danger-50 px-4 py-3 text-sm leading-5 text-danger-700"
        >
          <span>We could not save your skill check. Your answers are still on this page.</span>
          <SkillButton isPrimary={false} onClick={() => void handleContinue()}>
            Try again
          </SkillButton>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm leading-5 text-grey-600">
          {answered} of {total} answered
          {!canAdvance &&
            (isLastArea && areaDone
              ? ` · ${remainingOverall} left in other stages`
              : ` · ${remainingInArea} left in this stage`)}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SkillButton isPrimary={false} disabled={save.isPending} onClick={handleSaveAndExit}>
            Save and exit
          </SkillButton>
          <SkillButton
            disabled={!canAdvance || save.isPending}
            onClick={() => void handleContinue()}
          >
            {isLastArea ? (save.isPending ? "Saving result" : "See my result") : "Continue"}
            <ArrowRightRegular aria-hidden className="size-5" />
          </SkillButton>
        </div>
      </div>

      <ProgressSavedDialog
        open={savedOpen}
        answered={answered}
        total={total}
        onKeepGoing={() => setSavedOpen(false)}
      />
    </>
  );
}
