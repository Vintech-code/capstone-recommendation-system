import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { StudentProgrammeCataloguePage } from '@/features/student/programmes/components/student-programme-catalogue-page'

const catalogue = {
  academicYear: '2026-2027',
  catalogueVersion: 1,
  programmes: [{
    id: 'bs-information-technology',
    name: 'BS Information Technology',
    code: 'BSIT',
    majors: [],
    riasecProfile: ['I', 'C', 'R'],
    description: 'Focuses on applying computing to organisational needs.',
    learningAreas: ['Software development', 'Information management'],
    learningAreaDescriptions: {
      'Software development': 'Design, build, test, and maintain software applications.',
      'Information management': 'Organise, store, retrieve, and protect information.',
    },
    learningAreaTopics: {
      'Software development': ['Programming fundamentals', 'Application testing'],
      'Information management': ['Database design', 'Information security'],
    },
    careerDirections: ['Software and application development', 'Network and systems administration'],
    recommendedStrands: ['STEM', 'TVL-ICT'],
    strandGuidance: 'STEM supports analytical preparation while TVL-ICT provides practical computer experience.',
    requirements: ['Meet the published general admission requirements.'],
    readinessPrompt: 'Discuss your interest in problem solving and technology.',
    contentVersion: 'GUIDANCE-1',
    degreeType: "Bachelor's degree",
    duration: { status: 'ched_psg' as const, display: '4 years', source_name: 'CHED CMO', source_url: 'https://ched.gov.ph/issuances/' },
  }],
}

