import { afterEach, describe, expect, it, vi } from "vitest";
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

describe("useCurrentMember for the configured owner", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is an admin when VITE_ADMIN_OWNER_EMAIL matches", () => {
    vi.stubEnv("VITE_ADMIN_OWNER_EMAIL", "owner@example.com");
    vi.stubEnv("VITE_ADMIN_OWNER_NAME", "Ada Lovelace");
    useAdminStore.getState().reset();
    signInAs("owner@example.com");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canReview).toBe(true);
    expect(result.current.displayName).toBe("Ada L.");
  });

  it("seeds nobody extra when the variable is not set", () => {
    vi.stubEnv("VITE_ADMIN_OWNER_EMAIL", "");
    useAdminStore.getState().reset();
    signInAs("owner@example.com");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.member).toBeUndefined();
    expect(result.current.isAdmin).toBe(false);
  });
});

describe("useCurrentMember full name", () => {
  it("uses the team member's name", () => {
    const member = SEED_MEMBERS.find((m) => m.roles.includes("admin"))!;
    signInAs(member.email);

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.fullName).toBe(member.name);
  });

  it("makes a name from the email when the person is not on the team list", () => {
    signInAs("grace.hopper@example.com");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.fullName).toBe("Grace Hopper");
  });

  it("is empty when nobody is signed in", () => {
    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.fullName).toBe("");
  });
});
