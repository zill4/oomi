import { Router } from 'express';
import { getUser, updateUser, updateAvatar } from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js'

const router = Router();

router.get('/:id', authenticateToken, getUser);
router.put('/:id', authenticateToken, updateUser);
router.post('/:id/avatar', authenticateToken, uploadImage.single('avatar'), updateAvatar);

export default router; 