import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@facebrasil.com';
  const password = '123456789';
  const name = 'Admin Geral';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log(`[RECOVERY] Criando administrador: ${email}`);
  
  await prisma.user.upsert({
    where: { email },
    update: { 
      role: 'ADMIN',
      password: hashedPassword,
      name
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN'
    }
  });

  // Forçar o outro usuário também
  await prisma.user.updateMany({
    where: { email: 'sergio@facebrasil.com' },
    data: { role: 'ADMIN' }
  });
  
  console.log(`[SUCCESS] Admin criado e Sergio promovido.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
