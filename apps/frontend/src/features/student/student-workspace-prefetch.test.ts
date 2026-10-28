import { beforeEach, describe, expect, it, vi } from 'vitest'

import { prefetchStudentWorkspace } from '@/features/student/student-workspace-prefetch'

describe('Student workspace prefetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not request assessment questions before the entrance result is declared', async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation()
    expect(fallbackFetch).toBeDefined()
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (input.toString() === '/api/v1/student/entrance-examination') {
        return Response.json({
          data: {
            status: 'required',
            result: null,
            policy: {
              ruleReference: 'SELF-DECLARED-TCC-ENTRANCE-2026-01',
              minimum: 1,
              maximum: 5,
              decimalPlaces: 1,
              boardRange: { minimum: 1, maximum: 2.5 },
              nonBoardRange: { minimum: 2.6, maximum: 5 },
              source: 'student_self_declared',
            },
          },
        })
      }

      return fallbackFetch!(input, init)
    })

    await prefetchStudentWorkspace()

    expect(fetch).not.toHaveBeenCalledWith(
      '/api/v1/student/assessments/riasec/questions',
      expect.anything(),
    )
    expect(vi.mocked(fetch).mock.calls.some(([input]) =>
      input.toString() === '/api/v1/student/assessments/riasec/questions',
    )).toBe(false)
  })

  it('prefetches assessment questions after the entrance result is declared', async () => {
    await prefetchStudentWorkspace()

    expect(vi.mocked(fetch).mock.calls.some(([input]) =>
      input.toString() === '/api/v1/student/assessments/riasec/questions',
    )).toBe(true)
  })
})
