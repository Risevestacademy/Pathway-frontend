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