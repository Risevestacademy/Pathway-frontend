import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CareerLevel } from "../../types/career.types";

export const MAX_EXPERIENCE_ENTRIES = 3;

export interface ExperienceEntry {
  years: string | null;
  jobType: string | null;
}

interface SessionAnswers {
  level: CareerLevel | null;
  degree: string | null;
  fieldOfStudy: string | null;
  skills: string[];
  interest: string | null;
  experience: ExperienceEntry[];
  strengths: string[];
  goal: string | null;
  timeCommitment: string | null;
}

interface SessionState extends SessionAnswers {
  setLevel: (level: CareerLevel) => void;
  setDegree: (degree: string | null) => void;
  setFieldOfStudy: (fieldOfStudy: string | null) => void;
  setSkills: (skills: string[]) => void;
  setInterest: (interest: string | null) => void;
  addExperience: () => void;
  updateExperience: (index: number, patch: Partial<ExperienceEntry>) => void;
  removeExperience: (index: number) => void;
  setStrengths: (strengths: string[]) => void;
  setGoal: (goal: string | null) => void;
  setTimeCommitment: (timeCommitment: string | null) => void;
  clearOptional: () => void;
  clearGoals: () => void;
  clearFilters: () => void;
}

const createEmptyOptional = (): Omit<SessionAnswers, "level"> => ({
  degree: null,
  fieldOfStudy: null,
  skills: [],
  interest: null,
  experience: [{ years: null, jobType: null }],
  strengths: [],
  goal: null,
  timeCommitment: null,
});

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      level: null,
      ...createEmptyOptional(),
      setLevel: (level) => set({ level }),
      setDegree: (degree) => set({ degree }),
      setFieldOfStudy: (fieldOfStudy) => set({ fieldOfStudy }),
      setSkills: (skills) => set({ skills }),
      setInterest: (interest) => set({ interest }),
      addExperience: () =>
        set((state) =>
          state.experience.length >= MAX_EXPERIENCE_ENTRIES
            ? state
            : {
                experience: [
                  ...state.experience,
                  { years: null, jobType: null },
                ],
              },
        ),
      updateExperience: (index, patch) =>
        set((state) => ({
          experience: state.experience.map((entry, i) =>
            i === index ? { ...entry, ...patch } : entry,
          ),
        })),
      removeExperience: (index) =>
        set((state) =>
          state.experience.length <= 1
            ? state
            : { experience: state.experience.filter((_, i) => i !== index) },
        ),
      setStrengths: (strengths) => set({ strengths }),
      setGoal: (goal) => set({ goal }),
      setTimeCommitment: (timeCommitment) => set({ timeCommitment }),
      clearOptional: () => set(createEmptyOptional()),
      clearGoals: () =>
        set({ strengths: [], goal: null, timeCommitment: null }),
      clearFilters: () => set({ level: null, interest: null }),
    }),
    {
      name: "pathway-onboarding-session",
      storage: createJSONStorage(() => sessionStorage),
      version: 2,
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as Partial<SessionState>;
        return {
          ...createEmptyOptional(),
          level: old.level ?? null,
          interest: version >= 1 ? (old.interest ?? null) : null,
        } as SessionState;
      },
    },
  ),
);

export const hasActiveFilter = (state: Pick<SessionState, "interest">) =>
  state.interest !== null;