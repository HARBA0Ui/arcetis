import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.reward.updateMany({
    data: {
      minLevel: 1,
      minAccountAge: 0,
      pointsCost: 0
    }
  });
  console.log(`Updated ${result.count} rewards.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
