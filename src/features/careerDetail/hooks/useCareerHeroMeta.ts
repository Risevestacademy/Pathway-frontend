import type { Career } from "@/types/career.types";
import { hasTrackIcon } from "@/components/trackIcons";
import { careerIconKey } from "@/features/explore/explore.utils";
import { useActiveCareerId } from "@/features/skillCheck/hooks/useSkillCheck";
import type { TrackIconKey } from "@/features/skillCheck/skillCheck.types";
import { HERO_TINTS, getHeroStats } from "../careerHero.placeholders";

export function useCareerHeroMeta(career: Career) {
  const key = career.slug ? careerIconKey(career.slug) : null;
  const activeId = useActiveCareerId();
  const icon: TrackIconKey | null = key && hasTrackIcon(key) ? key : null;
  return {
    icon,
    tint: icon ? HERO_TINTS[icon] : undefined,
    isActive: activeId === career.id,
    forStudents: career.levels.includes("university-student"),
    stats: getHeroStats(career),
  };
}
