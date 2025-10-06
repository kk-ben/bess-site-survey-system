// ============================================================================
// BESS Site Survey System v2.0 - Automation Routes
// ============================================================================

import { Router } from 'express';
import { automationControllerV2 } from '../../controllers/v2/automation.controller';
import { authMiddleware } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// 認証とレート制限を適用
router.use(authMiddleware);
router.use(rateLimiter);

/**
 * @route   GET /api/v2/automation/status
 * @desc    自動化サービスの状態確認
 * @access  Private
 */
router.get('/status', (req, res) => automationControllerV2.getAutomationStatus(req, res));

/**
 * @route   POST /api/v2/automation/elevation/:siteId
 * @desc    指定サイトの標高を自動取得
 * @access  Private
 */
router.post('/elevation/:siteId', (req, res) => automationControllerV2.updateElevation(req, res));

/**
 * @route   POST /api/v2/automation/elevation/batch
 * @desc    複数サイトの標高を一括取得
 * @access  Private
 * @body    { site_ids: string[] }
 */
router.post('/elevation/batch', (req, res) => automationControllerV2.updateElevationBatch(req, res));

/**
 * @route   POST /api/v2/automation/score/:siteId
 * @desc    指定サイトのスコアを再計算
 * @access  Private
 * @body    { weights?: ScoreWeights }
 */
router.post('/score/:siteId', (req, res) => automationControllerV2.calculateScore(req, res));

/**
 * @route   POST /api/v2/automation/score/batch
 * @desc    複数サイトのスコアを一括計算
 * @access  Private
 * @body    { site_ids: string[], weights?: ScoreWeights }
 */
router.post('/score/batch', (req, res) => automationControllerV2.calculateScoreBatch(req, res));

/**
 * @route   GET /api/v2/automation/sources/:siteId
 * @desc    サイトの自動化ソース情報取得
 * @access  Private
 */
router.get('/sources/:siteId', (req, res) => automationControllerV2.getAutomationSources(req, res));

export { router as automationRoutesV2 };
