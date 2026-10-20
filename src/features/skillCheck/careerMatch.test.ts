import { describe, expect, it } from "vitest";
import { findSkillCheckCareerByTitle } from "./careerMatch";

describe("findSkillCheckCareerByTitle", () => {
  it("matches regardless of case, spaces and hyphens", () => {
    expect(findSkillCheckCareerByTitle("Front-end Developer")?.careerId).toBe("frontend-developer");
    expect(findSkillCheckCareerByTitle("ux designer")?.careerId).toBe("ux-designer");
  });

  it("returns null for a career with no skill list", () => {
    expect(findSkillCheckCareerByTitle("Marine Biologist")).toBeNull();
  });
});
