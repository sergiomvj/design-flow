import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

export function createPrismaClient(dbUrl: string): PrismaClient {
  // Se for PostgreSQL (VPS), usa o adaptador
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  
  // Para SQLite local no Prisma 7, usamos o construtor padrão
  // Ele lerá a DATABASE_URL do arquivo .env automaticamente
  return new PrismaClient();
}

export function getPrisma(): PrismaClient {
  if (!prisma) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL not set');
    prisma = createPrismaClient(dbUrl);
  }
  return prisma;
}