import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfigurationWorkflow } from '@/features/admin/components/configuration-workflow'

function response(data: unknown) {
  return Promise.resolve({ ok: true, json: async () => ({ data }) } as Response)
}

describe('Administrator ESCO mapping workflow', () => {
  it('searches ESCO and adds a selected occupation to the catalogue draft', async () => {
    const programme = {
      id: 'bs-information-technology',
      short_label: 'BSIT',
      display_name: 'BS Information Technology',
      majors: [],
      riasec_profile: ['I', 'C', 'R'],
      description: 'Applies computing technologies to organisational needs.',
      learning_areas: ['Software development'],
      learning_area_descriptions: {},
      learning_area_topics: {},
      career_directions: ['Software and application development', 'Systems administration'],
      career_opportunities: [],
      recommended_strands: ['STEM'],
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
      if (url.includes('/esco/occupations?query=software')) return response([{ uri: 'http://data.europa.eu/esco/occupation/software-developer', title: 'software developer', escoCode: '2512.3', iscoCode: '2512' }])
      if (url.includes('/esco/occupation?uri=')) return response({ label: 'software developer', description: 'Builds software systems from specifications.', escoUri: 'http://data.europa.eu/esco/occupation/software-developer', escoCode: '2512.3', iscoCode: '2512', skills: ['analyse software specifications'], source: 'esco', sourceLanguage: 'en', sourceVersion: 'v1.2.0', retrievedAt: '2026-09-06T12:00:00+08:00', reviewStatus: 'proposed' })
      return response({})
    })

    const user = userEvent.setup()
    render(<ConfigurationWorkflow kind="catalogue" programmeId="bs-information-technology" />)

    await user.type(await screen.findByRole('textbox', { name: 'Occupation name' }), 'software')
    expect(screen.queryByRole('heading', { name: 'API-controlled information' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Search ESCO' }))
    expect(await screen.findByText('software developer')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Add mapping' }))

    expect(await screen.findByText('Builds software systems from specifications.')).toBeVisible()
    expect(screen.getByText('Selected mappings (1)')).toBeVisible()
    expect(fetch).toHaveBeenCalledWith('/api/v1/admin/esco/occupations?query=software', expect.any(Object))
  })
})
