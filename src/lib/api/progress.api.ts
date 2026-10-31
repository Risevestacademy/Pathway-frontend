import { isAxiosError } from "axios";
import { api } from "./axios";
import type {
  ActivePathway,
  PathwayProgress,
  SavedPathway,
  StartingPointResult,
  StepStatus,
  StepStatusResult,
} from "../../features/progress/progress.types";

/** An error from updating a step, with the HTTP status so a screen can react to it. */
export class StepStatusError extends Error {
  /** 409 means the person hasn't saved the step's career yet. */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "StepStatusError";
    this.status = status;
  }
}

function getStepStatusError(error: unknown): StepStatusError {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  switch (status) {
    case 400:
      return new StepStatusError("We couldn’t update this step. Please try again.", status);
    case 401:
      return new StepStatusError("Your session has expired. Sign in again to continue.", status);
    case 404:
      return new StepStatusError("This step isn’t available any more.", status);
    case 409:
      return new StepStatusError(
        "Save this career to your pathways before tracking progress on it.",
        status,
      );
    default:
      return new StepStatusError(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t update this step. Please try again.",
        status,
      );
  }
}

/** The server leaves these out rather than sending null in some cases. */
function toProgress(raw: Partial<PathwayProgress> | undefined): PathwayProgress {
  return {
    completed: raw?.completed ?? 0,
    total: raw?.total ?? 0,
    percentage: raw?.percentage ?? 0,
    nextStepId: raw?.nextStepId ?? null,
    selfReported: raw?.selfReported ?? true,
    startStepId: raw?.startStepId ?? null,
  };
}

/**
 * PUT /me/pathway-steps/{stepId}. For the signed-in person: marks a step
 * COMPLETED, or clears it with NOT_STARTED, and returns their updated progress
 * for that pathway. The step's career must be published (or a retired one they
 * saved) and saved by them: otherwise 404 or 409.
 */
export async function setPathwayStepStatus(
  stepId: string,
  status: StepStatus,
): Promise<StepStatusResult> {
  try {
    const { data } = await api.put<StepStatusResult | { data: StepStatusResult }>(
      `/me/pathway-steps/${encodeURIComponent(stepId)}`,
      { status },
    );
    const body = "data" in data ? data.data : data;
    return {
      stepId: body.stepId,
      status: body.status,
      progress: toProgress(body.progress),
    };
  } catch (error) {
    throw getStepStatusError(error);
  }
}

/** An error from loading the person's pathways, with the HTTP status. */
export class MyPathwaysError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "MyPathwaysError";
    this.status = status;
  }
}

function getMyPathwaysError(error: unknown): MyPathwaysError {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  if (status === 401) {
    return new MyPathwaysError("Your session has expired. Sign in again to continue.", status);
  }
  return new MyPathwaysError(
    isAxiosError(error) && !error.response
      ? "We couldn’t reach the server. Check your connection and try again."
      : "We couldn’t load your pathways. Please try again.",
    status,
  );
}

/**
 * GET /me/pathways. The signed-in person's saved pathways with their progress,
 * in the order the server sends them. Retired careers they saved are included,
 * marked `retired`. An empty list means they haven't saved anything yet.
 */
export async function fetchMyPathways(): Promise<SavedPathway[]> {
  try {
    const { data } = await api.get<SavedPathway[] | { data: SavedPathway[] }>("/me/pathways");
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return list.map((pathway) => ({
      career: pathway.career,
      isActive: pathway.isActive === true,
      progress: {
        completed: pathway.progress?.completed ?? 0,
        total: pathway.progress?.total ?? 0,
        percentage: pathway.progress?.percentage ?? 0,
      },
    }));
  } catch (error) {
    throw getMyPathwaysError(error);
  }
}

/** An error from setting the active pathway, with the HTTP status. */
export class ActivePathwayError extends Error {
  /** 404: the career isn't published. 409: it has no pathway yet. */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ActivePathwayError";
    this.status = status;
  }
}

