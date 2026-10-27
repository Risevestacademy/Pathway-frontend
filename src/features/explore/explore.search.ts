import { z } from "zod";

/**
 * URL search params for /explore. Invalid values are dropped rather than
 * failing the route, so old or hand-edited links still open the page.
 */
export const exploreSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  level: z.enum(["university-student", "recent-graduate", "early-career"]).optional().catch(undefined),
  /** Field slug, sent to the API as `interest`. */
  field: z.string().optional().catch(undefined),
});

export type ExploreSearch = z.infer<typeof exploreSearchSchema>;
