import { isAxiosError } from "axios";
import { api } from "./axios";
import type { PathwayStepStatus, ProgressCountsDto } from "./progress.api";

export type PathwayResourceType =
  | "COURSE"
  | "CERTIFICATION"
  | "ARTICLE"
  | "VIDEO"
  | "BOOK";
export type PathwayCostStatus = "FREE" | "PAID" | "UNKNOWN";

export interface PathwayResourceDto {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: PathwayResourceType;
  provider: string;
  costStatus: PathwayCostStatus;
  certificationCost: string | null;
  curationRationale: string;
  lastCheckedDate: string;
  skills: Array<{ id: string; name: string }>;
}

export interface PathwayStepDto {
  id: string;
  title: string;
  description: string;
  learningObjective: string;
  prerequisites: string | null;
  expectedActivity: string;
  order: number;
  skills: Array<{ id: string; name: string }>;
  resources: PathwayResourceDto[];
}

export interface CareerPathwayDto {
  pathway: {
    id: string;
    careerId: string;
    title: string;
    description: string;
    steps: PathwayStepDto[];
  };
}

export async function fetchCareerPathway(
  careerId: string,
): Promise<CareerPathwayDto> {
  const { data } = await api.get<CareerPathwayDto>(
    `/careers/${encodeURIComponent(careerId)}/pathway`,
  );
  return data;
}

/**
 * Like fetchCareerPathway, but resolves to null when the career or its
 * pathway doesn't exist (404) or the id isn't a valid UUID (400), so pages
 * can show a "not available" state. Other failures still throw.
 */
export async function fetchPathwayOrNull(
  careerId: string,
): Promise<CareerPathwayDto["pathway"] | null> {
  try {
    const { pathway } = await fetchCareerPathway(careerId);
    return pathway;
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 404 || status === 400) return null;
    throw error;
  }
}

/** A resource as the pathway read lists it, under the next and start steps only. */
export interface PathwayDetailResourceDto {
  id: string;
  title: string;
  url: string;
  type: PathwayResourceType;
  costStatus: PathwayCostStatus;
  estimatedWeeks: number;
  provider: string;
}

export interface PathwayDetailTaskDto {
  id: string;
  title: string;
  goal: string;
  estimatedWeeks: number;
  whatToMake: string[];
  hints: string[];
  checklist: string[];
}

export interface PathwayDetailStepDto {
  id: string;
  title: string;
  order: number;
  status: PathwayStepStatus;
  description: string;
  skills: string[];
  expectedActivity: string;
  careerReadiness: string;
  /** Only filled in for the next step and the start step. */
  resources: PathwayDetailResourceDto[];
  /** Only filled in for the next step and the start step. */
  tasks: PathwayDetailTaskDto[];
}

export interface PathwayDetailStageDto {
  id: string;
  title: string;
  order: number;
  description: string;
  progress: ProgressCountsDto;
  quiz: { status: string };
  steps: PathwayDetailStepDto[];
}

export interface PathwayDetailDto {
  id: string;
  career: {
    id: string;
    title: string;
    description: string;
    retired: boolean;
    stageCount: number;
    stepCount: number;
    resourceCount: number;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
    nextStepId: string | null;
    selfReported: boolean;
  };
  stages: PathwayDetailStageDto[];
}

/**
 * The pathway by its own id: career header, every stage with its steps, and
 * progress. Resolves to null when it isn't found or its career is a draft
 * (404), or the id isn't a valid UUID (400). Other failures still throw.
 */
export async function fetchPathwayById(
  pathwayId: string,
): Promise<PathwayDetailDto | null> {
  try {
    const { data } = await api.get<PathwayDetailDto>(
      `/pathways/${encodeURIComponent(pathwayId)}`,
    );
    return data;
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    if (status === 404 || status === 400) return null;
    throw error;
  }
}