function getActivePathwayError(error: unknown): ActivePathwayError {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  switch (status) {
    case 401:
      return new ActivePathwayError("Your session has expired. Sign in again to continue.", status);
    case 404:
      return new ActivePathwayError("This career isn’t available to follow right now.", status);
    case 409:
      return new ActivePathwayError("This career doesn’t have a pathway yet.", status);
    default:
      return new ActivePathwayError(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t set this pathway. Please try again.",
        status,
      );
  }
}

/** Fills in what the server leaves out, so a screen never meets an undefined step list. */
export function toActivePathway(raw: Partial<ActivePathway> | undefined): ActivePathway {
  return {
    career: raw?.career ?? null,
    pathway: raw?.pathway ?? null,
    progress: raw?.progress ? toProgress(raw.progress) : null,
    steps: Array.isArray(raw?.steps)
      ? raw.steps.map((step) => ({ ...step, skills: step.skills ?? [] }))
      : [],
  };
}

/**
 * PUT /me/active-pathway. Makes the career's pathway the one the signed-in
 * person follows, and returns it with its steps and their state. The career
 * has to be published (404 otherwise) and have a pathway (409 otherwise).
 */
export async function setActivePathway(careerId: string): Promise<ActivePathway> {
  try {
    const { data } = await api.put<ActivePathway | { data: ActivePathway }>(
      "/me/active-pathway",
      { careerId },
    );
    return toActivePathway("data" in data ? data.data : data);
  } catch (error) {
    throw getActivePathwayError(error);
  }
}

function getActivePathwayLoadError(error: unknown): ActivePathwayError {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  if (status === 401) {
    return new ActivePathwayError("Your session has expired. Sign in again to continue.", status);
  }
  return new ActivePathwayError(
    isAxiosError(error) && !error.response
      ? "We couldn’t reach the server. Check your connection and try again."
      : "We couldn’t load your active pathway. Please try again.",
    status,
  );
}

/**
 * GET /me/active-pathway. The pathway the signed-in person follows, with its
 * steps and their state. When they haven't chosen one, career, pathway and
 * progress are null and steps is empty.
 */
export async function fetchActivePathway(): Promise<ActivePathway> {
  try {
    const { data } = await api.get<ActivePathway | { data: ActivePathway }>("/me/active-pathway");
    return toActivePathway("data" in data ? data.data : data);
  } catch (error) {
    throw getActivePathwayLoadError(error);
  }
}

/** An error from choosing a starting point, with the HTTP status. */
export class StartingPointError extends Error {
  /** 400: the step isn't in this pathway. 404: the pathway isn't saved. */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "StartingPointError";
    this.status = status;
  }
}

function getStartingPointError(error: unknown): StartingPointError {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  switch (status) {
    case 400:
      return new StartingPointError("That step isn’t part of this pathway.", status);
    case 401:
      return new StartingPointError("Your session has expired. Sign in again to continue.", status);
    case 404:
      return new StartingPointError("Save this pathway before choosing where to start.", status);
    default:
      return new StartingPointError(
        isAxiosError(error) && !error.response
          ? "We couldn’t reach the server. Check your connection and try again."
          : "We couldn’t save your starting point. Please try again.",
        status,
      );
  }
}

/**
 * PUT /me/pathways/{careerId}/starting-point. Sets, changes or (with null)
 * clears the step the signed-in person starts from in a pathway they saved.
 * Returns the updated progress for that pathway.
 */
export async function setStartingPoint(
  careerId: string,
  stepId: string | null,
): Promise<StartingPointResult> {
  try {
    const { data } = await api.put<StartingPointResult | { data: StartingPointResult }>(
      `/me/pathways/${encodeURIComponent(careerId)}/starting-point`,
      { stepId },
    );
    const body = "data" in data ? data.data : data;
    return {
      careerId: body.careerId,
      startStepId: body.startStepId ?? null,
      progress: toProgress(body.progress),
    };
  } catch (error) {
    throw getStartingPointError(error);
  }
}
