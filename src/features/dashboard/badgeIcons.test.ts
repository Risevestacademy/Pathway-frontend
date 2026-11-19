import { describe, expect, it } from "vitest";
import trophy from "../../assets/images/dashboard/trophy.png";
import { LOCKED_BADGE_ICON, badgeIconAt } from "./badgeIcons";

describe("badgeIconAt", () => {
  it("gives the first four badges their own icons, in order", () => {
    const icons = [0, 1, 2, 3].map(badgeIconAt);

    expect(icons[0]).toContain("badge-cube");
    expect(icons[1]).toContain("badge-hexagon");
    expect(icons[2]).toContain("badge-sparkle");
    expect(icons[3]).toContain("badge-flame");
  });

  it("falls back to the trophy after that", () => {
    expect(badgeIconAt(4)).toBe(trophy);
    expect(badgeIconAt(20)).toBe(trophy);
  });

  it("has a locked icon", () => {
    expect(LOCKED_BADGE_ICON).toContain("badge-locked");
  });
});
