import type { SkillCheckDraft } from "./skillCheck.types";

/**
 * The server only stores finished answers, so answers in progress live on
 * this device. Losing them is harmless: the learner just starts the
 * questionnaire from their saved answers.
 */
const PREFIX = "pathway.skill-check.draft.v1";

const keyFor = (userId: string, careerId: string) => `${PREFIX}.${userId}.${careerId}`;

export function readDraft(userId: string, careerId: string): SkillCheckDraft | null {
  try {
    const raw = window.localStorage.getItem(keyFor(userId, careerId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SkillCheckDraft>;
    if (!parsed.answers || typeof parsed.answers !== "object") return null;
    return { answers: parsed.answers, areaId: parsed.areaId ?? null };
  } catch {
    return null;
  }
}

export function writeDraft(userId: string, careerId: string, draft: SkillCheckDraft): void {
  try {
    window.localStorage.setItem(keyFor(userId, careerId), JSON.stringify(draft));
  } catch {
    return;
  }
}

/** Called once the answers are saved or cleared: the draft is done with. */
export function clearDraft(userId: string, careerId: string): void {
  try {
    window.localStorage.removeItem(keyFor(userId, careerId));
  } catch {
    return;
  }
}
