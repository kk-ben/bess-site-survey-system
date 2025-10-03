import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authMiddleware, requireRole } from '@/middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', requireRole('admin', 'manager'), UserController.getAll);
router.get('/:userId', requireRole('admin', 'manager'), UserController.getById);
router.post('/', requireRole('admin'), UserController.create);
router.put('/:userId', requireRole('admin'), UserController.update);
router.delete('/:userId', requireRole('admin'), UserController.delete);
router.post('/change-password', UserController.changePassword);

export default router;
