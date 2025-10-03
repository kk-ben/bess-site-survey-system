import { Router } from 'express';
import { SiteController } from '@/controllers/site.controller';
import { authMiddleware, requireRole } from '@/middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', SiteController.getAll);
router.get('/:siteId', SiteController.getById);
router.post('/', requireRole('admin', 'manager'), SiteController.create);
router.put('/:siteId', requireRole('admin', 'manager'), SiteController.update);
router.delete('/:siteId', requireRole('admin'), SiteController.delete);

export default router;
