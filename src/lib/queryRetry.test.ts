import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { retryUnlessClientError } from './queryRetry'

function httpError(status: number) {
  return new AxiosError('failed', undefined, undefined, undefined, {
    status,
  } as AxiosResponse)
}

describe('retryUnlessClientError', () => {
  it('does not retry a 404', () => {
    expect(retryUnlessClientError(0, httpError(404))).toBe(false)
  })

  it.each([429, 500])('retries a %i', (status) => {
    expect(retryUnlessClientError(0, httpError(status))).toBe(true)
  })

  it('retries a network error with no response', () => {
    expect(retryUnlessClientError(0, new AxiosError('Network Error'))).toBe(true)
  })

  it('stops after 3 tries', () => {
    const error = httpError(500)
    expect(retryUnlessClientError(2, error)).toBe(true)
    expect(retryUnlessClientError(3, error)).toBe(false)
  })
})
