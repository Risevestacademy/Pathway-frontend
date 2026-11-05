import { useCareerProgress } from "../../progress/hooks/useCareerProgress";
import { ProgressPill } from "./ProgressPill";

/** The progress pill for a career, shown only when it is the signed-in person's active pathway. */
export function CareerProgressPill({ careerId }: { careerId: string }) {
  const { progress } = useCareerProgress(careerId);
  if (progress.kind !== "active") return null;

  return <ProgressPill completed={progress.progress.completed} total={progress.progress.total} />;
}
