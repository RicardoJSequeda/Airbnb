import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ALL_INTERESTS = [
  { label: 'la naturaleza', icon: 'Mountain' },
  { label: 'Fotografía', icon: 'Camera' },
  { label: 'Música en vivo', icon: 'Music' },
  { label: 'Café', icon: 'Coffee' },
  { label: 'Museos', icon: 'Landmark' },
  { label: 'Escenas gastronómicas', icon: 'Soup' },
  { label: 'Historia', icon: 'Globe' },
  { label: 'Lectura', icon: 'BookOpen' },
  { label: 'Animales', icon: 'PawPrint' },
  { label: 'Arquitectura', icon: 'Building' },
  { label: 'Caminata', icon: 'Footprints' },
  { label: 'Cocina', icon: 'ChefHat' },
  { label: 'Vino', icon: 'Wine' },
  { label: 'Compras', icon: 'ShoppingBag' },
  { label: 'Baile', icon: 'Activity' },
  { label: 'Cultura local', icon: 'Binoculars' },
]

async function main() {
  console.log('Seeding interests...')
  for (const interest of ALL_INTERESTS) {
    await prisma.interest.upsert({
      where: { label: interest.label },
      update: {},
      create: {
        label: interest.label,
        icon: interest.icon,
      },
    })
  }
  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
