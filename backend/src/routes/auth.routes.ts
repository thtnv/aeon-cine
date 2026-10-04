import { Router } from 'express';
import { login, register, forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/forgot-password', forgotPassword as any);
router.post('/reset-password', resetPassword as any);

export default router;
