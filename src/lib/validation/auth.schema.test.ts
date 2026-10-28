import { describe, expect, it } from "vitest";
import { validateEmail, validatePasswordMatch } from "./auth.schema";

describe("validateEmail", () => {
  it.each([
    ["user@example.com", null],
    ["name+tag@sub.domain.co.uk", null],
    ["", "Invalid email address"],
    ["not-an-email", "Invalid email address"],
  ])("returns %p for %p", (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});

describe("validatePasswordMatch", () => {
  it.each([
    ["Secret123", "Secret123", null],
    ["Secret123", "Secret124", "Passwords do not match"],
  ])("returns %p for %p and %p", (password, confirmPassword, expected) => {
    expect(validatePasswordMatch(password, confirmPassword)).toBe(expected);
  });
});
