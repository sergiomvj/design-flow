import { PrismaClient } from '@prisma/client';

// Forçando o caminho do banco para o Prisma 7
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.sqlite'
    }
  }
});

async function main() {
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    const firstUser = users[0];
    await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: 'ADMIN' },
    });
    console.log(`OK: ${firstUser.email} agora é ADMIN.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
