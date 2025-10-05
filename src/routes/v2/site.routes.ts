// ============================================================================
// BESS Site Survey System v2.0 - Site Routes
// ============================================================================

import { Router } from 'express';
import { SiteControllerV2 } from '../../controllers/v2/site.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// すべてのルートに認証を適用
router.use(authMiddleware);

// ============================================================================
// Site CRUD
// ============================================================================

/**
 * @route   GET /api/v2/sites
 * @desc    サイト一覧取得（フィルタ・ページネーション対応）
 * @access  Private
 * @query   status, priority_rank, grade, min_score, max_score, has_pending_review
 * @query   page, limit, sort_by, sort_order
 */
router.get('/', SiteControllerV2.list);

/**
 * @route   GET /api/v2/sites/:id
 * @desc    サイト詳細取得（関連データ含む）
 * @access  Private
 */
router.get('/:id', SiteControllerV2.getById);

/**
 * @route   POST /api/v2/sites
 * @desc    サイト作成
 * @access  Private
 * @body    { address, lat, lon, name?, area_m2?, ... }
 */
router.post('/', SiteControllerV2.create);

/**
 * @route   PUT /api/v2/sites/:id
 * @desc    サイト更新
 * @access  Private
 * @body    { name?, address?, status?, ... }
 */
router.put('/:id', SiteControllerV2.update);

/**
 * @route   DELETE /api/v2/sites/:id
 * @desc    サイト削除
 * @access  Private (admin only)
 */
router.delete('/:id', SiteControllerV2.delete);

// ============================================================================
// Site Related Data
// ============================================================================

/**
 * @route   GET /api/v2/sites/:id/audit-log
 * @desc    サイトの監査ログ取得
 * @access  Private
 * @query   limit (default: 50)
 */
router.get('/:id/audit-log', SiteControllerV2.getAuditLog);

/**
 * @route   GET /api/v2/sites/:id/scores
 * @desc    サイトのスコア履歴取得
 * @access  Private
 */
router.get('/:id/scores', SiteControllerV2.getScores);

/**
 * @route   GET /api/v2/sites/:id/automation-sources
 * @desc    サイトの自動化ソース取得
 * @access  Private
 */
router.get('/:id/automation-sources', SiteControllerV2.getAutomationSources);

// ============================================================================
// Site Attribute Updates
// ============================================================================

/**
 * @route   PUT /api/v2/sites/:id/grid-info
 * @desc    Grid Info更新
 * @access  Private
 * @body    { target_voltage_kv?, substation_distance_m?, ... }
 */
router.put('/:id/grid-info', SiteControllerV2.updateGridInfo);

/**
 * @route   PUT /api/v2/sites/:id/geo-risk
 * @desc    Geo Risk更新
 * @access  Private
 * @body    { elevation_m?, slope_pct?, ... }
 */
router.put('/:id/geo-risk', SiteControllerV2.updateGeoRisk);

export default router;
