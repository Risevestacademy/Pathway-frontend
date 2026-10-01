import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CareerLevel } from "../../types/career.types";

interface SessionState {
  level: CareerLevel | null;
  skills: string[];
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
    },
  ),
);

export const hasOptionalInput = (state: Pick<SessionState, "skills" | "interest">) =>
  state.skills.length > 0 || state.interest !== null;