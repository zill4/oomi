import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as userRoutes } from './routes/users';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 