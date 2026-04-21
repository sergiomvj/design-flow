import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'sergio@facebrasil.com';
  const password = 'Super1404';
  const name = 'Admin Emergência';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log(`[RECOVERY] Tentando promover ou criar admin: ${email}`);
  
  const user = await prisma.user.upsert({
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
  
  console.log(`[SUCCESS] Usuário ${user.email} agora é ADMIN.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
