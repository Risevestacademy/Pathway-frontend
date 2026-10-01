import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CareerLevel } from "../../types/career.types";

interface SessionState {
  level: CareerLevel | null;
  skills: string[];
  /** Career field slug, e.g. "software-engineering". */
  interest: string | null;
  setLevel: (level: CareerLevel) => void;
  setSkills: (skills: string[]) => void;
  setInterest: (interest: string | null) => void;
  clearOptional: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      level: null,
      skills: [],
      interest: null,
      setLevel: (level) => set({ level }),
      setSkills: (skills) => set({ skills }),
      setInterest: (interest) => set({ interest }),
      clearOptional: () => set({ skills: [], interest: null }),
    }),
    {
      name: "pathway-onboarding-session",
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      // v0 stored free-text `interests: string[]`, which the API can't use.
      migrate: (persisted) => {
        const { level = null, skills = [] } = (persisted ?? {}) as Partial<SessionState>;
        return { level, skills, interest: null } as SessionState;
      },
    },
  ),
);

export const hasActiveFilter = (state: Pick<SessionState, "interest">) =>
  state.interest !== null;