describe('Student programme catalogue', () => {
  it('loads additional programmes without losing the current catalogue position', async () => {
    const user = userEvent.setup()
    const expandedCatalogue = {
      ...catalogue,
      programmes: Array.from({ length: 7 }, (_, index) => ({
        ...catalogue.programmes[0],
        id: index === 0 ? 'bs-information-technology' : `catalogue-programme-${index + 1}`,
        name: `Catalogue Programme ${index + 1}`,
        code: `CP${index + 1}`,
      })),
    }

    render(<StudentProgrammeCataloguePage initialCatalogue={expandedCatalogue} />)

    expect(screen.getAllByRole('button', { name: /view programme details/i })).toHaveLength(6)
    expect(screen.getByText('Showing 6 of 7 matching programmes')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Load more programmes' }))

    expect(screen.getAllByRole('button', { name: /view programme details/i })).toHaveLength(7)
    expect(screen.queryByRole('button', { name: 'Load more programmes' })).not.toBeInTheDocument()
  })

  it('uses published framing only for a published custom programme image', () => {
    const framedCatalogue = {
      ...catalogue,
      programmes: [{
        ...catalogue.programmes[0],
        coverImageUrl: '/storage/programme-media/bs-information-technology/cover/published.webp',
        coverImagePosition: { x: 65, y: 40, zoom: 1.3 },
      }],
    }

    render(<StudentProgrammeCataloguePage initialCatalogue={framedCatalogue} />)

    expect(screen.getByRole('img', { name: 'BS Information Technology programme' })).toHaveStyle({
      objectPosition: '65% 40%',
      transform: 'scale(1.3)',
    })
  })

  it('filters the catalogue by field and search text and can clear the filters', async () => {
    const user = userEvent.setup()
    render(<StudentProgrammeCataloguePage initialCatalogue={catalogue} />)

    await user.click(screen.getByRole('checkbox', { name: /business & hospitality/i }))
    expect(screen.getByRole('heading', { name: 'No programmes match these filters' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.getByText('BS Information Technology')).toBeVisible()

    expect(screen.queryByRole('radio', { name: 'Confirm with TCC' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '4 years' }))
    expect(screen.getByText('BS Information Technology')).toBeVisible()

    await user.type(screen.getByRole('searchbox', { name: 'Search programmes' }), 'not a real programme')
    expect(screen.getByRole('heading', { name: 'No programmes match these filters' })).toBeVisible()
  })

  it('filters using API-provided SHS strands without exposing a RIASEC-area filter', async () => {
    const user = userEvent.setup()
    const mixedCatalogue = {
      ...catalogue,
      programmes: [
        catalogue.programmes[0],
        { ...catalogue.programmes[0], id: 'business-option', name: 'Business Option', code: 'BUS', recommendedStrands: ['ABM'], riasecProfile: ['E', 'S'] },
      ],
    }
    render(<StudentProgrammeCataloguePage initialCatalogue={mixedCatalogue} />)

    await user.click(screen.getByRole('checkbox', { name: 'ABM' }))
    expect(screen.getByText('Business Option')).toBeVisible()
    expect(screen.queryByText('BS Information Technology')).not.toBeInTheDocument()

    expect(screen.queryByRole('group', { name: 'RIASEC area' })).not.toBeInTheDocument()
  })

  it('persists filters while opening and returning from programme details', async () => {
    const user = userEvent.setup()
    render(<StudentProgrammeCataloguePage initialCatalogue={catalogue} />)

    const technologyFilter = screen.getByRole('checkbox', { name: 'Technology' })
    await user.click(technologyFilter)
    await user.click(screen.getByRole('button', { name: /view programme details/i }))
    await user.click(screen.getByRole('button', { name: 'Back to programmes' }))

    expect(screen.getByRole('checkbox', { name: 'Technology' })).toBeChecked()
  })

  it('compares programmes and persists student-owned saves through the API', async () => {
    const user = userEvent.setup()
    const compareCatalogue = {
      ...catalogue,
      programmes: [
        catalogue.programmes[0],
        { ...catalogue.programmes[0], id: 'second-programme', name: 'Second Programme', code: 'SECOND', recommendedStrands: ['ABM'], riasecProfile: ['E', 'S'] },
      ],
    }
    render(<StudentProgrammeCataloguePage initialCatalogue={compareCatalogue} />)

    await user.click(screen.getByRole('button', { name: 'Save BS Information Technology' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove BS Information Technology from saved programmes' })).toBeVisible())
    expect(fetch).toHaveBeenCalledWith('/api/v1/student/saved-programmes/bs-information-technology', expect.objectContaining({ method: 'PUT' }))

    const savedOnly = screen.getByRole('checkbox', { name: 'Show saved only' })
    await user.click(savedOnly)
    expect(screen.queryByRole('heading', { name: 'Second Programme' })).not.toBeInTheDocument()
    await user.click(savedOnly)

    const compareButtons = screen.getAllByRole('button', { name: 'Add to comparison' })
    await user.click(compareButtons[0])
    await user.click(compareButtons[1])
    await user.click(screen.getByRole('button', { name: 'Compare now' }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Compare programmes' })).toBeVisible()
    expect(screen.getAllByText('RIASEC alignment')).toHaveLength(2)
  })

  it('shows CHED citations and match context supplied by the recommendation flow', () => {
    render(<StudentProgrammeCataloguePage
      initialCatalogue={catalogue}
      matchContext={[{ programmeId: 'bs-information-technology', match: 90, factors: ['Profile includes I'] }]}
    />)

    expect(screen.getByRole('link', { name: 'CHED source' })).toHaveAttribute('href', 'https://ched.gov.ph/issuances/')
    expect(screen.getByText('90% match')).toBeVisible()
    expect(screen.getByText(/Why this matches me: Profile includes I/)).toBeVisible()
  })

  it('renders live catalogue fields and opens programme details', async () => {
    const user = userEvent.setup()
    render(<StudentProgrammeCataloguePage initialCatalogue={catalogue} />)

    expect(screen.getByRole('heading', { name: 'Explore TCC programmes' })).toBeVisible()
    expect(screen.getByText(/Academic Year 2026-2027/)).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Filters' })).toBeVisible()
    expect(screen.getByRole('searchbox', { name: 'Search programmes' })).toBeVisible()

    expect(screen.getByRole('img', { name: 'BS Information Technology programme' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'BS Information Technology programme' }).getAttribute('src')).toMatch(/\.webp$/)

    await user.click(screen.getByRole('button', { name: /view programme details/i }))

    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'BS Information Technology' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'BS Information Technology logo' })).toBeVisible()
    expect(screen.getByText('Software development')).toBeVisible()
    expect(screen.getByText('Design, build, test, and maintain software applications.')).toBeVisible()
    expect(screen.getByText('Programming fundamentals')).toBeVisible()
    expect(screen.getByText('Application testing')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Programme information' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Helpful tracks and strands' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Possible career directions' })).toBeVisible()
    expect(screen.getByText('Software and application development')).toBeVisible()
    expect(screen.queryByText(/not admission requirements/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Is this programme for you?' })).not.toBeInTheDocument()
    expect(screen.getAllByText('BSIT').length).toBeGreaterThan(0)
    expect(screen.queryByText('Part of the programme guidance content connected to the current catalogue.')).not.toBeInTheDocument()
    expect(screen.queryByText('Meet the published general admission requirements.')).not.toBeInTheDocument()
  })

  it('has no automatically detectable accessibility violations in the filter and card layout', async () => {
    render(<StudentProgrammeCataloguePage initialCatalogue={catalogue} />)
    const accessibility = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })
    expect(accessibility.violations).toEqual([])
  })
})
