import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StudentAssessmentSessionPage } from '@/features/student/assessment/components/student-assessment-session-page'

function renderSession(
  props: Partial<ComponentProps<typeof StudentAssessmentSessionPage>> = {},
) {
  const onExit = vi.fn()
  const onReturnToIntroduction = vi.fn()
  const onViewResult = vi.fn()
  const result = render(
    <StudentAssessmentSessionPage
      onExit={onExit}
      onReturnToIntroduction={onReturnToIntroduction}
      onViewResult={onViewResult}
      {...props}
    />,
  )

  return { ...result, onExit, onReturnToIntroduction, onViewResult }
}

async function answerQuestion(
  user: ReturnType<typeof userEvent.setup>,
  questionNumber: number,
) {
  await user.click(
    screen.getByRole('button', {
      name: new RegExp(`Go to question ${questionNumber},`),
    }),
  )
  await user.click(screen.getByRole('radio', { name: /Very much like me/i }))
}

describe('Student assessment session', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('answers questions and autosaves progress locally', async () => {
    const user = userEvent.setup()
    renderSession()

    await user.click(
      screen.getByRole('radio', { name: /Very much like me/i }),
    )

    expect(
      screen.getByRole('progressbar', { name: 'Assessment completion' }),
    ).toHaveAttribute('aria-valuenow', '17')
    expect(screen.getByText('Saving...')).toBeVisible()

    await waitFor(() => expect(screen.getByText('Saved')).toBeVisible())
    expect(window.localStorage.getItem('tcc-guidance:student-assessment-session'))
      .toContain('"item-01":"very-like-me"')
  })

  it('reviews incomplete responses and returns to a missing question', async () => {
    const user = userEvent.setup()
    renderSession()

    await answerQuestion(user, 1)
    await user.click(
      screen.getByRole('button', { name: /Go to question 6,/ }),
    )
    await user.click(screen.getByRole('button', { name: 'Review responses' }))

    expect(
      screen.getByRole('heading', {
        name: '5 questions need a response',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Submit assessment' }),
    ).toBeDisabled()

    const unansweredItem = screen.getAllByText('No response')[0].closest('li')
    expect(unansweredItem).not.toBeNull()
    await user.click(
      within(unansweredItem as HTMLLIElement).getByRole('button', {
        name: 'Edit response',
      }),
    )
    expect(screen.getByText('Question 2 of 6')).toBeVisible()
  })

  it('submits a complete assessment and locks the responses', async () => {
    const user = userEvent.setup()
    const session = renderSession()

    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber)
    }

    await user.click(screen.getByRole('button', { name: 'Review responses' }))
    expect(
      screen.getByRole('heading', { name: 'All questions are answered' }),
    ).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Submit assessment' }),
    )

    const dialog = screen.getByRole('alertdialog', {
      name: 'Submit this assessment?',
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Submit assessment' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Responses submitted successfully',
      }),
    ).toBeVisible()
    expect(screen.getByText('Locked')).toBeVisible()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(window.localStorage.getItem('tcc-guidance:student-assessment-session'))
      .toBeNull()
    await user.click(
      screen.getByRole('button', { name: 'View assessment result' }),
    )
    expect(session.onViewResult).toHaveBeenCalledOnce()
  })

  it('restores saved responses after leaving the session', async () => {
    const user = userEvent.setup()
    const first = renderSession()

    await user.click(
      screen.getByRole('radio', { name: /Somewhat like me/i }),
    )
    await user.click(screen.getByRole('button', { name: 'Save and exit' }))
    expect(first.onExit).toHaveBeenCalledOnce()
    first.unmount()

    renderSession()
    expect(
      screen.getByRole('radio', { name: /Somewhat like me/i }),
    ).toBeChecked()
    expect(
      screen.getByRole('progressbar', { name: 'Assessment completion' }),
    ).toHaveAttribute('aria-valuenow', '17')
  })

  it('keeps responses on the device while offline and supports retry', async () => {
    const user = userEvent.setup()
    renderSession({ initialConnectionState: 'offline' })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You are working offline',
    )
    expect(screen.getByText('Saved on device')).toBeVisible()
    await user.click(
      screen.getByRole('radio', { name: /Not like me/i }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Retry connection' }),
    )

    expect(
      screen.queryByText('You are working offline'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeVisible()
  })

  it('defines loading, empty, retryable error, and stale-version states', async () => {
    const loading = renderSession({ initialLoadState: 'loading' })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your assessment session',
    )
    loading.unmount()

    const empty = renderSession({ initialLoadState: 'empty' })
    expect(
      screen.getByRole('heading', {
        name: 'No assessment session was found',
      }),
    ).toBeVisible()
    await userEvent.click(
      screen.getByRole('button', { name: 'Return to introduction' }),
    )
    expect(empty.onReturnToIntroduction).toHaveBeenCalledOnce()
    empty.unmount()

    const error = renderSession({ initialLoadState: 'error' })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'We could not load your session',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('heading', { name: 'Assessment session' }),
    ).toBeVisible()
    error.unmount()

    const stale = renderSession({ versionState: 'stale' })
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This session needs to be refreshed',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Return to introduction' }),
    )
    expect(stale.onReturnToIntroduction).toHaveBeenCalledOnce()
  })

  it('has no automatically detectable accessibility violations', async () => {
    renderSession()
    const results = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })

    expect(results.violations).toEqual([])
  })
})
