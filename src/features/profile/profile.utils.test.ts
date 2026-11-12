import { describe, expect, it } from "vitest";
import {
  displayName,
  progressPercent,
  splitName,
  stepsLabel,
  validateName,
} from "./profile.utils";

describe("splitName", () => {
  it("uses the first and last name when the API sends them", () => {
    expect(splitName({ firstName: " Ada ", lastName: "Obi", fullName: "Ada Obi" })).toEqual({
      firstName: "Ada",
      lastName: "Obi",
    });
  });

  it("falls back to the full name for older accounts", () => {
    expect(splitName({ firstName: null, lastName: null, fullName: "Ada Grace Obi" })).toEqual({
      firstName: "Ada",
      lastName: "Grace Obi",
    });
  });

  it("returns empty names when nothing is known", () => {
    expect(splitName({})).toEqual({ firstName: "", lastName: "" });
  });
});

describe("displayName", () => {
  it("prefers the full name, then the parts, then the email", () => {
    expect(displayName({ fullName: "Ada Obi", email: "a@b.c" })).toBe("Ada Obi");
    expect(displayName({ firstName: "Ada", lastName: "Obi", email: "a@b.c" })).toBe("Ada Obi");
    expect(displayName({ email: "a@b.c" })).toBe("a@b.c");
  });
});

describe("validateName", () => {
  it("asks for a name when it is blank", () => {
    expect(validateName("   ", "first name")).toBe("Enter your first name.");
    expect(validateName("Ada", "first name")).toBeNull();
  });
});

describe("progress helpers", () => {
  it("rounds the percentage and never passes 100", () => {
    expect(progressPercent(5, 16)).toBe(31);
    expect(progressPercent(0, 0)).toBe(0);
    expect(progressPercent(9, 3)).toBe(100);
  });

  it("uses the singular for one step", () => {
    expect(stepsLabel(5, 16)).toBe("5 of 16 steps complete");
    expect(stepsLabel(0, 1)).toBe("0 of 1 step complete");
  });
});