import { useState } from "react";
import type { SkillCheckCareerSummary, StartingPoint } from "../skillCheck.types";
import { useResolveStartingPoint, useSwitchActiveCareer } from "./useSkillCheckActions";

/** Saves the learner's starting point decision and the pathway switch that can come with it. */
export function useStartingPointDecision({
  careerId,
  isActive,
  otherActive,
}: {
  careerId: string;
  isActive: boolean;
  otherActive: SkillCheckCareerSummary | null;
}) {
  const resolve = useResolveStartingPoint(careerId);
  const switchCareer = useSwitchActiveCareer();
  const [pending, setPending] = useState<StartingPoint | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const finish = async (decision: StartingPoint | null, message: string) => {
    await resolve.mutateAsync(decision);
    setSavedMessage(message);
  };

  const choose = async (decision: StartingPoint) => {
    if (!isActive && otherActive) {
      setPending(decision);
      setConfirmOpen(true);
      return;
    }
    try {
      if (!isActive) await switchCareer.mutateAsync(careerId);
      await finish(decision, `Starting point saved. You will start at step ${decision.stepOrder}.`);
    } catch {
      return;
    }
  };

  const confirmSwitch = async () => {
    if (!pending) return;
    try {
      await switchCareer.mutateAsync(careerId);
      await finish(pending, `Pathway switched. You will start at step ${pending.stepOrder}.`);
      setConfirmOpen(false);
    } catch {
      return;
    }
  };

  const keepCurrent = async () => {
    try {
      await finish(null, "Your starting point stays the same.");
    } catch {
      return;
    }
  };

  const saveAndStay = async () => {
    try {
      await finish(null, "Result saved. Your active pathway has not changed.");
    } catch {
      return;
    }
  };

  const hasError = resolve.isError || switchCareer.isError;

  return {
    busy: resolve.isPending || switchCareer.isPending,
    failed: hasError && !confirmOpen,
    hasError,
    confirmOpen,
    closeConfirm: () => setConfirmOpen(false),
    savedMessage,
    setSavedMessage,
    choose,
    confirmSwitch,
    keepCurrent,
    saveAndStay,
  };
}
