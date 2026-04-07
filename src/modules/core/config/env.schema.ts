import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['local', 'development', 'staging', 'production', 'test'])
    .default('local')
    .describe('The deployment environment'),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  API_HOST: z.string().optional(),
  DATABASE_URL: z.url(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().int().min(1).max(65535),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_FROM: z.string(),
  MAIL_SECURE: z.coerce.boolean().default(false),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).max(1000).default(0),
});

export type Env = z.infer<typeof envSchema>;
