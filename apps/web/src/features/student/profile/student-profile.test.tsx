import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AppProviders } from '@/app/providers'
import { StudentProfilePage } from '@/features/student/profile/components/student-profile-page'

const identity = { id: 1, name: 'Zyx Santos', email: 'zyx@example.test', photoUrl: null }
const options = {
  strengths: ['Problem-solving', 'Creativity'],
  growthAreas: ['Time management', 'Public speaking'],
  learningPreferences: ['Hands-on activities', 'Independent work'],
}

function profileResponse(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      student: identity,
      questionnaire: { complete: true, strengths: ['Problem-solving'], growthAreas: ['Time management'], learningPreferences: ['Hands-on activities'], updatedAt: '2026-08-09T10:00:00+08:00' },
      options,
      riasec: { sessionReference: 'ASMT-000001', availableAt: '2026-08-09T09:00:00+08:00', primary: { code: 'I', label: 'Investigative' }, secondary: { code: 'C', label: 'Conventional' }, code: 'I-C', dimensions: [] },
      careerInterests: ['Software and application development'],
      about: 'The latest recorded RIASEC result is I-C (Investigative and Conventional).',
      ...overrides,
    },
  }
}

function renderProfile() {
  return render(<AppProviders initialAuthUser={{ ...identity, roles: ['student'] }}><StudentProfilePage onBack={vi.fn()} /></AppProviders>)
}

describe('StudentProfilePage', () => {
  it('renders only recorded assessment and self-report profile information', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(profileResponse()))
    renderProfile()

    expect(await screen.findByRole('heading', { name: 'How I learn and grow' })).toBeVisible()
    expect(screen.getByText('Investigative × Conventional')).toBeVisible()
    expect(screen.getByRole('img', { name: 'Recorded RIASEC interest compass I-C' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Career directions to explore' })).toBeVisible()
    expect(screen.getByRole('button', { name: /update your learning snapshot/i })).toBeVisible()
    expect(screen.getByText('Problem-solving')).toBeVisible()
    expect(screen.getByText('Time management')).toBeVisible()
    expect(screen.getByText('Software and application development')).toBeVisible()
    expect(screen.getByText(/not a diagnosis or a validated measure/i)).toBeVisible()
  })

  it('renders the Google avatar returned by the Student profile API', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(profileResponse({
      student: {
        ...identity,
        photoUrl: 'https://example.test/google-avatar.png',
      },
    })))
    renderProfile()

    expect(await screen.findByRole('img', { name: 'Zyx Santos profile' })).toHaveAttribute(
      'src',
      'https://example.test/google-avatar.png',
    )
  })

  it('shows truthful empty states when profile and RIASEC records are incomplete', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(profileResponse({
      questionnaire: { complete: false, strengths: [], growthAreas: [], learningPreferences: [], updatedAt: null },
      riasec: null,
      careerInterests: [],
      about: 'Complete the interest assessment and profile questionnaire to build a factual student profile.',
    })))
    renderProfile()

    expect(await screen.findByText('No strengths selected yet.')).toBeVisible()
    expect(screen.getByText('No growth areas selected yet.')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Assessment not completed' })).toBeVisible()
  })

  it('maps every RIASEC area around the compass and points to the primary area', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(profileResponse({
      riasec: { sessionReference: 'ASMT-000001', availableAt: '2026-08-09T09:00:00+08:00', primary: { code: 'S', label: 'Social' }, secondary: { code: 'C', label: 'Conventional' }, code: 'S-C', dimensions: [] },
    })))
    renderProfile()

    const compass = await screen.findByRole('img', { name: 'Recorded RIASEC interest compass S-C' })
    expect(compass.querySelectorAll('[data-code]')).toHaveLength(6)
    expect(compass.querySelector('[data-primary="true"]')).toHaveTextContent('S')
    expect(compass.querySelector('[style*="rotate(120deg)"]')).not.toBeNull()
  })

  it('edits and saves approved self-report selections', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (input.toString() === '/api/v1/student/profile' && init?.method === 'PUT') {
        const body = JSON.parse(String(init.body)) as { strengths: string[] }
        return Response.json(profileResponse({
          questionnaire: { complete: true, strengths: body.strengths, growthAreas: ['Time management'], learningPreferences: ['Hands-on activities'], updatedAt: '2026-08-09T11:00:00+08:00' },
        }))
      }
      return Response.json(profileResponse())
    })
    renderProfile()

    await user.click(await screen.findByRole('button', { name: 'Edit profile' }))
    expect(screen.getByRole('heading', { name: 'Which strengths describe you?' })).toBeVisible()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByLabelText('Creativity'))
    await user.click(screen.getByRole('button', { name: 'Next reflection' }))
    expect(screen.getByRole('heading', { name: 'What would you like to develop?' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Next reflection' }))
    expect(screen.getByRole('heading', { name: 'How do you prefer to learn?' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Save my profile' }))

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/v1/student/profile', expect.objectContaining({ method: 'PUT' })))
    expect(await screen.findByText(/Problem-solving, Creativity/)).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Which strengths describe you?' })).not.toBeInTheDocument()
  })

  it('uploads a real profile image through the protected photo endpoint', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (input.toString() === '/api/v1/student/profile/photo') {
        expect(init?.method).toBe('POST')
        expect(init?.body).toBeInstanceOf(FormData)
        return Response.json(profileResponse({ student: { ...identity, photoUrl: '/api/v1/profile-photos/1' } }), { status: 201 })
      }
      return Response.json(profileResponse())
    })
    renderProfile()
    await screen.findByRole('heading', { name: 'Zyx Santos' })
    await user.upload(screen.getByLabelText('Choose profile photo'), new File(['image'], 'profile.jpg', { type: 'image/jpeg' }))
    expect(await screen.findByRole('img', { name: 'Zyx Santos profile' })).toHaveAttribute('src', '/api/v1/profile-photos/1')
  })
})
