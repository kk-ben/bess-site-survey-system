import { Router } from 'express';
import { ImportController, uploadMiddleware } from '@/controllers/import.controller';
import { authMiddleware, requireRole } from '@/middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('admin', 'manager'));

router.post('/sites/validate', uploadMiddleware, ImportController.validateCsv);
router.post('/sites', uploadMiddleware, ImportController.importCsv);
router.get('/sites/template', ImportController.getTemplate);

export default router;
