import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { StudentProfilePage } from './components/student-profile-page'

it('edits the Student-owned profile without GWA fields', async () => {
  const user = userEvent.setup()
  const originalFetch = vi.mocked(fetch).getMockImplementation()!
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    if (String(input).startsWith('/api/v1/locations/')) {
      return Response.json({ data: String(input).endsWith('/provinces') ? { items: [{ id: 2, code: '0100100000', name: 'Test province' }], hasIndependentCities: false } : [{ id: 1, code: '0100000000', name: 'Test location' }] })
    }
    const response = await originalFetch(input, init)
    if (String(input) === '/api/v1/student/profile') {
      const payload = await response.json()
      payload.data.personalAcademic.location = { regionId: 1, provinceId: 2, cityMunicipalityId: 1, barangayId: 1 }
      return Response.json(payload)
    }
    return response
  })
  render(<QueryClientProvider client={new QueryClient()}><StudentProfilePage onBack={vi.fn()} /></QueryClientProvider>)

  expect(await screen.findByRole('heading', { name: 'Authenticated User' })).toBeVisible()
  expect(screen.getByLabelText('Learner reference numberOptional')).toHaveValue('128490000001')
  expect(screen.queryByLabelText(/GWA/i)).not.toBeInTheDocument()

  expect(screen.getByRole('heading', { name: 'Academic background' })).toBeVisible()
  expect(screen.getByLabelText(/Senior high school/)).toHaveValue('Tagoloan National High School')
  expect(screen.queryByLabelText(/GWA/i)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Next/ }))
  expect(screen.getByRole('heading', { name: 'Learning profile & preferences' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Save profile' }))

  await waitFor(() => expect(screen.getByText('Your profile has been saved.')).toBeVisible())
  const putCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PUT')
  expect(putCall).toBeDefined()
  expect(String(putCall?.[1]?.body)).not.toContain('gwa')
})
