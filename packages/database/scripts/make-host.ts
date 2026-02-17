import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: npx tsx scripts/make-host.ts <email>');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'HOST' },
  });

  console.log('User updated to HOST:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());