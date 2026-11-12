import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/mini";
import CompareResultPage from "../../../features/compare/components/CompareResultPage";

const optionalText = z.catch(z.optional(z.string()), undefined);

export const Route = createFileRoute("/careers/compare/result")({
  validateSearch: z.object({ a: optionalText, b: optionalText }),
  component: CompareResultPage,
});