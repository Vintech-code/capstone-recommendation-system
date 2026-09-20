const programmeAssets = import.meta.glob('/src/assets/programmes/**/*.webp', { eager: true, import: 'default' }) as Record<string, string>

const programmeFolders: Record<string, string> = {
  'bs-business-administration': 'BA',
  'bs-hospitality-management': 'HM',
  'bachelor-elementary-education': 'EDUC',
  'bachelor-secondary-education-english': 'EDUC',
  'bachelor-secondary-education-filipino': 'EDUC',
  'bachelor-secondary-education-social-studies': 'EDUC',
  'bachelor-physical-education': 'EDUC',
  'bs-criminology': 'CRIM',
  'bs-midwifery': 'MIDWIFE',
  'bachelor-library-information-science': 'BLIS',
  'bs-sociology': 'SOCIO',
  'bs-community-development': 'COMDEV',
  'bs-information-technology': 'IT',
}

function getProgrammeImages(id: string) {
  const folder = programmeFolders[id]
  if (!folder) return { cover: null, logo: null }

  const prefix = `/src/assets/programmes/${folder}/`
  const files = Object.keys(programmeAssets).filter((path) => path.startsWith(prefix))
  const logoKey = files.find((path) => path.toLowerCase().endsWith('logo.webp'))
  const coverKey = files.find((path) => path !== logoKey)

  return {
    logo: logoKey ? programmeAssets[logoKey] : null,
    cover: coverKey ? programmeAssets[coverKey] : null,
  }
}

export { getProgrammeImages }
