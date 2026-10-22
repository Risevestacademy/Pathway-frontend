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
