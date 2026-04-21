import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const emailAdmin = 'admin@facebrasil.com';
  const emailSergio = 'sergio@facebrasil.com';
  const plainPassword = '123456789';
  
  // 1. Gerar o hash real usando o bcrypt do projeto
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  console.log(`[RECOVERY] Gerando hash para senha: ${hashedPassword}`);

  // 2. Criar ou Atualizar o admin solicitado
  await prisma.user.upsert({
    where: { email: emailAdmin },
    update: { 
      role: 'ADMIN',
      password: hashedPassword,
      name: 'Admin Geral'
    },
    create: {
      email: emailAdmin,
      password: hashedPassword,
      name: 'Admin Geral',
      role: 'ADMIN'
    }
  });

  // 3. Garantir o acesso do Sergio
  await prisma.user.updateMany({
    where: { email: emailSergio },
    data: { role: 'ADMIN' }
  });

  console.log(`[SUCCESS] Sistema restaurado.`);
  console.log(`Login: ${emailAdmin}`);
  console.log(`Senha: ${plainPassword}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
