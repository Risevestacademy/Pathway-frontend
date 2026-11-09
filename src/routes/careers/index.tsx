import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/mini";
import Catalogue from "../../features/catalog/components/Catalogue";

export const Route = createFileRoute("/careers/")({
  validateSearch: z.object({
    q: z.catch(z.optional(z.string()), undefined),
  }),
  component: Catalogue,
});