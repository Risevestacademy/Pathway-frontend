import { beforeEach, describe, expect, it } from "vitest";
import { clearDraft, readDraft, writeDraft } from "./skillCheck.storage";

beforeEach(() => localStorage.clear());

describe("skill check drafts on this device", () => {
  it("keeps a draft per person and career", () => {
    writeDraft("u1", "c1", { answers: { html: "HAVE" }, areaId: "s1" });

    expect(readDraft("u1", "c1")).toEqual({ answers: { html: "HAVE" }, areaId: "s1" });
    expect(readDraft("u2", "c1")).toBeNull();
    expect(readDraft("u1", "c2")).toBeNull();
  });

  it("forgets the draft once the answers are saved or cleared", () => {
    writeDraft("u1", "c1", { answers: { html: "HAVE" }, areaId: null });
    clearDraft("u1", "c1");

    expect(readDraft("u1", "c1")).toBeNull();
  });

  it("treats unreadable data as no draft", () => {
    localStorage.setItem("pathway.skill-check.draft.v1.u1.c1", "{oops");

    expect(readDraft("u1", "c1")).toBeNull();
  });
});
