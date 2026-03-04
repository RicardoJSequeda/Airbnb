import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function safeParseArray(value: unknown): string[] {
  if (value == null) return []
  if (Array.isArray(value)) return value.filter((x) => typeof x === 'string' && x.trim() !== '')
  if (typeof value !== 'string') return []
  const raw = value.trim()
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x) => typeof x === 'string' && x.trim() !== '')
  } catch {
    return []
  }
}

async function main() {
  const experiences = await prisma.experience.findMany({
    select: {
      id: true,
      includes: true,
      images: true,
      languages: true,
      experienceIncludes: { select: { id: true } },
      experienceImages: { select: { id: true } },
      experienceLanguages: { select: { id: true } },
    },
  })

  let updated = 0
  let createdIncludes = 0
  let createdImages = 0
  let createdLanguages = 0

  for (const e of experiences) {
    const includes = safeParseArray(e.includes)
    const images = safeParseArray(e.images)
    const languages = safeParseArray(e.languages)

    const needsIncludes = e.experienceIncludes.length === 0 && includes.length > 0
    const needsImages = e.experienceImages.length === 0 && images.length > 0
    const needsLanguages = e.experienceLanguages.length === 0 && languages.length > 0

    if (!needsIncludes && !needsImages && !needsLanguages) continue

    // Importante: evitar transacciones interactivas (PgBouncer / transaction pooling).
    if (needsIncludes) {
      await prisma.experienceInclude.createMany({
        data: includes.map((itemText) => ({ experienceId: e.id, itemText })),
        skipDuplicates: true,
      })
      createdIncludes += includes.length
    }

    if (needsImages) {
      await prisma.experienceImage.createMany({
        data: images.map((imageUrl, index) => ({
          experienceId: e.id,
          imageUrl,
          displayOrder: index,
          isCover: index === 0,
        })),
        skipDuplicates: true,
      })
      createdImages += images.length
    }

    if (needsLanguages) {
      await prisma.experienceLanguage.createMany({
        data: languages.map((languageCode) => ({ experienceId: e.id, languageCode })),
        skipDuplicates: true,
      })
      createdLanguages += languages.length
    }

    updated += 1
  }

  console.log('Backfill completed:', {
    experiencesTouched: updated,
    createdIncludes,
    createdImages,
    createdLanguages,
  })
}

main()
  .catch((e) => {
    console.error('Backfill failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

