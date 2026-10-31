import type { RoadmapStep } from "../../features/pathway/pathway.types";
import type {
  ActivePathwayDto,
  PathwayProgressDto,
  PathwayStepStatus,
  SavedPathwayDto,
} from "../../lib/api/progress.api";

export const CAREER_ID = "c-frontend";
export const OTHER_CAREER_ID = "c-data";

export const roadmapSteps: RoadmapStep[] = [
  { stepId: "s1", title: "HTML", learningObjective: "", prerequisites: [], expectedEvidence: "", resourceIds: [] },
  { stepId: "s2", title: "CSS", learningObjective: "", prerequisites: [], expectedEvidence: "", resourceIds: [] },
  { stepId: "s3", title: "JavaScript", learningObjective: "", prerequisites: [], expectedEvidence: "", resourceIds: [] },
];

export function pathwayProgress(
  overrides: Partial<PathwayProgressDto> = {},
): PathwayProgressDto {
  return {
    completed: 1,
    total: 3,
    percentage: 33,
    nextStepId: "s2",
    selfReported: true,
    startStepId: null,
    ...overrides,
  };
}

/** The user's active pathway, with step statuses keyed by step id. */
export function activePathway(
  careerId: string,
  statuses: Record<string, PathwayStepStatus> = { s1: "COMPLETED" },
  progress: PathwayProgressDto = pathwayProgress(),
): ActivePathwayDto {
  return {
    career: {
      id: careerId,
      slug: careerId,
      title: careerId === CAREER_ID ? "Frontend Developer" : "Data Analyst",
      roleSummary: "",
      retired: false,
    },
    pathway: { id: `p-${careerId}`, title: "Pathway" },
    progress,
    steps: roadmapSteps.map((step, index) => ({
      id: step.stepId,
      order: index + 1,
      title: step.title,
      skills: [],
      status: statuses[step.stepId] ?? "NOT_STARTED",
    })),
  };
}

export const noActivePathway: ActivePathwayDto = {
  career: null,
  pathway: null,
  progress: null,
  steps: [],
};

export function savedPathway(careerId: string, isActive: boolean): SavedPathwayDto {
  return {
    career: { id: careerId, slug: careerId, title: careerId, retired: false },
    isActive,
    progress: { completed: 2, total: 5, percentage: 40 },
  };
}
