import { z } from "zod";

// Invalid values are dropped rather than failing the route, so hand-edited links still open.
export const exploreSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  level: z.enum(["university-student", "recent-graduate", "early-career"]).optional().catch(undefined),
  /** Sent to the API as `interest`. */
  field: z.string().optional().catch(undefined),
});

export type ExploreSearch = z.infer<typeof exploreSearchSchema>;
