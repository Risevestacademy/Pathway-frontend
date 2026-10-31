import { describe, expect, it } from "vitest";
import { findSkillCheckCareerByTitle, resolveRealCareerId } from "./careerMatch";

describe("findSkillCheckCareerByTitle", () => {
  it("matches regardless of case, spaces and hyphens", () => {
    expect(findSkillCheckCareerByTitle("Front-end Developer")?.careerId).toBe("frontend-developer");
    expect(findSkillCheckCareerByTitle("ux designer")?.careerId).toBe("ux-designer");
  });

  it("treats engineer and developer as the same word", () => {
    expect(findSkillCheckCareerByTitle("Frontend Engineer")?.careerId).toBe("frontend-developer");
    expect(findSkillCheckCareerByTitle("Backend Engineering")?.careerId).toBe("backend-developer");
  });

  it("matches by slug or a known alternative title", () => {
    expect(findSkillCheckCareerByTitle("Something else", "backend-developer")?.careerId).toBe(
      "backend-developer",
    );
    expect(findSkillCheckCareerByTitle("UI/UX Designer")?.careerId).toBe("ux-designer");
  });

  it("matches the real API career titles", () => {
    const ids = ["Backend Engineer", "Data Analyst", "Frontend Engineer", "QA Engineer", "UI/UX Designer"].map(
      (title) => findSkillCheckCareerByTitle(title)?.careerId ?? null,
    );
    expect(ids).toEqual(["backend-developer", "data-analyst", "frontend-developer", null, "ux-designer"]);
  });

  it("returns null for a career with no skill list", () => {
    expect(findSkillCheckCareerByTitle("Marine Biologist")).toBeNull();
  });
});

describe("resolveRealCareerId", () => {
  const catalogue = [
    { id: "uuid-fe", title: "Frontend Engineer", slug: "frontend-engineer" },
    { id: "uuid-ux", title: "UI/UX Designer", slug: "ui-ux-designer" },
    { id: "uuid-qa", title: "QA Engineer", slug: "qa-engineer" },
  ];

  it("finds the real career a My Pathway career stands for", () => {
    expect(resolveRealCareerId(catalogue, "frontend-developer")).toBe("uuid-fe");
    expect(resolveRealCareerId(catalogue, "ux-designer")).toBe("uuid-ux");
  });

  it("is null when the catalogue has no match, or the id isn’t a My Pathway career", () => {
    expect(resolveRealCareerId(catalogue, "data-analyst")).toBeNull();
    expect(resolveRealCareerId(catalogue, "qa-engineer")).toBeNull();
    expect(resolveRealCareerId([], "frontend-developer")).toBeNull();
  });
});
