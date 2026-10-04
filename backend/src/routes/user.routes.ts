import express from 'express';
import { getUsers, deleteUser, updateUserRole, getUserProfile, updateUserProfile, changePassword, addRewardPoints } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getUsers);
router.get('/me', authMiddleware as any, getUserProfile as any);
router.put('/profile', authMiddleware as any, updateUserProfile as any);
router.put('/change-password', authMiddleware as any, changePassword as any);
router.post('/:id/add-points', addRewardPoints as any);
router.delete('/:id', deleteUser);
router.put('/:id/role', updateUserRole);

export default router;

