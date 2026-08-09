import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

const assetsDirectory = path.resolve('src/assets/Pcs')
const sourceExtensions = new Set(['.jpg', '.jpeg', '.jfif', '.png'])

async function collectSourceImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectSourceImages(entryPath)
    return sourceExtensions.has(path.extname(entry.name).toLowerCase()) ? [entryPath] : []
  }))

  return files.flat()
}

const sourceImages = await collectSourceImages(assetsDirectory)
let sourceBytes = 0
let optimizedBytes = 0

for (const sourcePath of sourceImages) {
  const outputPath = sourcePath.replace(/\.(?:jpe?g|jfif|png)$/i, '.webp')
  const isLogo = /^logo\./i.test(path.basename(sourcePath))
  const sourceInfo = await stat(sourcePath)

  await sharp(sourcePath)
    .rotate()
    .resize(isLogo
      ? { width: 512, height: 512, fit: 'inside', withoutEnlargement: true }
      : { width: 1280, height: 800, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: isLogo ? 82 : 78, effort: 5 })
    .toFile(outputPath)

  const optimizedInfo = await stat(outputPath)
  sourceBytes += sourceInfo.size
  optimizedBytes += optimizedInfo.size
}

const savedPercent = sourceBytes === 0 ? 0 : Math.round((1 - optimizedBytes / sourceBytes) * 100)
console.log(`Optimized ${sourceImages.length} programme images to WebP (${savedPercent}% smaller).`)
