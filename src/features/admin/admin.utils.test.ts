import { describe, expect, it } from "vitest";
import { isAdminRole } from "./admin.utils";

describe("isAdminRole", () => {
  it.each(["ADMIN", "CONTENT_ADMIN", "SUPER_ADMIN", "EDITOR", "admin", "Editor"])(
    "lets %s into admin",
    (role) => {
      expect(isAdminRole(role)).toBe(true);
    },
  );

  it.each(["USER", "LEARNER", "", "ADMINISTRATOR"])("keeps %j out", (role) => {
    expect(isAdminRole(role)).toBe(false);
  });

  it("keeps out people with no role", () => {
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });
});
