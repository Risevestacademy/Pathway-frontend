import type { PathwayStepStatus } from "../../lib/api/progress.api";

/** How each step status reads, and the look of its chip. */
export const STEP_STATUS: Record<PathwayStepStatus, { label: string; chip: string }> = {
  NOT_STARTED: { label: "Not started", chip: "bg-grey-100 text-ink-muted" },
  IN_PROGRESS: { label: "In Progress", chip: "bg-info-50 text-info-700" },
  COMPLETED: { label: "Done", chip: "bg-success-50 text-success-700" },
};
