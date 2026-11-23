import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { setupServer } from 'msw/node'
import { fetchPathwayProgress } from './pathwayProgress.api'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const stage = { id: 'g1', title: 'Web foundations', order: 1 }

const progress = {
  pathwayId: 'p1',
  progress: { completed: 1, total: 3, percentage: 33, selfReported: true },
  stages: [
    {
      ...stage,
      progress: { completed: 1, total: 2, percentage: 50 },
      quiz: { status: 'NOT_TAKEN' },
    },
  ],
  completedSteps: [
    { id: 's1', title: 'Structure and style pages', order: 1, stage, completedAt: '2026-11-23T14:41:57.276Z' },
  ],
  nextStep: { id: 's2', title: 'Add behaviour with JavaScript', order: 2, stage },
}

function respondWith(status: number, body: JsonBodyType = progress) {
  const ids: unknown[] = []
  server.use(
    http.get('*/pathways/:id/progress', ({ params }) => {
      ids.push(params.id)
      return HttpResponse.json(body, { status })
    }),
  )
  return ids
}

describe('fetchPathwayProgress', () => {
  it('returns the overall progress, the stages, the completed steps and the next step', async () => {
    const ids = respondWith(200)

    await expect(fetchPathwayProgress('p1')).resolves.toEqual(progress)
    expect(ids).toEqual(['p1'])
  })

  it('passes a pathway with no next step through as null', async () => {
    respondWith(200, { ...progress, nextStep: null })

    await expect(fetchPathwayProgress('p1')).resolves.toMatchObject({ nextStep: null })
  })

  it.each([404, 400])('returns null on a %s, so the page can say it is not available', async (status) => {
    respondWith(status)

    await expect(fetchPathwayProgress('p1')).resolves.toBeNull()
  })

  it.each([401, 500])('rethrows a %s', async (status) => {
    respondWith(status)

    await expect(fetchPathwayProgress('p1')).rejects.toThrow()
  })
})
