export type ContentStatus = "draft" | "published" | "retired";

/** The slice of a career the roadmap screens need. */
export interface RoadmapCareer {
  id: string;
  title: string;
  status: ContentStatus;
  roadmapId: string | null;
}

export interface TimeEstimate {
  hours: number;
  /** An estimate is only shown with its assumptions. Null means omit it. */
  assumptions: { priorKnowledge?: string; weeklyStudyHours?: number } | null;
}

export interface RoadmapStep {
  /** Stable ID, never an array index, so steps can be reordered safely. */
  stepId: string;
  title: string;
  learningObjective: string;
  prerequisites: string[];
  /** Only set when a prerequisite step is explicitly justified as required. */
  requiredPrerequisiteStepId?: string;
  expectedEvidence: string;
  estimate?: TimeEstimate;
  resourceIds: string[];
}

export interface Roadmap {
  id: string;
  careerId: string;
  title: string;
  steps: RoadmapStep[];
}

/** Null when the career doesn't exist or isn't published. */
export type RoadmapLookup = {
  career: RoadmapCareer;
  /** Null when a published career has no roadmap yet. */
  roadmap: Roadmap | null;
} | null;
