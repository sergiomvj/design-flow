import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:Super1404@webserver2_postgres_designflow:5432/webserver2?sslmode=disable' });
const adapter = new PrismaPg(pool);
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
