import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StudentAssessmentSessionPage } from '@/features/student/assessment/components/student-assessment-session-page'
import { testAssessmentContent } from '@/test/fixtures/student-api-fixtures'

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
      initialContent={testAssessmentContent}
      {...props}
    />,
  )

  return { ...result, onExit, onReturnToIntroduction, onViewResult }
}

async function answerQuestion(
  user: ReturnType<typeof userEvent.setup>,
  questionNumber: number,
) {
  expect(
    screen.getByRole('group', { name: `Response for question ${questionNumber}` }),
  ).toBeVisible()
  await user.click(screen.getByRole('radio', { name: /Strongly like/i }))
}

describe('Student assessment session', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('uses the Navigator assessment hierarchy with truthful session data', () => {
    renderSession()

    expect(screen.getByRole('heading', { name: 'Assessment session' })).toBeVisible()
    expect(screen.getByText('Discover your path')).toBeVisible()
    expect(screen.getByLabelText('0% assessment completion')).toBeVisible()
    expect(screen.getByRole('list', { name: 'Assessment stages' })).toBeVisible()
    expect(screen.getByAltText('Student studying with a tablet in a library')).toBeVisible()
    expect(screen.getAllByRole('radio')).toHaveLength(5)
    expect(screen.queryByText('Aptitude')).not.toBeInTheDocument()
    expect(screen.queryByText(/module 1 of/i)).not.toBeInTheDocument()
  })

  it('answers questions and autosaves progress locally', async () => {
    const user = userEvent.setup()
    renderSession()

    await user.click(
      screen.getByRole('radio', { name: /Strongly like/i }),
    )

    expect(
      screen.getByRole('progressbar', { name: 'Assessment completion' }),
    ).toHaveAttribute('aria-valuenow', '17')
    expect(screen.getByRole('status')).toHaveTextContent('Saving...')

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved'))
    expect(window.localStorage.getItem('tcc-guidance:student-assessment-session'))
      .toContain('"item-01":5')
  })

  it('reviews incomplete responses and returns to a missing question', async () => {
    const user = userEvent.setup()
    renderSession()

    await answerQuestion(user, 1)
    for (let index = 0; index < 4; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Skip question' }))
    }
    const reviewButton = screen.getByRole('button', { name: 'Review responses' })
    expect(reviewButton.parentElement).toHaveClass('flex-row', 'justify-between')
    await user.click(reviewButton)

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
    expect(screen.getByRole('group', { name: 'Response for question 2' })).toBeVisible()
  })

  it('submits a complete assessment and locks the responses', async () => {
    const user = userEvent.setup()
    const session = renderSession()

    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber)
    }
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
    expect(screen.getByText('Responses recorded')).toBeVisible()
    expect(screen.queryByText('Version reference')).not.toBeInTheDocument()
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
      screen.getByRole('radio', { name: /^Like/i }),
    )
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved'))
    first.unmount()

    renderSession()
    expect(
      screen.getByRole('radio', { name: /^Like/i }),
    ).toBeChecked()
    expect(
      screen.getByRole('progressbar', { name: 'Assessment completion' }),
    ).toHaveAttribute('aria-valuenow', '17')
  })

  it('autosaves an online session to the authenticated API', async () => {
    const user = userEvent.setup()
    renderSession({ remotePersistence: true })

    expect(
      await screen.findByRole('group', { name: 'Response for question 1' }),
    ).toBeVisible()
    await user.click(screen.getByRole('radio', { name: /Strongly like/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/student/assessments/onet-mini-ip/sessions/1',
        expect.objectContaining({ method: 'PATCH' }),
      )
    })
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
  })

  it('opens the result immediately after an online submission succeeds', async () => {
    const user = userEvent.setup()
    const session = renderSession({ remotePersistence: true })

    expect(
      await screen.findByRole('group', { name: 'Response for question 1' }),
    ).toBeVisible()
    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber)
    }

    await user.click(screen.getByRole('button', { name: 'Submit assessment' }))
    const dialog = screen.getByRole('alertdialog', {
      name: 'Submit this assessment?',
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Submit assessment' }),
    )

    await waitFor(() => expect(session.onViewResult).toHaveBeenCalledOnce())
    const requests = vi.mocked(fetch).mock.calls
    const submitIndex = requests.findIndex(([input]) => input.toString().endsWith('/submit'))
    expect(submitIndex).toBeGreaterThanOrEqual(0)
    expect(
      requests.slice(submitIndex + 1).some(([input, init]) =>
        input.toString().includes('/sessions/1') && init?.method === 'PATCH'),
    ).toBe(false)
    expect(
      screen.queryByRole('heading', { name: 'Responses submitted successfully' }),
    ).not.toBeInTheDocument()
  })

  it('retries a previously failed result instead of resubmitting locked answers', async () => {
    const fallbackFetch = vi.mocked(fetch).getMockImplementation()
    expect(fallbackFetch).toBeDefined()
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = input.toString()
      if (url.endsWith('/submit') && init?.method === 'POST') {
        return Response.json({ data: { id: 1, status: 'result_failed', question_count: 6 } })
      }
      if (url.endsWith('/retry-result') && init?.method === 'POST') {
        return Response.json({ data: { id: 1, status: 'result_available', question_count: 6 } })
      }
      return fallbackFetch!(input, init)
    })

    const user = userEvent.setup()
    const session = renderSession({ remotePersistence: true })
    expect(await screen.findByRole('group', { name: 'Response for question 1' })).toBeVisible()
    for (let questionNumber = 1; questionNumber <= 6; questionNumber += 1) {
      await answerQuestion(user, questionNumber)
    }

    await user.click(screen.getByRole('button', { name: 'Submit assessment' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Submit assessment' }))

    await waitFor(() => expect(session.onViewResult).toHaveBeenCalledOnce())
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/student/assessments/onet-mini-ip/sessions/1/retry-result',
      expect.objectContaining({ method: 'POST' }),
    )
    vi.mocked(fetch).mockImplementation(fallbackFetch!)
  })

  it('keeps responses on the device while offline and supports retry', async () => {
    const user = userEvent.setup()
    renderSession({ initialConnectionState: 'offline' })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'You are working offline',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saved on device')
    await user.click(
      screen.getByRole('radio', { name: /Strongly dislike/i }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Retry connection' }),
    )

    expect(
      screen.queryByText('You are working offline'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
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

  it('does not render a question card when loaded content has no questions', async () => {
    const user = userEvent.setup()
    renderSession({
      initialLoadState: 'error',
      initialContent: {
        id: '',
        versionReference: '',
        questions: [],
        responseOptions: [],
      },
    })

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent('The assessment questions are unavailable')
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
