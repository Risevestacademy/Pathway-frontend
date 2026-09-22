import { create } from 'zustand'

interface User {
  id: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isHydrating: boolean
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  setAccessToken: (accessToken: string) => void
  finishHydrating: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isHydrating: true,
  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),
  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
  finishHydrating: () => set({ isHydrating: false }),
  setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true }),
}))