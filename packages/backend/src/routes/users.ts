import { Router } from 'express';
import { getUser, updateUser } from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/:id', authenticateToken, getUser);
router.put('/:id', authenticateToken, updateUser);

export default router; 