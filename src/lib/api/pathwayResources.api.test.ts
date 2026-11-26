import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { setupServer } from 'msw/node'
import { fetchPathwayResource, fetchPathwayResources } from './pathwayResources.api'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const resource = {
  id: 'r1',
  title: 'The TypeScript Handbook',
  provider: 'Microsoft',
  type: 'COURSE',
  costStatus: 'FREE',
  estimatedWeeks: 2,
  lastCheckedDate: '2026-11-23T14:36:49.328Z',
  isCompleted: false,
  completedAt: null,
}

const list = {
  pathwayId: 'p1',
  stages: [
    {
      id: 'g1',
      title: 'Language foundations',
      order: 1,
      progress: { completed: 0, total: 1, percentage: 0 },
      quiz: { status: 'NOT_TAKEN' },
      steps: [
        { id: 's1', title: 'Learn TypeScript Basics', order: 1, status: 'NOT_STARTED', completedAt: null, resources: [resource] },
      ],
    },
  ],
  optionalPaidCourses: [{ ...resource, id: 'r2', costStatus: 'PAID' }],
}

describe('fetchPathwayResources', () => {
  function respondWith(status: number, body: JsonBodyType = list) {
    const ids: unknown[] = []
    server.use(
      http.get('*/pathways/:id/resources', ({ params }) => {
        ids.push(params.id)
        return HttpResponse.json(body, { status })
      }),
    )
    return ids
  }

  it("returns every stage's steps with their resources, and the optional paid courses", async () => {
    const ids = respondWith(200)

    await expect(fetchPathwayResources('p1')).resolves.toEqual(list)
    expect(ids).toEqual(['p1'])
  })

  it.each([404, 400])('returns null on a %s, so the page can say it is not available', async (status) => {
    respondWith(status)

    await expect(fetchPathwayResources('p1')).resolves.toBeNull()
  })

  it.each([401, 500])('rethrows a %s', async (status) => {
    respondWith(status)

    await expect(fetchPathwayResources('p1')).rejects.toThrow()
  })
})

const detail = {
  ...resource,
  description: 'The official guide.',
  outcomes: ['Write type-safe functions'],
  url: 'https://www.typescriptlang.org/docs/handbook/',
  usageNote: 'Read the first three chapters.',
  nextTask: { id: 't1', title: 'Build a typed API client', goal: 'Practise generics', estimatedWeeks: 1 },
}

describe('fetchPathwayResource', () => {
  function respondWith(status: number, body: JsonBodyType = detail) {
    const seen: { params: unknown; stepId: string | null }[] = []
    server.use(
      http.get('*/pathways/:pathwayId/resources/:resourceId', ({ params, request }) => {
        seen.push({
          params: { pathwayId: params.pathwayId, resourceId: params.resourceId },
          stepId: new URL(request.url).searchParams.get('stepId'),
        })
        return HttpResponse.json(body, { status })
      }),
    )
    return seen
  }

  it('returns the resource with its outcomes, link and completion', async () => {
    const seen = respondWith(200)

    await expect(fetchPathwayResource('p1', 'r1')).resolves.toEqual(detail)
    expect(seen).toEqual([{ params: { pathwayId: 'p1', resourceId: 'r1' }, stepId: null }])
  })

  it("asks for the step's usage note and next task when given a step", async () => {
    const seen = respondWith(200)

    await fetchPathwayResource('p1', 'r1', 's1')

    expect(seen[0].stepId).toBe('s1')
  })

  it.each([404, 400])('returns null on a %s', async (status) => {
    respondWith(status)

    await expect(fetchPathwayResource('p1', 'r1')).resolves.toBeNull()
  })

  it.each([401, 500])('rethrows a %s', async (status) => {
    respondWith(status)

    await expect(fetchPathwayResource('p1', 'r1')).rejects.toThrow()
  })
})
