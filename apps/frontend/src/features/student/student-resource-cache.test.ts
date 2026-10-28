import { describe, expect, it, vi } from 'vitest'

import {
  getCachedStudentResource,
  invalidateStudentResources,
  setCachedStudentResource,
} from '@/features/student/student-resource-cache'

describe('Student resource cache', () => {
  it('deduplicates in-flight reads and reuses the resolved resource', async () => {
    const loader = vi.fn(async () => ({ status: 'ready' }))

    const [first, second] = await Promise.all([
      getCachedStudentResource('test:resource', loader),
      getCachedStudentResource('test:resource', loader),
    ])
    const third = await getCachedStudentResource('test:resource', loader)

    expect(first).toEqual({ status: 'ready' })
    expect(second).toBe(first)
    expect(third).toBe(first)
    expect(loader).toHaveBeenCalledOnce()
  })

  it('replaces and invalidates resources after mutations', async () => {
    const loader = vi.fn(async () => 'network')
    setCachedStudentResource('test:mutation', 'updated')

    expect(await getCachedStudentResource('test:mutation', loader)).toBe('updated')
    invalidateStudentResources('test:mutation')
    expect(await getCachedStudentResource('test:mutation', loader)).toBe('network')
    expect(loader).toHaveBeenCalledOnce()
  })
})
