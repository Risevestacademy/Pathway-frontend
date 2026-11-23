import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLocalRecord,
  markChecked,
  readCheckedAt,
  readDraft,
  writeDraft,
} from "./skillCheck.storage";

beforeEach(() => localStorage.clear());

describe("skill check storage on this device", () => {
  it("keeps a draft per person and career", () => {
    writeDraft("u1", "c1", { answers: { html: "HAVE" }, areaId: "s1" });

    expect(readDraft("u1", "c1")).toEqual({ answers: { html: "HAVE" }, areaId: "s1" });
    expect(readDraft("u2", "c1")).toBeNull();
    expect(readDraft("u1", "c2")).toBeNull();
  });

  it("forgets the draft and remembers the date once the check is saved", () => {
    writeDraft("u1", "c1", { answers: { html: "HAVE" }, areaId: null });
    markChecked("u1", "c1", new Date("2026-11-20T10:00:00.000Z"));

    expect(readDraft("u1", "c1")).toBeNull();
    expect(readCheckedAt("u1", "c1")).toBe("2026-11-20T10:00:00.000Z");
  });

  it("clears everything for a retake", () => {
    markChecked("u1", "c1");
    clearLocalRecord("u1", "c1");

    expect(readCheckedAt("u1", "c1")).toBeNull();
  });

  it("treats unreadable data as empty", () => {
    localStorage.setItem("pathway.skill-check.v2.u1.c1", "{oops");

    expect(readDraft("u1", "c1")).toBeNull();
    expect(readCheckedAt("u1", "c1")).toBeNull();
  });
});
