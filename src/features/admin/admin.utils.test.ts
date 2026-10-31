import { describe, expect, it } from "vitest";
import { isAdminRole, toAdminRowFromList } from "./admin.utils";

describe("isAdminRole", () => {
  it.each(["ADMIN", "EDITOR", "REVIEWER", "PUBLISHER", "admin", "Editor"])(
    "lets %s into admin",
    (role) => {
      expect(isAdminRole(role)).toBe(true);
    },
  );

  it.each(["USER", "LEARNER", "", "ADMINISTRATOR", "SUPER_ADMIN"])("keeps %j out", (role) => {
    expect(isAdminRole(role)).toBe(false);
  });

  it("keeps out people with no role", () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });
});

describe("toAdminRowFromList", () => {
  const item = (status: "DRAFT" | "PUBLISHED" | "RETIRED") => ({
    id: "c1",
    slug: "c1",
    title: "DevOps Engineer",
    status,
    version: 2,
    updatedAt: "2026-10-28T10:30:00.000Z",
  });

  it("knows a draft is a draft without loading its detail", () => {
    const row = toAdminRowFromList(item("DRAFT"), undefined);

    expect(row).toMatchObject({
      id: "c1",
      title: "DevOps Engineer",
      status: "draft",
      stepCount: null,
      sources: null,
      updatedAt: "2026-10-28T10:30:00.000Z",
    });
  });

  it("maps every API status", () => {
    expect(toAdminRowFromList(item("PUBLISHED"), undefined).status).toBe("published");
    expect(toAdminRowFromList(item("RETIRED"), undefined).status).toBe("retired");
  });

  it("takes the summary, step count and source health from the detail", () => {
    const detail = {
      description: "Automates delivery.",
      pathway: { id: "p", title: "t", stepCount: 4 },
      outlook: [],
    } as unknown as Parameters<typeof toAdminRowFromList>[1];

    const row = toAdminRowFromList(item("DRAFT"), detail);

    expect(row.shortDescription).toBe("Automates delivery.");
    expect(row.stepCount).toBe(4);
    expect(row.sources).toEqual({ health: "missing", label: "Missing outlook" });
  });
});
