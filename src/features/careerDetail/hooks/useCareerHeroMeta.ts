import type { Career } from "@/types/career.types";
import { hasTrackIcon } from "@/components/trackIcons";
import { findSkillCheckCareerByTitle } from "@/features/skillCheck/careerMatch";
import { useActiveCareerId } from "@/features/skillCheck/hooks/useSkillCheck";
import type { TrackIconKey } from "@/features/skillCheck/skillCheck.types";
import { getHeroStats } from "../careerHero.placeholders";

export function useCareerHeroMeta(career: Career) {
  const match = findSkillCheckCareerByTitle(career.title, career.slug);
  const activeId = useActiveCareerId().data ?? null;
  const icon: TrackIconKey | null = match && hasTrackIcon(match.icon) ? match.icon : null;
  return {
    icon,
    isActive: match !== null && activeId === match.careerId,
    forStudents: career.levels.includes("university-student"),
    stats: getHeroStats(career),
  };
}
