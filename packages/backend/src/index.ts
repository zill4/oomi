import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { env } from './config/env.js';
import { authenticateToken } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/users.js';
import storageRoutes from './routes/storage.js';
import resumeRoutes from './routes/resumes.js';
import notificationRoutes from './routes/notifications.js';
import jobApplicationRoutes from './routes/jobApplications.js'
import session from 'express-session'
import trialRoutes from './routes/trial.js'
import { app, server } from './lib/socket.js';

const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://frontend', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Add with your other routes
app.use('/api/trial', trialRoutes)
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/job-applications', jobApplicationRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Protected route example
app.get('/protected', authenticateToken, (_req, res) => {
  res.json({ message: 'This is a protected route' });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Use the HTTP server with socket.io instead of app.listen
    server.listen(env.PORT, () => {
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