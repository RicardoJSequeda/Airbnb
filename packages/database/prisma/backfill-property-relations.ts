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
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      amenities: true,
      images: true,
      propertyAmenities: { select: { id: true } },
      propertyImages: { select: { id: true } },
    },
  })

  let updated = 0
  let createdAmenities = 0
  let createdImages = 0

  for (const p of properties) {
    const amenities = safeParseArray(p.amenities)
    const images = safeParseArray(p.images)

    const needsAmenities = p.propertyAmenities.length === 0 && amenities.length > 0
    const needsImages = p.propertyImages.length === 0 && images.length > 0

    if (!needsAmenities && !needsImages) continue

    if (needsAmenities) {
      await prisma.propertyAmenity.createMany({
        data: amenities.map((amenityName) => ({ propertyId: p.id, amenityName })),
        skipDuplicates: true,
      })
      createdAmenities += amenities.length
    }

    if (needsImages) {
      await prisma.propertyImage.createMany({
        data: images.map((imageUrl, index) => ({
          propertyId: p.id,
          imageUrl,
          displayOrder: index,
          isPrimary: index === 0,
        })),
        skipDuplicates: true,
      })
      createdImages += images.length
    }

    updated += 1
  }

  console.log('Backfill properties completed:', {
    propertiesTouched: updated,
    createdAmenities,
    createdImages,
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
