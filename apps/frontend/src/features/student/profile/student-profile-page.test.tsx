import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

import { appToast } from '@/components/ui/app-toast'

import { StudentProfilePage } from './components/student-profile-page'

vi.mock('@/components/ui/app-toast', () => ({
  appToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

it('edits the Student-owned profile without GWA fields', async () => {
  const user = userEvent.setup()
  const onIdentityUpdated = vi.fn()
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
  render(<QueryClientProvider client={new QueryClient()}><StudentProfilePage onBack={vi.fn()} onIdentityUpdated={onIdentityUpdated} /></QueryClientProvider>)

  expect(await screen.findByRole('heading', { name: 'Authenticated User' })).toBeVisible()
  expect(screen.getByRole('textbox', { name: 'First Name *' })).toHaveValue('Authenticated')
  expect(screen.getByRole('textbox', { name: 'Last Name *' })).toHaveValue('User')
  expect(screen.getByLabelText('ID number *')).toHaveValue('12345678')
  expect(screen.queryByLabelText(/GWA/i)).not.toBeInTheDocument()

  const identityColumn = document.querySelector('[data-profile-column="identity"]')
  const detailsColumn = document.querySelector('[data-profile-column="details"]')
  expect(identityColumn).toContainElement(screen.getByDisplayValue('user@example.com'))
  expect(identityColumn).toContainElement(screen.getByLabelText(/Mobile number/))
  expect(detailsColumn).toContainElement(screen.getByLabelText(/Date of birth/))
  expect(detailsColumn).toContainElement(screen.getByLabelText(/House, street, or zone/))
  expect(detailsColumn).toContainElement(screen.getByLabelText(/Region/))

  expect(screen.queryByRole('heading', { name: 'Academic background' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/Senior high school/)).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/GWA/i)).not.toBeInTheDocument()

  expect(screen.queryByText('Learning Profile & Strengths')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Learning profile & preferences' })).not.toBeInTheDocument()
  await user.clear(screen.getByRole('textbox', { name: 'First Name *' }))
  await user.type(screen.getByRole('textbox', { name: 'First Name *' }), 'Clark')
  await user.clear(screen.getByRole('textbox', { name: 'Last Name *' }))
  await user.type(screen.getByRole('textbox', { name: 'Last Name *' }), 'Cabatuan')
  await user.click(screen.getByRole('button', { name: 'Save profile' }))

  await waitFor(() =>
    expect(appToast.success).toHaveBeenCalledWith(
      'Profile updated',
      'Your name and profile details have been saved.',
    ),
  )
  expect(screen.queryByText('Your profile has been saved.')).not.toBeInTheDocument()
  expect(onIdentityUpdated).toHaveBeenCalledOnce()
  const putCall = vi.mocked(fetch).mock.calls.find(([, init]) => init?.method === 'PUT')
  expect(putCall).toBeDefined()
  expect(String(putCall?.[1]?.body)).not.toContain('gwa')
  expect(String(putCall?.[1]?.body)).not.toContain('strengths')
  expect(String(putCall?.[1]?.body)).toContain('"firstName":"Clark"')
  expect(String(putCall?.[1]?.body)).toContain('"lastName":"Cabatuan"')
  expect(String(putCall?.[1]?.body)).toContain('"idNumber":"12345678"')
})
