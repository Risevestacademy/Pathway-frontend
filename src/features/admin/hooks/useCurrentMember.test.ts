import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuthStore } from "../../../lib/stores/authStore";
import { useAdminStore } from "../adminStore";
import { useCurrentMember } from "./useCurrentMember";

const signInAs = (email: string, role: string) =>
  useAuthStore.getState().setAuth({ id: "u1", email, role }, "token");

afterEach(() => {
  useAuthStore.getState().clearAuth();
  useAdminStore.getState().reset();
});

describe("useCurrentMember access", () => {
  it("gives admins admin and review rights", () => {
    signInAs("ada@example.com", "ADMIN");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canReview).toBe(true);
  });

  it("lets reviewers review but not manage the team", () => {
    signInAs("grace@example.com", "REVIEWER");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.canReview).toBe(true);
  });

  it.each(["EDITOR", "PUBLISHER", "USER", ""])("gives %j no admin or review rights", (role) => {
    signInAs("someone@example.com", role);

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.canReview).toBe(false);
  });

  it("ignores the case of the role", () => {
    signInAs("ada@example.com", "admin");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.isAdmin).toBe(true);
  });

  it("gives no access when nobody is signed in", () => {
    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.canReview).toBe(false);
  });
});

describe("useCurrentMember name", () => {
  it("makes a name from the email", () => {
    signInAs("grace.hopper@example.com", "ADMIN");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.fullName).toBe("Grace Hopper");
    expect(result.current.displayName).toBe("Grace H.");
  });

  it("is empty when nobody is signed in", () => {
    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.fullName).toBe("");
    expect(result.current.displayName).toBe("You");
  });
});

describe("useCurrentMember full name", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("prefers the name the server sent in the session", () => {
    useAuthStore
      .getState()
      .setAuth({ id: "u1", email: "ada@example.com", role: "ADMIN", fullName: "Ada Lovelace" }, "t");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.fullName).toBe("Ada Lovelace");
    expect(result.current.displayName).toBe("Ada L.");
  });

  it("uses the configured admin's full name when the session has none", () => {
    vi.stubEnv("VITE_ADMIN_OWNER_EMAIL", "owner@example.com");
    vi.stubEnv("VITE_ADMIN_OWNER_NAME", "Esther Adejola");
    useAdminStore.getState().reset();
    signInAs("owner@example.com", "ADMIN");

    const { result } = renderHook(() => useCurrentMember());

    expect(result.current.fullName).toBe("Esther Adejola");
  });
});

describe("the team list", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("holds only the configured admin", () => {
    vi.stubEnv("VITE_ADMIN_OWNER_EMAIL", "owner@example.com");
    vi.stubEnv("VITE_ADMIN_OWNER_NAME", "Esther Adejola");
    useAdminStore.getState().reset();

    expect(useAdminStore.getState().members).toEqual([
      expect.objectContaining({
        name: "Esther Adejola",
        email: "owner@example.com",
        roles: ["admin"],
        serverManaged: true,
      }),
    ]);
  });

  it("is empty when no admin is configured", () => {
    vi.stubEnv("VITE_ADMIN_OWNER_EMAIL", "");
    useAdminStore.getState().reset();

    expect(useAdminStore.getState().members).toEqual([]);
  });
});
