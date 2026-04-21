import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Usuários encontrados:', users.length);
  
  if (users.length > 0) {
    const firstUser = users[0];
    const updated = await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: 'ADMIN' },
    });
    console.log(`Sucesso: O usuário ${updated.email} agora é ADMIN.`);
  } else {
    console.log('Nenhum usuário encontrado no banco.');
  }
}

main()
  .catch((e) => {
    console.error('Erro ao promover usuário:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
