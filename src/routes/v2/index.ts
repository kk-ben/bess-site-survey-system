// ============================================================================
// BESS Site Survey System v2.0 - Routes Index
// v2.0 APIルートの統合
// ============================================================================
import { Router } from 'express';
import { siteRoutesV2 } from './site.routes';
import { automationRoutesV2 } from './automation.routes';

const router = Router();

// v2.0 APIルート
router.use('/sites', siteRoutesV2);
router.use('/automation', automationRoutesV2);

export { router as v2Routes };
