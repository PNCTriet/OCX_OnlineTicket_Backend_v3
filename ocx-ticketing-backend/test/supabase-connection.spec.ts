import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Supabase Database Connection', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to Supabase PostgreSQL and query version', async () => {
    const result = await prisma.$queryRawUnsafe('SELECT version()') as { version: string }[];
    expect(result[0].version).toContain('PostgreSQL');
  });

  it('should be able to list tables', async () => {
    const tables = await prisma.$queryRawUnsafe(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'"
    ) as { tablename: string }[];

    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);
    console.log('Tables:', tables.map(t => t.tablename));
  });
});
