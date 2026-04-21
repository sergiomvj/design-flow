import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Current Users:', JSON.stringify(users, null, 2));

  if (users.length > 0) {
    // Promover o primeiro usuário a ADMIN (provavelmente é o desenvolvedor)
    const firstUser = users[0];
    await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: 'ADMIN' },
    });
    console.log(`User ${firstUser.email} has been promoted to ADMIN.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
