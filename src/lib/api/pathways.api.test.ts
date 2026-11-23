import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { setupServer } from 'msw/node'
import { fetchPathwayById, fetchPathwayOrNull } from './pathways.api'

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

const detail = {
  id: 'p1',
  career: { id: 'c1', title: 'Frontend', description: '', retired: false, stageCount: 1, stepCount: 1, resourceCount: 1 },
  progress: { completed: 0, total: 1, percentage: 0, nextStepId: 's1', selfReported: true },
  stages: [],
}

function respondToDetailWith(status: number, body: JsonBodyType = {}) {
  server.use(http.get('*/pathways/:id', () => HttpResponse.json(body, { status })))
}

describe('fetchPathwayById', () => {
  it('returns the pathway with its stages and progress', async () => {
    respondToDetailWith(200, detail)
    await expect(fetchPathwayById('p1')).resolves.toEqual(detail)
  })

  it('asks for the pathway by its own id', async () => {
    const ids: unknown[] = []
    server.use(
      http.get('*/pathways/:id', ({ params }) => {
        ids.push(params.id)
        return HttpResponse.json(detail)
      }),
    )
    await fetchPathwayById('p1')
    expect(ids).toEqual(['p1'])
  })

  it('returns null when the pathway is not found or its career is a draft', async () => {
    respondToDetailWith(404)
    await expect(fetchPathwayById('p1')).resolves.toBeNull()
  })

  it('returns null when the id is not a valid UUID', async () => {
    respondToDetailWith(400)
    await expect(fetchPathwayById('nope')).resolves.toBeNull()
  })

  it('rethrows other failures so the error screen can offer a retry', async () => {
    respondToDetailWith(500)
    await expect(fetchPathwayById('p1')).rejects.toThrow()
  })
})
