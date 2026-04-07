import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/models',
  datasource: {
    // Standard JS fallback ensures the build-time 'prisma generate' succeeds
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder:5432/db',
  },
  migrations: {
    path: './prisma/migrations',
  },
});
