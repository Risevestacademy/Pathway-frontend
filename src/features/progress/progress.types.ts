import type {
  PathwayProgressDto,
  PathwayStepStatus,
  ProgressCountsDto,
} from "../../lib/api/progress.api";

/**
 * Where the signed-in user stands on one career's roadmap. Step statuses only
 * exist for the active pathway, because that's the only one the API returns
 * them for.
 */
export type CareerProgress =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  /** Not saved yet. activeCareerTitle is the pathway it would replace. */
  | { kind: "untracked"; activeCareerTitle: string | null }
  /** Saved earlier, but another pathway is active now. */
  | {
      kind: "inactive";
      counts: ProgressCountsDto;
      activeCareerTitle: string | null;
    }
  | {
      kind: "active";
      progress: PathwayProgressDto;
      statuses: Record<string, PathwayStepStatus>;
    };
