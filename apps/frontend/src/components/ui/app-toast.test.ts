import { beforeEach, expect, it, vi } from 'vitest'

import { appToast } from './app-toast'
import { toast } from 'sonner'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

it('uses one shared success-toast contract', () => {
  appToast.success('Profile updated', 'Your details were saved.')

  expect(toast.success).toHaveBeenCalledWith('Profile updated', {
    description: 'Your details were saved.',
    duration: 4_000,
  })
})

it('uses one shared error-toast contract', () => {
  appToast.error('Update failed')

  expect(toast.error).toHaveBeenCalledWith('Update failed', {
    description: undefined,
    duration: 4_000,
  })
})
