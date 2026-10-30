import { z } from "zod/mini";

// Invalid values are dropped rather than failing the route, so hand-edited links still open.
export const exploreSearchSchema = z.object({
  q: z.catch(z.optional(z.string()), undefined),
  level: z.catch(
    z.optional(z.enum(["university-student", "recent-graduate", "early-career"])),
    undefined,
  ),
  /** Sent to the API as `interest`. */
  field: z.catch(z.optional(z.string()), undefined),
});

export type ExploreSearch = z.infer<typeof exploreSearchSchema>;
