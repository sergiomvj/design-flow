import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { initializeDatabase, upsertAdminUser } from './db.ts';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const password = process.env.ADMIN_PASSWORD || 'admin';
  const name = process.env.ADMIN_NAME || 'System Administrator';
  const hashedPassword = await bcrypt.hash(password, 10);

  await initializeDatabase();

  const user = await upsertAdminUser({
    email,
    password: hashedPassword,
    name,
  });

  console.log(`Admin user ready: ${user?.email}`);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
