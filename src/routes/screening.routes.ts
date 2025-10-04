import { Router } from 'express';
import { ScreeningController } from '@/controllers/screening.controller';
import { authenticate } from '@/middleware/auth';
import { generalLimiter } from '@/middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Screening
router.post(
  '/screen',
  generalLimiter,
  ScreeningController.screenSites
);

// Export screening results
router.post(
  '/export/csv',
  generalLimiter,
  ScreeningController.exportCsv
);

router.post(
  '/export/geojson',
  generalLimiter,
  ScreeningController.exportGeoJson
);

// Export evaluation summary
router.post(
  '/export/evaluation-summary',
  generalLimiter,
  ScreeningController.exportEvaluationSummary
);

// Export for mapping
router.post(
  '/export/mapping',
  generalLimiter,
  ScreeningController.exportForMapping
);

// Export as PDF
router.post(
  '/export/pdf',
  generalLimiter,
  ScreeningController.exportPdf
);

export default router;
