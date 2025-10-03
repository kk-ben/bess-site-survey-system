import { Router } from 'express';
import { ScreeningController } from '@/controllers/screening.controller';
import { authenticate } from '@/middleware/auth';
import { rateLimiter } from '@/middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Screening
router.post(
  '/screen',
  rateLimiter({ maxRequests: 30, windowMs: 60000 }),
  ScreeningController.screenSites
);

// Export screening results
router.post(
  '/export/csv',
  rateLimiter({ maxRequests: 10, windowMs: 60000 }),
  ScreeningController.exportCsv
);

router.post(
  '/export/geojson',
  rateLimiter({ maxRequests: 10, windowMs: 60000 }),
  ScreeningController.exportGeoJson
);

// Export evaluation summary
router.post(
  '/export/evaluation-summary',
  rateLimiter({ maxRequests: 10, windowMs: 60000 }),
  ScreeningController.exportEvaluationSummary
);

// Export for mapping
router.post(
  '/export/mapping',
  rateLimiter({ maxRequests: 10, windowMs: 60000 }),
  ScreeningController.exportForMapping
);

// Export as PDF
router.post(
  '/export/pdf',
  rateLimiter({ maxRequests: 10, windowMs: 60000 }),
  ScreeningController.exportPdf
);

export default router;
