import type { SkillCheckDraft } from "./skillCheck.types";

/**
 * The server only stores finished answers, so answers in progress and the
 * date of the last check live on this device. Losing them is harmless: the
 * learner just starts the questionnaire from their saved answers.
 */
const PREFIX = "pathway.skill-check.v2";

interface LocalRecord {
  draft: SkillCheckDraft | null;
  checkedAt: string | null;
}

const EMPTY: LocalRecord = { draft: null, checkedAt: null };

const keyFor = (userId: string, careerId: string) => `${PREFIX}.${userId}.${careerId}`;

function read(userId: string, careerId: string): LocalRecord {
  try {
    const raw = window.localStorage.getItem(keyFor(userId, careerId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<LocalRecord>;
    return { draft: parsed.draft ?? null, checkedAt: parsed.checkedAt ?? null };
  } catch {
    return EMPTY;
  }
}

function write(userId: string, careerId: string, record: LocalRecord): void {
  try {
    window.localStorage.setItem(keyFor(userId, careerId), JSON.stringify(record));
  } catch {
    return;
  }
}

export function readDraft(userId: string, careerId: string): SkillCheckDraft | null {
  return read(userId, careerId).draft;
}

export function writeDraft(userId: string, careerId: string, draft: SkillCheckDraft): void {
  write(userId, careerId, { ...read(userId, careerId), draft });
}

export function readCheckedAt(userId: string, careerId: string): string | null {
  return read(userId, careerId).checkedAt;
}

/** Called once the answers are saved: the draft is done with. */
export function markChecked(userId: string, careerId: string, now: Date = new Date()): void {
  write(userId, careerId, { draft: null, checkedAt: now.toISOString() });
}

export function clearLocalRecord(userId: string, careerId: string): void {
  try {
    window.localStorage.removeItem(keyFor(userId, careerId));
  } catch {
    return;
  }
}
