import { describe, expect, it } from "vitest";
import { isAdminRole } from "./admin.utils";

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
