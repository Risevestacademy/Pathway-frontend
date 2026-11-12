import { usePathwayCards } from "../hooks/usePathwayCards";
import { RoadmapScreen } from "./RoadmapScreen";

/** My Pathway's Roadmap tab, with the person's own pathways loaded in. */
export function RoadmapPage() {
  const { state, retry } = usePathwayCards();
  return <RoadmapScreen state={state} onRetry={retry} />;
}
