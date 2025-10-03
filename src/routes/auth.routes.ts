import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authMiddleware } from '@/middleware/auth';
import { authLimiter } from '@/middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);

export default router;
