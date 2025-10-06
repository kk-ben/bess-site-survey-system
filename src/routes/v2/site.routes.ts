// ============================================================================
// BESS Site Survey System v2.0 - Site Routes
// ============================================================================

import { Router } from 'express';
import { siteControllerV2 } from '../../controllers/v2/site.controller';
import { authMiddleware } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// 認証とレート制限を適用
router.use(authMiddleware);
router.use(rateLimiter);

/**
 * @route   GET /api/v2/sites
 * @desc    サイト一覧取得（フィルター・ページング対応）
 * @access  Private
 * @query   page, limit, status, priority_rank, min_score, max_score, 
 *          min_capacity_mw, max_capacity_mw, automation_level, search, 
 *          sort_by, sort_order
 */
router.get('/', (req, res) => siteControllerV2.getSites(req, res));

/**
 * @route   GET /api/v2/sites/stats/automation
 * @desc    自動化レベル統計取得
 * @access  Private
 */
router.get('/stats/automation', (req, res) => siteControllerV2.getAutomationStats(req, res));

/**
 * @route   GET /api/v2/sites/:id
 * @desc    サイト詳細取得（全関連データ含む）
 * @access  Private
 */
router.get('/:id', (req, res) => siteControllerV2.getSiteById(req, res));

/**
 * @route   POST /api/v2/sites
 * @desc    サイト新規作成
 * @access  Private
 * @body    ICreateSiteDTO
 */
router.post('/', (req, res) => siteControllerV2.createSite(req, res));

/**
 * @route   PUT /api/v2/sites/:id
 * @desc    サイト更新
 * @access  Private
 * @body    IUpdateSiteDTO
 */
router.put('/:id', (req, res) => siteControllerV2.updateSite(req, res));

/**
 * @route   DELETE /api/v2/sites/:id
 * @desc    サイト削除
 * @access  Private
 */
router.delete('/:id', (req, res) => siteControllerV2.deleteSite(req, res));

export { router as siteRoutesV2 };
