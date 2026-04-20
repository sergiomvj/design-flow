import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const email = 'admin@admin.com';
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        name: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Admin user created/updated:', user.email);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
