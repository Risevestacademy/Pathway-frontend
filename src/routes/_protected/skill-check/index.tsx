import { createFileRoute } from "@tanstack/react-router";
import { SkillCheckHub } from "../../../features/skillCheck/components/SkillCheckHub";

export const Route = createFileRoute("/_protected/skill-check/")({
  component: SkillCheckHub,
});
