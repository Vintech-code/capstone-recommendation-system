import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  }],
}

describe('Student programme catalogue', () => {
  it('renders live catalogue fields and opens programme details', async () => {
    const user = userEvent.setup()
    render(<StudentProgrammeCataloguePage initialCatalogue={catalogue} />)

    expect(screen.getByRole('heading', { name: 'Discover your pathway to purpose' })).toBeVisible()
    expect(screen.getByText(/Academic Year 2026-2027/)).toBeVisible()

    expect(screen.getByText('STEM')).toBeVisible()
    expect(screen.getByText('TVL-ICT')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /explore programme/i }))

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Explore Programs')
    expect(screen.getByRole('heading', { name: 'BS Information Technology' })).toBeVisible()
    expect(screen.getByText('Software development')).toBeVisible()
    expect(screen.getByText('Design, build, test, and maintain software applications.')).toBeVisible()
    expect(screen.getByText('Programming fundamentals')).toBeVisible()
    expect(screen.getByText('Application testing')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Programme information' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Helpful tracks and strands' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Possible career directions' })).toBeVisible()
    expect(screen.getByText('Software and application development')).toBeVisible()
    expect(screen.getByText(/not admission requirements/i)).toBeVisible()
    expect(screen.getAllByText('BSIT').length).toBeGreaterThan(0)
    expect(screen.queryByText('Part of the programme guidance content connected to the current catalogue.')).not.toBeInTheDocument()
    expect(screen.queryByText('Meet the published general admission requirements.')).not.toBeInTheDocument()
  })
})
