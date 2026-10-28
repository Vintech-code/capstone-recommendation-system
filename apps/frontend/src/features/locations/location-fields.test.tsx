import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeAll, expect, it, vi } from 'vitest'
import { LocationFields } from './components/location-fields'
import type { LocationSelection } from './location-api'

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn()
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false)
  HTMLElement.prototype.setPointerCapture = vi.fn()
  HTMLElement.prototype.releasePointerCapture = vi.fn()
})

function mount(value?: LocationSelection) {
  function Harness() {
    const [selection, setSelection] = useState<LocationSelection | undefined>(value)
    return <><LocationFields value={selection} onChange={setSelection} /><output data-testid="selection">{JSON.stringify(selection)}</output></>
  }
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  render(<QueryClientProvider client={client}><Harness /></QueryClientProvider>)
  return client
}

function source() {
  vi.mocked(fetch).mockImplementation(async (input) => {
    const path = String(input)
    const data = path.endsWith('/regions') ? [{ id: 1, code: '0100000000', name: 'Test region' }, { id: 9, code: '0900000000', name: 'Another region' }]
      : path.endsWith('/provinces') ? { items: [{ id: 2, code: '0100100000', name: 'Test province' }], hasIndependentCities: true }
      : path.endsWith('/barangays') ? [{ id: 4, code: '0100101001', name: 'Test barangay' }]
      : [{ id: 3, code: '0100101000', name: 'Test city' }]
    return Response.json({ data })
  })
}

async function choose(label: string, name: string) {
  const user = userEvent.setup()
  await waitFor(() => expect(screen.getByRole('combobox', { name: `${label}*` })).toBeEnabled())
  await user.click(screen.getByRole('combobox', { name: `${label}*` }))
  await user.click(await screen.findByRole('option', { name }))
}

it('cascades local API choices and clears all descendants when the region changes', async () => {
  source()
  mount()
  expect(screen.getByRole('combobox', { name: 'Province*' })).toBeDisabled()
  await choose('Region', 'Test region')
  await choose('Province', 'Test province')
  await choose('City or municipality', 'Test city')
  await choose('Barangay', 'Test barangay')
  expect(screen.getByTestId('selection')).toHaveTextContent('"barangayId":4')
  await choose('Region', 'Another region')
  expect(screen.getByTestId('selection')).toHaveTextContent('"provinceId":null,"cityMunicipalityId":null,"barangayId":null')
  expect(vi.mocked(fetch).mock.calls.every(([path]) => String(path).startsWith('/api/v1/locations/'))).toBe(true)
})

it('supports cities with no province and restores saved selections', async () => {
  source()
  mount({ regionId: 1, provinceId: null, cityMunicipalityId: 3, barangayId: 4 })
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Barangay*' })).toHaveTextContent('Test barangay'))
  expect(screen.getByRole('combobox', { name: 'Province*' })).toHaveTextContent('No province')
  expect(vi.mocked(fetch).mock.calls.some(([path]) => String(path).endsWith('/regions/1/independent-cities'))).toBe(true)
})

it('offers retry after an API error and announces an empty catalogue', async () => {
  vi.mocked(fetch).mockResolvedValue(Response.json({}, { status: 503 }))
  mount()
  expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded')
  vi.mocked(fetch).mockImplementation(async () => Response.json({ data: [] }))
  await userEvent.setup().click(screen.getByRole('button', { name: 'Retry locations' }))
  expect(await screen.findByText('No choices available.')).toBeVisible()
})
