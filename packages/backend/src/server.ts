import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as userRoutes } from './routes/users';
import { router as resumeRoutes } from './routes/resumes';
import { router as jobRoutes } from './routes/jobs';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 