import { fireEvent, render, screen } from '@testing-library/react'
import { BookOpen, ClipboardList, History, Target, UserRound } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

import { dashboards, type DashboardModule } from '@/features/auth/workspace-definitions'

import { StudentWorkspaceShell } from './student-workspace-shell'

const modules: DashboardModule[] = [
  { id: 'assessment', title: 'Interest assessment', description: '', icon: ClipboardList },
  { id: 'programmes', title: 'Explore Programs', description: '', icon: BookOpen },
  { id: 'recommendations', title: 'My Matches', description: '', icon: Target },
  { id: 'history', title: 'Assessment history', description: '', icon: History },
  { id: 'profile', title: 'My Profile', description: '', icon: UserRound },
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
    const logos = container.querySelectorAll('button[aria-label="Go to dashboard"] img')
    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile workspace navigation' })

    expect(header).toHaveClass('relative', 'md:sticky', 'md:top-0')
    expect(header).not.toHaveClass('sticky', 'top-0')
    expect(logos).toHaveLength(2)
    expect(logos[0].getAttribute('src')).toContain('logo-optimized.png')
    expect(logos[0]).toHaveClass('md:hidden', 'object-contain')
    expect(logos[1].getAttribute('src')).toContain('logo.png')
    expect(logos[1]).toHaveClass('hidden', 'md:block', 'object-contain')
    expect(logos[0]).not.toHaveClass('bg-background', 'shadow-sm')
    expect(mobileNavigation.querySelector('ul')).toHaveClass('grid')
    expect(mobileNavigation.querySelector('ul')).toHaveClass('grid-cols-5')
    expect(screen.getAllByRole('button', { name: 'Dashboard' })[0].textContent).toBe('')
    expect(screen.getAllByRole('button', { name: 'Interest assessment' })[0].querySelector('svg')).not.toBeNull()
    expect(mobileNavigation.parentElement).toHaveClass('flex', 'h-16')
    expect(screen.getAllByRole('button', { name: 'Dashboard' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'My Matches' })[1]).toHaveAttribute('aria-current', 'page')
  })

  it('uses different catalogue and match icons', () => {
    const programmesIcon = dashboards.student.modules.find((module) => module.id === 'programmes')?.icon
    const matchesIcon = dashboards.student.modules.find((module) => module.id === 'recommendations')?.icon

    expect(programmesIcon).toBeDefined()
    expect(matchesIcon).toBeDefined()
    expect(programmesIcon).not.toBe(matchesIcon)
  })

  it('shows the authenticated student profile photo beside notifications', () => {
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="overview"
        onSelect={vi.fn()}
        onExit={vi.fn()}
        studentName="Zyx Santos"
        studentPhotoUrl="/api/v1/profile-photos/1?v=123"
      >
        <p>Student content</p>
      </StudentWorkspaceShell>,
    )

    expect(screen.getByRole('img', { name: 'Zyx Santos profile' })).toHaveAttribute('src', '/api/v1/profile-photos/1?v=123')
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

  it('keeps assessment history separate from the primary navigation', () => {
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="history"
        onSelect={vi.fn()}
        onExit={vi.fn()}
      >
        <p>Assessment history page</p>
      </StudentWorkspaceShell>,
    )

    expect(screen.queryByRole('button', { name: 'Assessment history' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { current: 'page' })).not.toBeInTheDocument()
  })

  it('provides a visible dashboard destination on desktop and mobile', () => {
    const onSelect = vi.fn()
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="assessment"
        onSelect={onSelect}
        onExit={vi.fn()}
      >
        <p>Assessment page</p>
      </StudentWorkspaceShell>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Dashboard' })[0])
    expect(onSelect).toHaveBeenCalledWith('overview')
    expect(screen.getByRole('button', { name: 'Go to dashboard' })).toBeInTheDocument()
  })
})
