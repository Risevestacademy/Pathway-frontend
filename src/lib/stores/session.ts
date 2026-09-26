import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CareerLevel } from '../../features/catalog/catalog.types'

interface SessionState {
  level: CareerLevel | null
  skills: string[]
  interests: string[]
  setLevel: (level: CareerLevel) => void
  setSkills: (skills: string[]) => void
  setInterests: (interests: string[]) => void
  clearOptional: () => void
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      level: null,
      skills: [],
      interests: [],
      setLevel: (level) => set({ level }),
      setSkills: (skills) => set({ skills }),
      setInterests: (interests) => set({ interests }),
      clearOptional: () => set({ skills: [], interests: [] }),
    }),
    {
      name: 'pathway-onboarding-session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export const hasOptionalInput = (state: Pick<SessionState, 'skills' | 'interests'>) =>
  state.skills.length > 0 || state.interests.length > 0