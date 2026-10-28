import type { CareerLevel } from "../../types/career.types";
import type { FetchCareersParams } from "../careerDetail/career.types";
import { toApiLevel } from "./catalog.types";

/**
 * recommended → level + interest from the session
 * level       → level only
 * all         → the full published catalogue
 */
export type CatalogueView = "recommended" | "level" | "all";

export interface CatalogueTab<T extends string = CatalogueView> {
  id: T;
  label: string;
}

/** Recommended only exists with an interest, the level tab only with a level. */
export function getCatalogueTabs(
  levelLabel: string | undefined,
  hasInterest: boolean,
): CatalogueTab[] {
  const tabs: CatalogueTab[] = [];
  if (hasInterest) tabs.push({ id: "recommended", label: "Recommended" });
  if (levelLabel) tabs.push({ id: "level", label: levelLabel });
  tabs.push({ id: "all", label: "All" });
  return tabs;
}

/** Falls back to the first tab when the chosen view no longer exists. */
export function resolveView(
  view: CatalogueView,
  tabs: CatalogueTab[],
): CatalogueView {
  return tabs.some((tab) => tab.id === view) ? view : tabs[0].id;
}

export function getCatalogueFilters(
  view: CatalogueView,
  level: CareerLevel | null,
  interest: string | null,
): FetchCareersParams {
  if (view === "all") return {};
  return {
    level: toApiLevel(level),
    interest: view === "recommended" ? (interest ?? undefined) : undefined,
  };
}
