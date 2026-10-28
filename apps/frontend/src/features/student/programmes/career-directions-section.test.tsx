import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { CareerDirectionsSection } from '@/features/student/programmes/components/career-directions-section'

describe('Career directions section', () => {
  it('shows multiple local directions and identifies ESCO as an external reference', async () => {
    render(<CareerDirectionsSection
      directions={['Software development', 'Systems administration', 'Business analysis']}
      opportunities={[{
        label: 'software developer',
        description: 'Builds software systems from specifications and designs.',
        escoUri: 'http://data.europa.eu/esco/occupation/software-developer',
        escoCode: '2512.3',
        iscoCode: '2512',
        skills: ['analyse software specifications'],
        source: 'esco',
        sourceLanguage: 'en',
        sourceVersion: 'v1.2.0',
        retrievedAt: '2026-09-06T12:00:00+08:00',
        reviewStatus: 'proposed',
      }]}
    />)

    expect(screen.getByText('Software development')).toBeVisible()
    expect(screen.getByText('Systems administration')).toBeVisible()
    expect(screen.getByText('Business analysis')).toBeVisible()
    expect(screen.getByText('External reference')).toBeVisible()
    expect(screen.getByText(/not job or admission guarantees/i)).toBeVisible()
    expect((await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } })).violations).toEqual([])
  })
})
