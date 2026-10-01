import type { ApiCareerLevel, CareerLevel } from "../../types/career.types";

const API_LEVELS: Record<CareerLevel, ApiCareerLevel> = {
  "university-student": "STUDENT",
  "recent-graduate": "RECENT_GRAD",
  "early-career": "EARLY_CAREER",
};

export function toApiLevel(level: CareerLevel | null): ApiCareerLevel | undefined {
  return level ? API_LEVELS[level] : undefined;
}
