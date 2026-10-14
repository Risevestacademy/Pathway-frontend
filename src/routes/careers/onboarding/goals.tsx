import { createFileRoute } from "@tanstack/react-router";
import GoalsStep from "../../../features/catalog/components/GoalsStep";

export const Route = createFileRoute("/careers/onboarding/goals")({
  component: GoalsStep,
});