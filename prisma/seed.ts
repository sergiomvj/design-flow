import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for seeding');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const email = 'admin@admin.com';
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword, role: 'ADMIN', name: 'System Administrator' },
      create: {
        email,
        name: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin user created/updated:', user.email);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
