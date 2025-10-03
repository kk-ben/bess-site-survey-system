import { Router } from 'express';
import { EvaluationController } from '@/controllers/evaluation.controller';
import { authMiddleware } from '@/middleware/auth';
import { evaluationLimiter } from '@/middleware/rateLimiter';

const router = Router();

router.use(authMiddleware);

router.post('/', evaluationLimiter, EvaluationController.evaluateSite);
router.get('/sites/:siteId/history', EvaluationController.getEvaluationHistory);

export default router;
