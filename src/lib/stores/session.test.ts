import { beforeEach, describe, expect, it } from "vitest";
import { MAX_EXPERIENCE_ENTRIES, useSession } from "./session";

type SessionSnapshot = ReturnType<typeof useSession.getState>;

const runMigrate = async (state: unknown, version: number) =>
  (await useSession
    .persist.getOptions()
    .migrate?.(state, version)) as SessionSnapshot;

beforeEach(() => {
  useSession.getState().clearOptional();
  useSession.getState().clearFilters();
});

describe("experience entries", () => {
  it("starts with one empty entry", () => {
    expect(useSession.getState().experience).toEqual([
      { id: expect.any(String), years: null, jobType: null },
    ]);
  });

  it("stops adding entries at the maximum", () => {
    for (let i = 0; i < MAX_EXPERIENCE_ENTRIES + 2; i++) {
      useSession.getState().addExperience();
    }
    expect(useSession.getState().experience).toHaveLength(
      MAX_EXPERIENCE_ENTRIES,
    );
  });

  it("updates only the entry at the given index", () => {
    useSession.getState().addExperience();
    useSession.getState().updateExperience(1, { years: "ONE_TO_TWO" });
    expect(useSession.getState().experience).toEqual([
      { id: expect.any(String), years: null, jobType: null },
      { id: expect.any(String), years: "ONE_TO_TWO", jobType: null },
    ]);
  });

    it("keeps the other entry's id and values when an earlier entry is removed", () => {
    useSession.getState().addExperience();
    useSession.getState().updateExperience(1, { years: "ONE_TO_TWO" });
    const secondId = useSession.getState().experience[1].id;

    useSession.getState().removeExperience(0);

    expect(useSession.getState().experience).toEqual([
      { id: secondId, years: "ONE_TO_TWO", jobType: null },
    ]);
  });

  it("removes an entry but always keeps one", () => {
    useSession.getState().addExperience();
    useSession.getState().removeExperience(0);
    useSession.getState().removeExperience(0);
    expect(useSession.getState().experience).toHaveLength(1);
  });
});

describe("clearing answers", () => {
  it("clearOptional keeps the level and resets everything else", () => {
    const state = useSession.getState();
    state.setLevel("recent-graduate");
    state.setDegree("BACHELOR");
    state.setSkills(["skill-1"]);
    state.setInterest("design");
    state.setGoal("FIRST_JOB");
    state.clearOptional();

    const next = useSession.getState();
    expect(next.level).toBe("recent-graduate");
    expect(next.degree).toBeNull();
    expect(next.skills).toEqual([]);
    expect(next.interest).toBeNull();
    expect(next.goal).toBeNull();
  });

  it("clearGoals resets only the goals screen answers", () => {
    const state = useSession.getState();
    state.setSkills(["skill-1"]);
    state.setStrengths(["CSS"]);
    state.setGoal("FIRST_JOB");
    state.setTimeCommitment("UNDER_5");
    state.clearGoals();

    const next = useSession.getState();
    expect(next.skills).toEqual(["skill-1"]);
    expect(next.strengths).toEqual([]);
    expect(next.goal).toBeNull();
    expect(next.timeCommitment).toBeNull();
  });
});

describe("persisted session migration", () => {
  it("keeps level and interest from version 1 and drops name-based skills", async () => {
    const result = await runMigrate(
      { level: "recent-graduate", skills: ["JavaScript"], interest: "design" },
      1,
    );
    expect(result.level).toBe("recent-graduate");
    expect(result.interest).toBe("design");
    expect(result.skills).toEqual([]);
  });

  it("keeps only the level from version 0", async () => {
    const result = await runMigrate(
      { level: "early-career", interests: ["design"] },
      0,
    );
    expect(result.level).toBe("early-career");
    expect(result.interest).toBeNull();
  });
});