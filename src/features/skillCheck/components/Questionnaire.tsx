import { ArrowRightRegular } from "@mingcute/react/core-regular";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SkillButton } from "./SkillButton";
import {
  useCompleteSkillCheck,
  useSaveSkillCheckDraft,
} from "../hooks/useSkillCheckActions";
import {
  countAnswered,
  getAreaProgress,
  getResumeAreaId,
  groupSkillsByArea,
  isCheckComplete,
} from "../skillCheck.utils";
import type {
  SkillAnswer,
  SkillAnswerMap,
  SkillCheckCareer,
  SkillCheckRecord,
} from "../skillCheck.types";
import { AnswerToggle } from "./AnswerToggle";
import { AreaNav } from "./AreaNav";
import { BackLink } from "./BackLink";
import { InfoNote } from "./InfoNote";
import { PageHeading } from "./PageHeading";
import { ProgressSavedDialog } from "./ProgressSavedDialog";

export function Questionnaire({
  career,
  record,
}: {
  career: SkillCheckCareer;
  record: SkillCheckRecord;
}) {
  const navigate = useNavigate();
  const groups = groupSkillsByArea(career);
  const initialAnswers = record.draft ?? {};
  const [answers, setAnswers] = useState<SkillAnswerMap>(initialAnswers);
  const [areaId, setAreaId] = useState<string>(
    record.draftAreaId ?? getResumeAreaId(career, initialAnswers) ?? groups[0].area.id,
  );
  const [savedOpen, setSavedOpen] = useState(false);
  const save = useSaveSkillCheckDraft(career.careerId);
  const complete = useCompleteSkillCheck(career.careerId);

  const areaIndex = Math.max(
    0,
    groups.findIndex((group) => group.area.id === areaId),
  );
  const group = groups[areaIndex];
  const isLastArea = areaIndex === groups.length - 1;
  const areaProgress = getAreaProgress(group.skills, answers);
  const areaDone = areaProgress.answered === areaProgress.total;
  const total = career.skills.length;
  const answered = countAnswered(career.skills, answers);
  const allDone = isCheckComplete(career.skills, answers);
  const firstOpenSkillId = group.skills.find((skill) => answers[skill.id] === undefined)?.id;
  const canAdvance = isLastArea ? allDone : areaDone;
  const remainingInArea = areaProgress.total - areaProgress.answered;
  const remainingOverall = total - answered;

  const persist = (nextAnswers: SkillAnswerMap, nextAreaId: string) =>
    save.mutateAsync({ draft: nextAnswers, areaId: nextAreaId });

  const handleAnswer = (skillId: string, answer: SkillAnswer) => {
    const next = { ...answers, [skillId]: answer };
    setAnswers(next);
    save.mutate({ draft: next, areaId });
  };

  const goToArea = (nextAreaId: string) => {
    setAreaId(nextAreaId);
    save.mutate({ draft: answers, areaId: nextAreaId });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const handleContinue = async () => {
    if (!isLastArea) {
      goToArea(groups[areaIndex + 1].area.id);
      return;
    }
    try {
      await persist(answers, areaId);
      await complete.mutateAsync();
      await navigate({
        to: "/skill-check/$careerId/result",
        params: { careerId: career.careerId },
      });
    } catch {
      return;
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await persist(answers, areaId);
      setSavedOpen(true);
    } catch {
      return;
    }
  };

  const failed = save.isError || complete.isError;

  return (
    <>
      <BackLink />
      <div>
        <PageHeading
          eyebrow={`${career.name} · Area ${areaIndex + 1} of ${groups.length}`}
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
          <ul className="overflow-hidden rounded-xl border border-grey-100 bg-surface">
            {group.skills.map((skill) => (
              <li
                key={skill.id}
                className={
                  skill.id === firstOpenSkillId
                    ? "flex flex-col gap-3 border-t border-grey-100 bg-brand-50 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    : "flex flex-col gap-3 border-t border-grey-100 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                }
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-base leading-5 font-medium text-ink">{skill.name}</p>
                  <p className="text-sm leading-5 text-grey-600">{skill.description}</p>
                </div>
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

      {failed && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger-600/30 bg-danger-50 px-4 py-3 text-sm leading-5 text-danger-700"
        >
          <span>
            {complete.isError
              ? "We could not finish your skill check. Your answers are still on this page."
              : "Your latest answer is not saved yet."}
          </span>
          <SkillButton
            isPrimary={false}
            onClick={() =>
              complete.isError ? void handleContinue() : save.mutate({ draft: answers, areaId })
            }
          >
            Try again
          </SkillButton>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm leading-5 text-grey-600">
          {answered} of {total} answered
          {!canAdvance &&
            (isLastArea && areaDone
              ? ` · ${remainingOverall} left in other areas`
              : ` · ${remainingInArea} left in this area`)}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <SkillButton
            isPrimary={false}
            disabled={save.isPending || complete.isPending}
            onClick={() => void handleSaveAndExit()}
          >
            Save and exit
          </SkillButton>
          <SkillButton
            disabled={!canAdvance || save.isPending || complete.isPending}
            onClick={() => void handleContinue()}
          >
            {isLastArea ? (complete.isPending ? "Saving result" : "See my result") : "Continue"}
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
