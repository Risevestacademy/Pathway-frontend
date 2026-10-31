import { describe, expect, it } from "vitest";
import {
  changedSections,
  describeDiffItem,
  formatDiffValue,
  noticeText,
  sectionLabel,
  type DiffSection,
  type RevisionDiff,
} from "./revisionDiff.types";

const empty: DiffSection = { changed: [], added: [], removed: [], moved: [] };

const diff = (sections: RevisionDiff["sections"]): RevisionDiff => ({
  revisionId: "rev-1",
  title: "A change",
  submittedBy: "Chidi E.",
  submittedAt: "5 hours ago",
  baseVersion: 1,
  liveVersion: 1,
  stale: false,
  blockers: [],
  advisories: [],
  sections,
});

describe("formatDiffValue", () => {
  it("prefers the readable label of a foreign key", () => {
    expect(formatDiffValue("sourceId", "a3f2-uuid", "Jobberman salary guide 2026")).toBe(
      "Jobberman salary guide 2026",
    );
  });

  it("formats money with thousands separators", () => {
    expect(formatDiffValue("median", "230000.00")).toBe("230,000.00");
    expect(formatDiffValue("percentile75", "420000")).toBe("420,000.00");
  });

  it("leaves a non-money number as it is", () => {
    expect(formatDiffValue("baseYear", 2026)).toBe("2026");
  });

  it("joins lists and shows a dash for nothing", () => {
    expect(formatDiffValue("targetLevels", ["STUDENT", "RECENT_GRAD"])).toBe("STUDENT, RECENT_GRAD");
    expect(formatDiffValue("targetLevels", [])).toBe("—");
    expect(formatDiffValue("roleSummary", null)).toBe("—");
    expect(formatDiffValue("roleSummary", "")).toBe("—");
  });

  it("does not format text that only looks like a number as money", () => {
    expect(formatDiffValue("title", "2026")).toBe("2026");
    expect(formatDiffValue("median", "not a number")).toBe("not a number");
  });

  it("writes booleans as Yes or No", () => {
    expect(formatDiffValue("featured", true)).toBe("Yes");
    expect(formatDiffValue("featured", false)).toBe("No");
  });
});

describe("noticeText", () => {
  it("reads plain text and objects with a message", () => {
    expect(noticeText("Add at least one step")).toBe("Add at least one step");
    expect(noticeText({ code: "NO_STEPS", message: "Add at least one step" })).toBe(
      "Add at least one step",
    );
  });
});

describe("changedSections", () => {
  it("lists only sections with something in them, in a fixed order", () => {
    const result = changedSections(
      diff({
        outlook: { ...empty, changed: [{ field: "median", label: "Median", before: "1", after: "2" }] },
        career: { ...empty, added: [{ label: "A" }] },
        steps: empty,
      }),
    );

    expect(result.map((s) => s.name)).toEqual(["career", "outlook"]);
  });

  it("keeps a section the app doesn’t know yet, after the known ones", () => {
    const result = changedSections(
      diff({ career: { ...empty, removed: [{ label: "x" }] }, badges: { ...empty, moved: [{}] } }),
    );

    expect(result.map((s) => s.name)).toEqual(["career", "badges"]);
  });
});

describe("sectionLabel", () => {
  it("names the known sections and tidies an unknown one", () => {
    expect(sectionLabel("career")).toBe("Career details");
    expect(sectionLabel("outlook")).toBe("Outlook and salary");
    expect(sectionLabel("badges")).toBe("Badges");
  });
});

describe("describeDiffItem", () => {
  it("uses the first name-like field", () => {
    expect(describeDiffItem({ label: "Linux basics", title: "ignored" })).toBe("Linux basics");
    expect(describeDiffItem({ id: "x", title: "Learn Git" })).toBe("Learn Git");
    expect(describeDiffItem({ name: "Docker" })).toBe("Docker");
  });

  it("falls back to any text it can find, then to a plain placeholder", () => {
    expect(describeDiffItem({ order: 2, note: "Second step" })).toBe("Second step");
    expect(describeDiffItem({ order: 2 })).toBe("Unnamed item");
    expect(describeDiffItem({ title: "   " })).toBe("Unnamed item");
  });
});
