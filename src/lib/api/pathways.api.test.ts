import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { setupServer } from 'msw/node'
import { fetchPathwayOrNull } from './pathways.api'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const pathway = { id: 'p1', careerId: 'c1', title: 'Path', description: '', steps: [] }

function respondWith(status: number, body: JsonBodyType = {}) {
  server.use(http.get('*/careers/:id/pathway', () => HttpResponse.json(body, { status })))
}

describe('fetchPathwayOrNull', () => {
  it('returns the pathway on success', async () => {
    respondWith(200, { pathway })
    await expect(fetchPathwayOrNull('c1')).resolves.toEqual(pathway)
  })

  it('returns null when the career or pathway is not found', async () => {
    respondWith(404)
    await expect(fetchPathwayOrNull('c1')).resolves.toBeNull()
  })

  it('returns null when the id is rejected as invalid', async () => {
    respondWith(400)
    await expect(fetchPathwayOrNull('not-a-uuid')).resolves.toBeNull()
  })

  it('rethrows other failures so the error screen can offer a retry', async () => {
    respondWith(500)
    await expect(fetchPathwayOrNull('c1')).rejects.toThrow()
  })
})
