import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const count = await prisma.interest.count()
  console.log(`Interests count: ${count}`)
  const all = await prisma.interest.findMany()
  console.log('Sample labels:', all.slice(0, 3).map(i => i.label))
}
main().finally(() => prisma.$disconnect())
