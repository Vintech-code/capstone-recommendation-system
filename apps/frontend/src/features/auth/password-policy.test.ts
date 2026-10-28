import { describe, expect, it } from 'vitest'

import { passwordMeetsPolicy } from '@/features/auth/password-policy'

describe('password policy', () => {
  it.each([
    ['is too short', 'Short!2a'],
    ['has no uppercase letter', 'lowercase!2026'],
    ['has no lowercase letter', 'UPPERCASE!2026'],
    ['has no number', 'NoNumber!Password'],
    ['has no symbol', 'NoSymbolPassword2026'],
  ])('rejects a password that %s', (_reason, password) => {
    expect(passwordMeetsPolicy(password)).toBe(false)
  })

  it('accepts a password that satisfies every requirement', () => {
    expect(passwordMeetsPolicy('StrongPass!2026')).toBe(true)
  })
})
