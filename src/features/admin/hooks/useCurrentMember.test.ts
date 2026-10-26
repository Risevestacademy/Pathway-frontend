import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useAdminStore } from "../adminStore";
import { SEED_MEMBERS } from "../admin.workflow";
import { useCurrentMember } from "./useCurrentMember";

const signInAs = (email: string) =>
  useAuthStore.getState().setAuth({ id: "u1", email, role: "EDITOR" }, "token");

afterEach(() => {
  useAuthStore.getState().clearAuth();
  useAdminStore.getState().reset();
});

describe("useCurrentMember", () => {
  it("gives no access to someone who is not on the team list", () => {
    signInAs("stranger@example.com");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.member).toBeUndefined();
    expect(result.current.canReview).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("gives no access when nobody is signed in", () => {
    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.canReview).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("follows the roles of the matching team member, ignoring email case", () => {
    const member = SEED_MEMBERS.find((m) => m.roles.includes("admin"))!;
    signInAs(member.email.toUpperCase());

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.member?.id).toBe(member.id);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canReview).toBe(true);
  });
});

describe("useCurrentMember for the project owner", () => {
  it("is an admin from a fresh team list", () => {
    signInAs("adejolanu@gmail.com");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canReview).toBe(true);
    expect(result.current.displayName).toBe("Esther A.");
  });
});
