import { create } from 'zustand'

interface User {
  id: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isHydrating: boolean
  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  clearAuth: () => void
  finishHydrating: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isHydrating: true,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  finishHydrating: () => set({ isHydrating: false }),
}))

export const selectIsAuthenticated = (state: AuthState) =>
  Boolean(state.user && state.accessToken)