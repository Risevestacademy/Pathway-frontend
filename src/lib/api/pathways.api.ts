import { isAxiosError } from "axios";
import { api } from "./axios";

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
