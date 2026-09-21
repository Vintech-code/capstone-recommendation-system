import { readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../../..')
const webSource = join(repositoryRoot, 'apps/web/src')
const apiApp = join(repositoryRoot, 'apps/api/app')

const frontendDebtCaps = new Map([
  ['apps/web/src/features/student/dashboard/components/student-dashboard-page.tsx', 1650],
  ['apps/web/src/features/admin/components/admin-student-detail-page.tsx', 1150],
  ['apps/web/src/features/landing/landing-page.tsx', 1050],
  ['apps/web/src/features/student/assessment/components/student-assessment-session-page.tsx', 950],
  ['apps/web/src/features/student/profile/components/student-profile-page.tsx', 800],
  ['apps/web/src/features/student/programmes/components/student-programme-catalogue-page.tsx', 800],
  ['apps/web/src/features/admin/components/admin-programmes-page.tsx', 750],
  ['apps/web/src/features/admin/reports/components/admin-reports-page.tsx', 700],
  ['apps/web/src/features/admin/components/admin-dashboard-page.tsx', 650],
  ['apps/web/src/features/student/recommendations/components/student-recommendation-results-page.tsx', 550],
  ['apps/web/src/features/student/recommendations/components/student-recommendation-results-page.tsx', 600],
  ['apps/web/src/features/auth/components/workspace-preview.tsx', 650],
])

const controllerDebtCaps = new Map([
  ['apps/api/app/Http/Controllers/Admin/AdminWorkspaceController.php', 450],
  ['apps/api/app/Http/Controllers/Recommendation/StudentRecommendationController.php', 450],
  ['apps/api/app/Http/Controllers/Admin/AdminConfigurationController.php', 420],
  ['apps/api/app/Http/Controllers/Assessment/AssessmentSessionController.php', 390],
])

const errors = []

function filesBelow(directory, extensions) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return filesBelow(path, extensions)
    return extensions.has(extname(entry.name)) ? [path] : []
  })
}

function repositoryPath(path) {
  return relative(repositoryRoot, path).replaceAll('\\', '/')
}

function lineCount(source) {
  return source === '' ? 0 : source.replace(/\r\n/g, '\n').split('\n').length
}

function report(path, message) {
  errors.push(`${repositoryPath(path)}: ${message}`)
}

for (const path of filesBelow(webSource, new Set(['.ts', '.tsx']))) {
  const name = repositoryPath(path)
  const source = readFileSync(path, 'utf8')
  const isTest = /(?:^|\/)(?:test\/|e2e\/)|\.(?:test|spec)\.[^.]+$/.test(name)

  if (!isTest && /\b(?:window\.)?fetch\s*\(/.test(source) && name !== 'apps/web/src/services/api-client.ts') {
    report(path, 'use the shared services/api-client transport instead of calling fetch directly')
  }

  if (
    !isTest &&
    /\bnew\s+XMLHttpRequest\b/.test(source) &&
    name !== 'apps/web/src/features/admin/data/admin-api.ts'
  ) {
    report(path, 'use the shared transport; XMLHttpRequest is reserved for the upload adapter with progress events')
  }

  if (/^apps\/web\/src\/components\/(?:ui|shared)\//.test(name) && /['"]@\/features\//.test(source)) {
    report(path, 'shared and primitive components must not depend on feature modules')
  }

  if (/^apps\/web\/src\/services\//.test(name) && /['"]@\/(?:components|features)\//.test(source)) {
    report(path, 'cross-feature services must not depend on UI or feature modules')
  }

  if (/from\s+['"]lucide-react['"]/.test(source) && /\bSparkles\b/.test(source)) {
    report(path, 'do not use the Sparkles icon; choose a neutral task-specific Lucide icon')
  }

  if (!isTest) {
    const maximum = frontendDebtCaps.get(name) ?? 500
    const lines = lineCount(source)
    if (lines > maximum) {
      report(path, `${lines} lines exceeds the ${maximum}-line health guard; split responsibilities or record a reviewed exception`)
    }
  }
}

for (const path of filesBelow(apiApp, new Set(['.php']))) {
  const name = repositoryPath(path)
  const source = readFileSync(path, 'utf8')

  if (/^apps\/api\/app\/(?:Models|Services)\//.test(name) && /App\\Http\\Controllers\\/.test(source)) {
    report(path, 'models and services must not depend on HTTP controllers')
  }

  if (/\benv\s*\(/.test(source)) {
    report(path, 'read environment values through Laravel config instead of env() in application code')
  }

  if (/^apps\/api\/app\/Http\/Controllers\//.test(name)) {
    const maximum = controllerDebtCaps.get(name) ?? 350
    const lines = lineCount(source)
    if (lines > maximum) {
      report(path, `${lines} lines exceeds the ${maximum}-line controller guard; move workflow logic to a service`)
    }
  }
}

if (errors.length > 0) {
  console.error('Architecture checks failed:\n')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log('Architecture checks passed.')
}
