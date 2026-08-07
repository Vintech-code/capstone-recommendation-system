import { fireEvent, render, screen } from '@testing-library/react'
import { BookOpen, ClipboardList, Target } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

import type { DashboardModule } from '@/features/auth/workspace-definitions'

import { StudentWorkspaceShell } from './student-workspace-shell'

const modules: DashboardModule[] = [
  { id: 'assessment', title: 'Interest assessment', description: '', icon: ClipboardList },
  { id: 'programmes', title: 'Explore Programs', description: '', icon: BookOpen },
  { id: 'recommendations', title: 'My Matches', description: '', icon: Target },
]

describe('StudentWorkspaceShell', () => {
  it('uses one compact non-sticky mobile header row with a transparent logo treatment', () => {
    const { container } = render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="recommendations"
        onSelect={vi.fn()}
        onExit={vi.fn()}
      >
        <p>Student content</p>
      </StudentWorkspaceShell>,
    )

    const header = container.querySelector('header')
    const logo = container.querySelector('img')
    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile workspace navigation' })

    expect(header).toHaveClass('relative', 'md:sticky', 'md:top-0')
    expect(header).not.toHaveClass('sticky', 'top-0')
    expect(logo).toHaveClass('object-contain')
    expect(logo).not.toHaveClass('bg-background', 'shadow-sm')
    expect(mobileNavigation.querySelector('ul')).toHaveClass('grid')
    expect(mobileNavigation.parentElement).toHaveClass('flex', 'h-16')
    expect(screen.getAllByRole('button', { name: 'My Matches' })[1]).toHaveAttribute('aria-current', 'page')
  })

  it('keeps mobile navigation functional', () => {
    const onSelect = vi.fn()
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="assessment"
        onSelect={onSelect}
        onExit={vi.fn()}
      >
        <p>Student content</p>
      </StudentWorkspaceShell>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Explore Programs' })[1])
    expect(onSelect).toHaveBeenCalledWith('programmes')
  })
})
