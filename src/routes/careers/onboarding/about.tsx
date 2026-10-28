import { createFileRoute } from "@tanstack/react-router";
import AboutYou from "../../../features/catalog/components/AboutYou";

export const Route = createFileRoute("/careers/onboarding/about")({
  component: AboutYou,
});