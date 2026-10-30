import { afterAll, afterEach, beforeEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { api, __resetAuthInterceptorState, setSessionExpiredHandler } from './axios'
import { useAuthStore } from '../stores/authStore'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
const onSessionExpired = vi.fn()

beforeEach(() => {
  __resetAuthInterceptorState()
  onSessionExpired.mockClear()
  setSessionExpiredHandler(onSessionExpired)
})
afterEach(() => {
  server.resetHandlers()
  useAuthStore.getState().clearAuth()
})
afterAll(() => server.close())

const testUser = { id: '1', email: 'a@a.com', role: 'USER' }

describe('axios refresh flow', () => {
  it('sends only one /auth/refresh request for two concurrent 401s', async () => {
    let refreshCallCount = 0

    server.use(
      http.get('*/careers', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh-token'
          ? HttpResponse.json({ data: 'careers-ok' })
          : HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      ),
      http.get('*/progress', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh-token'
          ? HttpResponse.json({ data: 'progress-ok' })
          : HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      ),
      http.post('*/auth/refresh', () => {
        refreshCallCount += 1
        return HttpResponse.json({ data: { accessToken: 'fresh-token' } })
      })
    )

    useAuthStore.getState().setAuth(testUser, 'stale-token')

    const [careers, progress] = await Promise.all([api.get('/careers'), api.get('/progress')])

    expect(refreshCallCount).toBe(1)
    expect(careers.data).toEqual({ data: 'careers-ok' })
    expect(progress.data).toEqual({ data: 'progress-ok' })
  })

  it('retries all queued requests with the new token after a successful refresh', async () => {
    server.use(
      http.get('*/careers', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh-token'
          ? HttpResponse.json({ data: 'careers-ok' })
          : HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      ),
      http.get('*/progress', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh-token'
          ? HttpResponse.json({ data: 'progress-ok' })
          : HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      ),
      http.post('*/auth/refresh', () =>
        HttpResponse.json({ data: { accessToken: 'fresh-token' } })
      )
    )

    useAuthStore.getState().setAuth(testUser, 'stale-token')

    const [careers, progress] = await Promise.all([api.get('/careers'), api.get('/progress')])

    expect(careers.data).toEqual({ data: 'careers-ok' })
    expect(progress.data).toEqual({ data: 'progress-ok' })
    expect(useAuthStore.getState().accessToken).toBe('fresh-token')
  })

  it('rejects all queued requests and ends the session once when the refresh itself fails', async () => {
    server.use(
      http.get('*/careers', () => HttpResponse.json({ message: 'unauthorized' }, { status: 401 })),
      http.get('*/progress', () => HttpResponse.json({ message: 'unauthorized' }, { status: 401 })),
      http.post('*/auth/refresh', () => HttpResponse.json({ message: 'refresh failed' }, { status: 401 }))
    )

    useAuthStore.getState().setAuth(testUser, 'stale-token')

    const results = await Promise.allSettled([api.get('/careers'), api.get('/progress')])

    expect(results[0].status).toBe('rejected')
    expect(results[1].status).toBe('rejected')
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
  })

  it('does not loop when /auth/refresh itself returns 401', async () => {
    let refreshCallCount = 0
    server.use(
      http.get('*/careers', () => HttpResponse.json({ message: 'unauthorized' }, { status: 401 })),
      http.post('*/auth/refresh', () => {
        refreshCallCount += 1
        return HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      })
    )

    useAuthStore.getState().setAuth(testUser, 'stale-token')

    await expect(api.get('/careers')).rejects.toBeTruthy()
    expect(refreshCallCount).toBe(1)
  })
})

describe('skipAuthRefresh', () => {
  it('rejects a 401 without refreshing or ending the session', async () => {
    let refreshCallCount = 0
    server.use(
      http.post('*/auth/some-new-endpoint', () =>
        HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      ),
      http.post('*/auth/refresh', () => {
        refreshCallCount += 1
        return HttpResponse.json({ data: { accessToken: 'fresh' } })
      })
    )
    useAuthStore.getState().setAuth(testUser, 'token')

    await expect(
      api.post('/auth/some-new-endpoint', {}, { skipAuthRefresh: true })
    ).rejects.toMatchObject({ response: { status: 401 } })

    expect(refreshCallCount).toBe(0)
    expect(onSessionExpired).not.toHaveBeenCalled()
    expect(useAuthStore.getState().accessToken).toBe('token')
  })

  it('still refreshes the same request when the flag is not set', async () => {
    let refreshCallCount = 0
    server.use(
      http.post('*/auth/some-new-endpoint', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh'
          ? HttpResponse.json({ ok: true })
          : HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
      ),
      http.post('*/auth/refresh', () => {
        refreshCallCount += 1
        return HttpResponse.json({ data: { accessToken: 'fresh' } })
      })
    )
    useAuthStore.getState().setAuth(testUser, 'stale')

    const response = await api.post('/auth/some-new-endpoint', {})

    expect(response.data).toEqual({ ok: true })
    expect(refreshCallCount).toBe(1)
  })
})
