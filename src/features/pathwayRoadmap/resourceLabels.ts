import type { Resource } from "../resources/resources.types";

export const KIND_LABEL: Record<Resource["kind"], string> = {
  article: "Article",
  course: "Course",
  documentation: "Docs",
  interactive: "Interactive",
  video: "Video",
  book: "Book",
  certification: "Certification",
};

/** "Course: free" as "Free". */
export const costChip = (label: string) =>
  label.replace(/^Course: /, "").replace(/^./, (c) => c.toUpperCase());

export const costTone = (label: string) =>
  /free/i.test(label) ? ("success" as const) : /paid/i.test(label) ? ("warning" as const) : ("unavailable" as const);
