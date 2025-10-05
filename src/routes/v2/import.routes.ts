// ============================================================================
// BESS Site Survey System v2.0 - Import Routes
// ============================================================================

import { Router } from 'express';
import { ImportControllerV2 } from '../../controllers/v2/import.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// すべてのルートに認証を適用
router.use(authMiddleware);

/**
 * @route   POST /api/v2/import/csv
 * @desc    CSVファイルからサイトをインポート
 * @access  Private
 * @body    { csv_content: string, trigger_initial_jobs?: boolean }
 */
router.post('/csv', ImportControllerV2.importCSV);

/**
 * @route   GET /api/v2/import/template
 * @desc    CSVテンプレートをダウンロード
 * @access  Private
 */
router.get('/template', ImportControllerV2.downloadTemplate);

/**
 * @route   POST /api/v2/import/trigger-initial-jobs
 * @desc    初期ジョブを手動トリガー
 * @access  Private
 * @body    { site_ids: string[] }
 */
router.post('/trigger-initial-jobs', ImportControllerV2.triggerInitialJobs);

export default router;
