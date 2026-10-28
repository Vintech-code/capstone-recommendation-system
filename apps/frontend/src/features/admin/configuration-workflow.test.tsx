import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfigurationWorkflow } from '@/features/admin/components/configuration-workflow'

function response(data: unknown) {
  return Promise.resolve({ ok: true, json: async () => ({ data }) } as Response)
}

describe('Administrator catalogue configuration workflow', () => {
  it('renders protected facts, allows editing guidance, and excludes ESCO and crop sliders', async () => {
    const programme = {
      id: 'bs-information-technology',
      short_label: 'BSIT',
      display_name: 'BS Information Technology',
      majors: [],
      riasec_profile: ['I', 'R', 'C'],
      description: 'Applies computing technologies to organisational needs.',
      learning_areas: ['Software development'],
      learning_area_descriptions: {},
      learning_area_topics: {},
      career_directions: ['Software and application development', 'Systems administration'],
      recommended_strands: ['STEM'],
      strand_guidance: 'STEM may support preparation.',
      content_status: 'ched_psg_sourced',
      content_source: { source_name: 'CHED CMO No. 25, series of 2015', source_url: 'https://ched.gov.ph/', reference: 'Article IV, Sections 5 and 6' },
      degree_type: "Bachelor's degree",
      duration: { display: '4 years' },
    }
    const workspace = {
      kind: 'catalogue',
      runtime: { programmes: [programme] },
      versions: [{ id: 7, kind: 'catalogue', version: 2, status: 'draft', academicYear: '2026-2027', payload: { programmes: [programme] }, createdBy: 'Admin User', publishedBy: null, createdAt: '2026-09-06T12:00:00+08:00', publishedAt: null }],
    }
    vi.mocked(fetch).mockImplementation((input) => {
      const url = String(input)
      if (url.includes('/configurations/catalogue')) return response(workspace)
      return response({})
    })

    const user = userEvent.setup()
    render(<ConfigurationWorkflow programmeId="bs-information-technology" />)

    expect(await screen.findByRole('heading', { name: 'BS Information Technology' })).toBeVisible()
    expect(screen.getByText('Protected source-controlled facts')).toBeVisible()
    expect(screen.getByRole('link', { name: /CHED CMO No. 25/ })).toBeVisible()
    expect(screen.queryByRole('textbox', { name: 'Programme name' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'RIASEC codes, one per line' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Recommended SHS strands, one per line' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Preparation guidance' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Publish full catalogue' })).toBeDisabled()

    // Assert that ESCO mapping UI is removed
    expect(screen.queryByRole('heading', { name: /ESCO occupation mappings/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Occupation name/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Search ESCO/i })).not.toBeInTheDocument()

    // Assert that crop & position sliders are removed
    expect(screen.queryByRole('heading', { name: /Crop and position preview/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Horizontal position/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Vertical position/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Zoom/i)).not.toBeInTheDocument()

    // Media upload fields are present
    expect(screen.getByLabelText('Programme cover photo')).toBeVisible()
    expect(screen.getByLabelText('Programme logo')).toBeVisible()

    // Guidance fields can be edited
    const guidanceInput = screen.getByRole('textbox', { name: 'Preparation guidance' })
    await user.clear(guidanceInput)
    await user.type(guidanceInput, 'Updated STEM preparation guidance.')
    expect(guidanceInput).toHaveValue('Updated STEM preparation guidance.')
  })
})
