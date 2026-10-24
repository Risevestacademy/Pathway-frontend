import { SKILL_CHECK_CAREERS } from "../../features/skillCheck/skillCheck.mock";
import {
  getSkillCheckResult,
  isCheckComplete,
  isNewSuggestion,
} from "../../features/skillCheck/skillCheck.utils";
import type {
  SkillAnswerMap,
  SkillCheckCareer,
  SkillCheckCareerSummary,
  SkillCheckRecord,
  SkillCheckUserState,
  SkillRating,
  StartingPoint,
} from "../../features/skillCheck/skillCheck.types";

const STORAGE_PREFIX = "pathway.skill-check.v1.";
const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 300;

const memoryStore = new Map<string, string>();

export class SkillCheckError extends Error {
  readonly code: "NOT_FOUND" | "INCOMPLETE" | "UNAVAILABLE" | "SAVE_FAILED";

  constructor(
    code: SkillCheckError["code"],
    message: string,
  ) {
    super(message);
    this.name = "SkillCheckError";
    this.code = code;
  }
}

function emptyState(): SkillCheckUserState {
  return { activeCareerId: null, records: {}, ratings: [] };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memoryStore.get(key) ?? null;
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string): void {
  memoryStore.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function readState(userId: string): SkillCheckUserState {
  const raw = readRaw(STORAGE_PREFIX + userId);
  if (!raw) return emptyState();
  try {
    return { ...emptyState(), ...(JSON.parse(raw) as SkillCheckUserState) };
  } catch {
    return emptyState();
  }
}

function writeState(userId: string, state: SkillCheckUserState): void {
  try {
    writeRaw(STORAGE_PREFIX + userId, JSON.stringify(state));
  } catch {
    throw new SkillCheckError("SAVE_FAILED", "Your answers could not be saved.");
  }
}

async function simulateLatency(): Promise<void> {
  if (LATENCY_MS === 0) return;
  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
}

function findCareer(careerId: string): SkillCheckCareer {
  const career = SKILL_CHECK_CAREERS.find((item) => item.careerId === careerId);
  if (!career) throw new SkillCheckError("NOT_FOUND", "Career not found.");
  return career;
}

function findReviewedCareer(careerId: string): SkillCheckCareer {
  const career = findCareer(careerId);
  if (!career.reviewed || career.skills.length === 0) {
    throw new SkillCheckError(
      "UNAVAILABLE",
      "There is no reviewed skill list for this career yet.",
    );
  }
  return career;
}

function blankRecord(careerId: string): SkillCheckRecord {
  return {
    careerId,
    answers: {},
    previousAnswers: null,
    draft: null,
    draftAreaId: null,
    completedAt: null,
    startingPoint: null,
    needsDecision: false,
  };
}

function updateRecord(
  userId: string,
  careerId: string,
  change: (record: SkillCheckRecord, state: SkillCheckUserState) => SkillCheckRecord,
): SkillCheckRecord {
  const state = readState(userId);
  const current = state.records[careerId] ?? blankRecord(careerId);
  const next = change(current, state);
  writeState(userId, {
    ...state,
    records: { ...state.records, [careerId]: next },
  });
  return next;
}

export async function fetchSkillCheckCareers(
  userId: string,
): Promise<SkillCheckCareerSummary[]> {
  await simulateLatency();
  const state = readState(userId);
  return SKILL_CHECK_CAREERS.map((career) => ({
    careerId: career.careerId,
    name: career.name,
    icon: career.icon,
    reviewed: career.reviewed && career.skills.length > 0,
    isActive: state.activeCareerId === career.careerId,
    hasResult: Boolean(state.records[career.careerId]?.completedAt),
  }));
}

export async function fetchSkillCheckCareer(
  careerId: string,
): Promise<SkillCheckCareer | null> {
  await simulateLatency();
  return (
    SKILL_CHECK_CAREERS.find((career) => career.careerId === careerId) ?? null
  );
}

export async function fetchSkillCheckRecord(
  userId: string,
  careerId: string,
): Promise<SkillCheckRecord | null> {
  await simulateLatency();
  return readState(userId).records[careerId] ?? null;
}

export async function fetchActiveCareerId(
  userId: string,
): Promise<string | null> {
  await simulateLatency();
  return readState(userId).activeCareerId;
}

export async function startSkillCheck(
  userId: string,
  careerId: string,
): Promise<SkillCheckRecord> {
  await simulateLatency();
  findReviewedCareer(careerId);
  return updateRecord(userId, careerId, (record) => {
    if (record.draft) return record;
    const hasAnswers = Object.keys(record.answers).length > 0;
    return {
      ...record,
      draft: hasAnswers ? { ...record.answers } : {},
      draftAreaId: null,
    };
  });
}

export async function saveSkillCheckDraft(
  userId: string,
  careerId: string,
  draft: SkillAnswerMap,
  draftAreaId: string | null,
): Promise<SkillCheckRecord> {
  await simulateLatency();
  findReviewedCareer(careerId);
  return updateRecord(userId, careerId, (record) => ({
    ...record,
    draft,
    draftAreaId,
  }));
}

export async function completeSkillCheck(
  userId: string,
  careerId: string,
): Promise<SkillCheckRecord> {
  await simulateLatency();
  const career = findReviewedCareer(careerId);
  return updateRecord(userId, careerId, (record) => {
    const draft = record.draft;
    if (!draft || !isCheckComplete(career.skills, draft)) {
      throw new SkillCheckError(
        "INCOMPLETE",
        "Answer every skill before you finish.",
      );
    }
    const hasPrevious = Object.keys(record.answers).length > 0;
    const suggestion = getSkillCheckResult(career, draft).suggestion;
    const needsDecision = record.startingPoint
      ? isNewSuggestion(record.startingPoint, suggestion)
      : suggestion !== null;
    return {
      ...record,
      previousAnswers: hasPrevious ? record.answers : null,
      answers: draft,
      draft: null,
      draftAreaId: null,
      completedAt: new Date().toISOString(),
      needsDecision,
    };
  });
}

export async function resolveStartingPoint(
  userId: string,
  careerId: string,
  startingPoint: StartingPoint | null,
): Promise<SkillCheckRecord> {
  await simulateLatency();
  findReviewedCareer(careerId);
  return updateRecord(userId, careerId, (record) => ({
    ...record,
    startingPoint: startingPoint ?? record.startingPoint,
    needsDecision: false,
  }));
}

export async function switchActiveCareer(
  userId: string,
  careerId: string,
): Promise<string> {
  await simulateLatency();
  findCareer(careerId);
  const state = readState(userId);
  writeState(userId, { ...state, activeCareerId: careerId });
  return careerId;
}

export async function fetchSkillRatings(userId: string): Promise<SkillRating[]> {
  await simulateLatency();
  return readState(userId).ratings;
}

export async function saveSkillRating(
  userId: string,
  rating: SkillRating,
): Promise<SkillRating> {
  await simulateLatency();
  const state = readState(userId);
  writeState(userId, { ...state, ratings: [...state.ratings, rating] });
  return rating;
}
