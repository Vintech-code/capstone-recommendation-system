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
    expect(mobileNavigation.querySelector('ul')).toHaveClass('grid-cols-2')
    expect(mobileNavigation.parentElement).toHaveClass('flex', 'h-16')
    expect(screen.queryByRole('button', { name: 'Dashboard' })).not.toBeInTheDocument()
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
        activeId="recommendations"
        onSelect={vi.fn()}
        onExit={vi.fn()}
        studentName="Maria Santos"
        studentPhotoUrl="https://example.test/avatar.png"
      >
        <p>Student content</p>
      </StudentWorkspaceShell>,
    )

    const avatar = screen.getByRole('img', { name: 'Maria Santos profile' })
    expect(avatar).toBeVisible()
    expect(avatar).toHaveAttribute('src', 'https://example.test/avatar.png')
  })

  it('falls back to student initials when no photo is available', () => {
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="recommendations"
        onSelect={vi.fn()}
        onExit={vi.fn()}
        studentName="Juan Dela Cruz"
      >
        <p>Student content</p>
      </StudentWorkspaceShell>,
    )

    expect(screen.getByText('JD')).toBeVisible()
  })

  it('allows mobile students to toggle user profile and settings controls', () => {
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="recommendations"
        onSelect={vi.fn()}
        onExit={vi.fn()}
        studentName="Ana Santos"
      >
        <p>Student content</p>
      </StudentWorkspaceShell>,
    )

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Open user menu' }))
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()
  })

  it('keeps mobile navigation functional', () => {
    const onSelect = vi.fn()
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="recommendations"
        onSelect={onSelect}
        onExit={vi.fn()}
      >
        <p>Student content</p>
      </StudentWorkspaceShell>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Explore Programs' })[1])
    expect(onSelect).toHaveBeenCalledWith('programmes')
  })

  it('does not select a navigation tab when viewing off-navigation views like history', () => {
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

  it('hides top navigation items during the assessment onboarding phase', () => {
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="assessment"
        onSelect={vi.fn()}
        onExit={vi.fn()}
      >
        <p>Assessment page</p>
      </StudentWorkspaceShell>,
    )

    expect(screen.queryByRole('navigation', { name: 'Workspace navigation' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Mobile workspace navigation' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to dashboard' })).toBeInTheDocument()
  })

  it('provides a visible matches destination on desktop and mobile through the logo', () => {
    const onSelect = vi.fn()
    render(
      <StudentWorkspaceShell
        modules={modules}
        activeId="programmes"
        onSelect={onSelect}
        onExit={vi.fn()}
      >
        <p>Programmes page</p>
      </StudentWorkspaceShell>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Go to dashboard' }))
    expect(onSelect).toHaveBeenCalledWith('recommendations')
    expect(screen.getByRole('button', { name: 'Go to dashboard' })).toBeInTheDocument()
  })
})
