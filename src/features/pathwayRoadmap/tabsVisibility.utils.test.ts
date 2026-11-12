import { describe, expect, it } from "vitest";
import { showsMyPathwayTabs } from "./tabsVisibility.utils";

describe("showsMyPathwayTabs", () => {
  it.each([
    "/my-pathway",
    "/my-pathway/",
    "/my-pathway/skill-check",
    "/my-pathway/skill-check/",
    "/my-pathway/skill-check/c1/result",
    "/my-pathway/skill-check/c1/roadmap",
  ])("shows them on %s", (path) => {
    expect(showsMyPathwayTabs(path)).toBe(true);
  });

  it.each(["/my-pathway/skill-check/c1", "/my-pathway/skill-check/c1/"])(
    "hides them on the questionnaire (%s)",
    (path) => {
      expect(showsMyPathwayTabs(path)).toBe(false);
    },
  );

  it.each(["/my-pathway/c1/overview", "/my-pathway/c1/resources", "/my-pathway/c1/overview/"])(
    "hides them on a career's own pathway pages (%s)",
    (path) => {
      expect(showsMyPathwayTabs(path)).toBe(false);
    },
  );
});
