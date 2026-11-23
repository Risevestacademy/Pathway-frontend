import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { setupServer } from 'msw/node'
import {
  CareerNotSavedError,
  fetchPathwayById,
  fetchPathwayOrNull,
  setStepCompletion,
} from './pathways.api'

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

describe('setStepCompletion', () => {
  const confirmed = {
    stepId: 's1',
    status: 'COMPLETED',
    completedAt: '2026-11-23T13:39:34.785Z',
    progress: { completed: 1, total: 2, percentage: 50, nextStepId: 's2', selfReported: true },
    stageProgress: { completed: 1, total: 2, percentage: 50, stageId: 'g1' },
    nextStepId: 's2',
    xpAwarded: 20,
  }

  function saveRespondsWith(status: number, body: JsonBodyType = confirmed) {
    const seen: { params: unknown; body: unknown }[] = []
    server.use(
      http.put('*/pathways/:pathwayId/steps/:stepId/completion', async ({ params, request }) => {
        seen.push({
          params: { pathwayId: params.pathwayId, stepId: params.stepId },
          body: await request.json(),
        })
        return HttpResponse.json(body, { status })
      }),
    )
    return seen
  }

  it('sets the step by its pathway and returns what the server confirmed', async () => {
    const seen = saveRespondsWith(200)

    await expect(setStepCompletion('p1', 's1', true)).resolves.toEqual(confirmed)
    expect(seen).toEqual([{ params: { pathwayId: 'p1', stepId: 's1' }, body: { completed: true } }])
  })

  it('sends completed: false to undo', async () => {
    const seen = saveRespondsWith(200, { ...confirmed, status: 'NOT_STARTED' })

    await setStepCompletion('p1', 's1', false)

    expect(seen[0].body).toEqual({ completed: false })
  })

  it('throws a CareerNotSavedError on a 409, so the screen can say what to do', async () => {
    saveRespondsWith(409)

    await expect(setStepCompletion('p1', 's1', true)).rejects.toBeInstanceOf(CareerNotSavedError)
  })

  it.each([400, 401, 404, 500])('rethrows a %s as a plain failure', async (status) => {
    saveRespondsWith(status)

    const failure = await setStepCompletion('p1', 's1', true).catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(Error)
    expect(failure).not.toBeInstanceOf(CareerNotSavedError)
  })
})
