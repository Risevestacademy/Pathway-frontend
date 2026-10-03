import { afterAll, afterEach, beforeEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { api, __resetAuthInterceptorState } from './axios'
import { useAuthStore } from '../stores/authStore'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => __resetAuthInterceptorState())
afterEach(() => {
  server.resetHandlers()
  useAuthStore.getState().clearAuth()
})
afterAll(() => server.close())

const testUser = { id: '1', email: 'a@a.com', role: 'USER' }

function stubLocation() {
  const original = window.location
  const stub: Location = { ...original, href: original.href } as Location
  Object.defineProperty(window, 'location', {
    value: stub,
    writable: true,
    configurable: true,
  })
  return () => {
    Object.defineProperty(window, 'location', {
      value: original,
      writable: true,
      configurable: true,
    })
  }
}

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

  it('rejects all queued requests and logs out when the refresh itself fails', async () => {
    server.use(
      http.get('*/careers', () => HttpResponse.json({ message: 'unauthorized' }, { status: 401 })),
      http.get('*/progress', () => HttpResponse.json({ message: 'unauthorized' }, { status: 401 })),
      http.post('*/auth/refresh', () => HttpResponse.json({ message: 'refresh failed' }, { status: 401 }))
    )

    useAuthStore.getState().setAuth(testUser, 'stale-token')
    const restoreLocation = stubLocation()

    const results = await Promise.allSettled([api.get('/careers'), api.get('/progress')])

    expect(results[0].status).toBe('rejected')
    expect(results[1].status).toBe('rejected')
    expect(useAuthStore.getState().accessToken).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(window.location.href).toBe('/login')

    restoreLocation()
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
    const restoreLocation = stubLocation()

    await expect(api.get('/careers')).rejects.toBeTruthy()
    expect(refreshCallCount).toBe(1)

    restoreLocation()
  })
})