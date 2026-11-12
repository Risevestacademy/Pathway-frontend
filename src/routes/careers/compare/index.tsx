import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/mini";
import ComparePickerPage from "../../../features/compare/components/ComparePickerPage";

const optionalText = z.catch(z.optional(z.string()), undefined);

export const Route = createFileRoute("/careers/compare/")({
  validateSearch: z.object({
    a: optionalText,
    b: optionalText,
    q: optionalText,
    interest: optionalText,
    level: z.catch(
      z.optional(z.enum(["university-student", "recent-graduate", "early-career"])),
      undefined,
    ),
  }),
  component: ComparePickerPage,
});