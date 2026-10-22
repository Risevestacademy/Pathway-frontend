import { describe, expect, it } from "vitest";
import { findSkillCheckCareerByTitle } from "./careerMatch";

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

  it("returns null for a career with no skill list", () => {
    expect(findSkillCheckCareerByTitle("Marine Biologist")).toBeNull();
  });
});
