import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { env } from './config/env.js';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/users.js';
import storageRoutes from './routes/storage.js'

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/storage', storageRoutes)

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Protected route example
app.get('/protected', authenticateToken, (_req, res) => {
  res.json({ message: 'This is a protected route' });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    app.listen(env.PORT, () => {
      console.log(`✅ Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});