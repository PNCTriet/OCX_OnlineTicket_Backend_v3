import 'dotenv/config';
console.log('DEBUG - DATABASE_URL:', process.env.DATABASE_URL);
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env

const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRawUnsafe('SELECT version()') as { version: string }[];
    console.log('[✅] Connected to Supabase:', result[0].version);
  } catch (err) {
    console.error('[❌] Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
