import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore, selectIsAuthenticated } from './authStore'

describe('authStore', () => {
  beforeEach(() => useAuthStore.getState().clearAuth())

  it('is not authenticated with neither user nor token', () => {
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false)
  })

  it('is not authenticated with only a token and no user (post-refresh, pre-hydration)', () => {
    useAuthStore.getState().setAccessToken('token-only')
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false)
  })

  it('is authenticated once both user and token are set', () => {
    useAuthStore.getState().setAuth({ id: '1', email: 'a@a.com', role: 'USER' }, 'token')
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true)
  })

  it('clears both on clearAuth', () => {
    useAuthStore.getState().setAuth({ id: '1', email: 'a@a.com', role: 'USER' }, 'token')
    useAuthStore.getState().clearAuth()
    expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false)
  })
})