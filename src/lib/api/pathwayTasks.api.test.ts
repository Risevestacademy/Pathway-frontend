import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { setupServer } from 'msw/node'
import { fetchPathwayTask, fetchPathwayTasks } from './pathwayTasks.api'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const task = {
  id: 't1',
  title: 'Build a typed API client',
  goal: 'Practise generics on a real request helper',
  estimatedWeeks: 1,
  isCompleted: false,
  completedAt: null,
  checklistChecked: 2,
  checklistTotal: 4,
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
        { id: 's1', title: 'Learn TypeScript Basics', order: 1, status: 'NOT_STARTED', completedAt: null, tasks: [task] },
      ],
    },
  ],
}

describe('fetchPathwayTasks', () => {
  function respondWith(status: number, body: JsonBodyType = list) {
    const ids: unknown[] = []
    server.use(
      http.get('*/pathways/:id/tasks', ({ params }) => {
        ids.push(params.id)
        return HttpResponse.json(body, { status })
      }),
    )
    return ids
  }

  it('returns every stage with its steps and their tasks', async () => {
    const ids = respondWith(200)

    await expect(fetchPathwayTasks('p1')).resolves.toEqual(list)
    expect(ids).toEqual(['p1'])
  })

  it.each([404, 400])('returns null on a %s, so the page can say it is not available', async (status) => {
    respondWith(status)

    await expect(fetchPathwayTasks('p1')).resolves.toBeNull()
  })

  it.each([401, 500])('rethrows a %s', async (status) => {
    respondWith(status)

    await expect(fetchPathwayTasks('p1')).rejects.toThrow()
  })
})

const detail = {
  ...task,
  stepId: 's1',
  whatToMake: ['A request helper with types'],
  hints: ['Start with a GET request'],
  checklist: [{ id: 'i1', text: 'Handle a failed request', isChecked: true, checkedAt: '2026-11-23T14:40:56.986Z' }],
  helpfulLinks: [
    {
      id: 'r1',
      title: 'The TypeScript Handbook',
      provider: 'Microsoft',
      type: 'COURSE',
      costStatus: 'FREE',
      url: 'https://www.typescriptlang.org/docs/handbook/',
    },
  ],
}

describe('fetchPathwayTask', () => {
  function respondWith(status: number, body: JsonBodyType = detail) {
    const seen: unknown[] = []
    server.use(
      http.get('*/pathways/:pathwayId/tasks/:taskId', ({ params }) => {
        seen.push({ pathwayId: params.pathwayId, taskId: params.taskId })
        return HttpResponse.json(body, { status })
      }),
    )
    return seen
  }

  it('returns the task with what to make, hints, the ticked checklist and helpful links', async () => {
    const seen = respondWith(200)

    await expect(fetchPathwayTask('p1', 't1')).resolves.toEqual(detail)
    expect(seen).toEqual([{ pathwayId: 'p1', taskId: 't1' }])
  })

  it.each([404, 400])('returns null on a %s', async (status) => {
    respondWith(status)

    await expect(fetchPathwayTask('p1', 't1')).resolves.toBeNull()
  })

  it.each([401, 500])('rethrows a %s', async (status) => {
    respondWith(status)

    await expect(fetchPathwayTask('p1', 't1')).rejects.toThrow()
  })
})
