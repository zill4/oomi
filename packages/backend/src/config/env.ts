import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/oomi',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  PORT: parseInt(process.env.PORT || '8080', 10)
} as const;

// Basic validation
if (!env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
} 