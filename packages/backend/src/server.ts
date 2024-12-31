import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as userRoutes } from './routes/users';
import authRoutes from './routes/authRoutes';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
}); 