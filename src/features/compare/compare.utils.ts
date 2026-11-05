import type {
  Career,
  DemandStat,
  ProjectionStat,
  SalaryMedianStat,
} from "@/types/career.types";

export const MAX_COMPARE = 2;

export const MAX_SKILLS_SHOWN = 8;

export function selectedIds(
  a: string | undefined,
  b: string | undefined,
): string[] {
  const ids: string[] = [];
  for (const id of [a, b]) {
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, MAX_COMPARE);
}

export function toggleSelection(
  ids: string[],
  id: string,
): { ids: string[]; blocked: boolean } {
  if (ids.includes(id)) {
    return { ids: ids.filter((existing) => existing !== id), blocked: false };
  }
  if (ids.length >= MAX_COMPARE) return { ids, blocked: true };
  return { ids: [...ids, id], blocked: false };
}

export function toSlots(ids: string[]): {
  a: string | undefined;
  b: string | undefined;
} {
  return { a: ids[0], b: ids[1] };
}

export function commonSkills(first: string[], second: string[]): string[] {
  const inSecond = new Set(second.map((skill) => skill.trim().toLowerCase()));
  const seen = new Set<string>();
  return first.filter((skill) => {
    const key = skill.trim().toLowerCase();
    if (!inSecond.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function splitSkills(
  skills: string[],
  max = MAX_SKILLS_SHOWN,
): { shown: string[]; hidden: number } {
  return {
    shown: skills.slice(0, max),
    hidden: Math.max(0, skills.length - max),
  };
}

export function salaryMedians(career: Career): SalaryMedianStat[] {
  return career.stats.filter(
    (stat): stat is SalaryMedianStat => stat.kind === "salary-median",
  );
}

export function projectionStat(career: Career): ProjectionStat | undefined {
  return career.stats.find(
    (stat): stat is ProjectionStat => stat.kind === "employment-projection",
  );
}

export function demandStat(career: Career): DemandStat | undefined {
  return career.stats.find(
    (stat): stat is DemandStat => stat.kind === "demand",
  );
}

export function stepCountLabel(count: number): string {
  return `${count} ${count === 1 ? "step" : "steps"}`;
}