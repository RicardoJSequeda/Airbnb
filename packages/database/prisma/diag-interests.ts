import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Testing prisma.interest.findMany()...')
    const interests = await prisma.interest.findMany({
      orderBy: { label: 'asc' },
    })
    console.log('Success! Count:', interests.length)
    console.log('Sample:', interests.slice(0, 2))
  } catch (error) {
    console.error('FAILED with error:')
    console.error(error)
  }
}

test().finally(() => prisma.$disconnect())
