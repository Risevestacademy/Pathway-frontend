import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse, type JsonBodyType } from 'msw'
import { setupServer } from 'msw/node'
import { CareerNotSavedError } from './pathways.api'
import { fetchQuiz, fetchQuizResult, submitQuiz } from './pathwayQuiz.api'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const quiz = {
  id: 'q1',
  stageId: 'g1',
  questions: [
    { id: 'a1', prompt: 'Which keyword declares a constant?', options: [{ id: 'o1', text: 'const' }, { id: 'o2', text: 'var' }] },
  ],
}

const breakdown = [
  {
    questionId: 'a1',
    prompt: 'Which keyword declares a constant?',
    selectedOptionId: 'o2',
    selectedOptionText: 'var',
    correctOptionId: 'o1',
    correctOptionText: 'const',
    isCorrect: false,
  },
]

const result = {
  quizId: 'q1',
  score: { correct: 0, total: 1 },
  passed: false,
  revisitStepId: 's1',
  breakdown,
  submittedAt: '2026-11-23T14:45:47.582Z',
}

function seen() {
  return [] as { pathwayId: unknown; stageId: unknown; body?: unknown }[]
}

describe('fetchQuiz', () => {
  function respondWith(status: number, body: JsonBodyType = quiz) {
    const calls = seen()
    server.use(
      http.get('*/pathways/:pathwayId/stages/:stageId/quiz', ({ params }) => {
        calls.push({ pathwayId: params.pathwayId, stageId: params.stageId })
        return HttpResponse.json(body, { status })
      }),
    )
    return calls
  }

  it('returns the questions with their options', async () => {
    const calls = respondWith(200)

    await expect(fetchQuiz('p1', 'g1')).resolves.toEqual(quiz)
    expect(calls).toEqual([{ pathwayId: 'p1', stageId: 'g1' }])
  })

  it.each([404, 400])('returns null on a %s, so the page can say there is no quiz', async (status) => {
    respondWith(status)

    await expect(fetchQuiz('p1', 'g1')).resolves.toBeNull()
  })

  it.each([401, 500])('rethrows a %s', async (status) => {
    respondWith(status)

    await expect(fetchQuiz('p1', 'g1')).rejects.toThrow()
  })
})

describe('fetchQuizResult', () => {
  function respondWith(status: number, body: JsonBodyType = result) {
    const calls = seen()
    server.use(
      http.get('*/pathways/:pathwayId/stages/:stageId/quiz/result', ({ params }) => {
        calls.push({ pathwayId: params.pathwayId, stageId: params.stageId })
        return HttpResponse.json(body, { status })
      }),
    )
    return calls
  }

  it('returns the latest attempt with its breakdown', async () => {
    const calls = respondWith(200)

    await expect(fetchQuizResult('p1', 'g1')).resolves.toEqual(result)
    expect(calls).toEqual([{ pathwayId: 'p1', stageId: 'g1' }])
  })

  it.each([404, 400])('returns null on a %s, which includes a quiz not yet submitted', async (status) => {
    respondWith(status)

    await expect(fetchQuizResult('p1', 'g1')).resolves.toBeNull()
  })

  it.each([401, 500])('rethrows a %s', async (status) => {
    respondWith(status)

    await expect(fetchQuizResult('p1', 'g1')).rejects.toThrow()
  })
})

describe('submitQuiz', () => {
  const answers = [{ questionId: 'a1', optionId: 'o2' }]
  const graded = {
    ...result,
    xpAwarded: 20,
    nextStepId: 's2',
    streak: { current: 3, longest: 7 },
  }

  function respondWith(status: number, body: JsonBodyType = graded) {
    const calls = seen()
    server.use(
      http.post('*/pathways/:pathwayId/stages/:stageId/quiz/submit', async ({ params, request }) => {
        calls.push({ pathwayId: params.pathwayId, stageId: params.stageId, body: await request.json() })
        return HttpResponse.json(body, { status })
      }),
    )
    return calls
  }

  it('sends the answers and returns the graded result', async () => {
    const calls = respondWith(200)

    await expect(submitQuiz('p1', 'g1', answers)).resolves.toEqual(graded)
    expect(calls).toEqual([{ pathwayId: 'p1', stageId: 'g1', body: { answers } }])
  })

  it('throws a CareerNotSavedError on a 409', async () => {
    respondWith(409)

    await expect(submitQuiz('p1', 'g1', answers)).rejects.toBeInstanceOf(CareerNotSavedError)
  })

  it.each([400, 401, 404, 500])('rethrows a %s as a plain failure', async (status) => {
    respondWith(status)

    const failure = await submitQuiz('p1', 'g1', answers).catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(Error)
    expect(failure).not.toBeInstanceOf(CareerNotSavedError)
  })
})
