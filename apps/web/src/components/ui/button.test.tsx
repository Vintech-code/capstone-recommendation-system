import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('uses minimalist clay elevation no stronger than shadow-sm', () => {
    render(<Button>Continue</Button>)

    const button = screen.getByRole('button', { name: 'Continue' })

    expect(button).toHaveClass(
      'shadow-[var(--shadow-clay-sm)]',
      'hover:shadow-[var(--shadow-clay-sm)]',
      'active:shadow-[inset_0_1px_2px_var(--shadow-button-clay-pressed)]',
      'motion-reduce:transition-none',
    )
  })

  it('keeps link buttons visually flat', () => {
    render(<Button variant="link">Learn more</Button>)

    expect(screen.getByRole('button', { name: 'Learn more' })).toHaveClass(
      'shadow-none',
      'hover:shadow-none',
      'active:shadow-none',
    )
  })

  it('keeps clay elevation on outlined buttons', () => {
    render(<Button variant="outline">Cancel</Button>)

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass(
      'shadow-[var(--shadow-clay-sm)]',
    )
  })
})
