import type { TrackIconKey } from "@/features/skillCheck/skillCheck.types";
import type { Career } from "@/types/career.types";

export interface HeroStats {
  topics: number;
  projects: number;
  progress: number;
}

export function getHeroStats(career: Career): HeroStats {
  void career;
  return { topics: 113, projects: 30, progress: 0 };
}

export const HERO_TINTS: Partial<Record<TrackIconKey, string>> = {
  "backend-developer": "#E6FAF0",
  "frontend-developer": "#F5F3FF",
  "ux-designer": "#FDF2F8",
  "data-analyst": "#FFF7ED",
};
