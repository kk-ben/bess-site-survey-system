// ============================================================================
// BESS Site Survey System v2.0 - Automation Controller
// ============================================================================

import { Request, Response } from 'express';
import { googleElevationService } from '../../services/automation/google-elevation.service';
import { scoringService } from '../../services/automation/scoring.service';
import { SiteModel } from '../../models/v2/site.model';
import { logger } from '../../utils/logger';

export class AutomationControllerV2 {
  /**
   * POST /api/v2/automation/elevation/:siteId
   * 指定サイトの標高を自動取得
   */
  async updateElevation(req: Request, res: Response): Promise<void> {
    try {
      const { siteId } = req.params;

      if (!siteId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Site ID is required'
          }
        });
        return;
      }

      // サイト情報取得
      const site = await SiteModel.findByIdWithDetails(siteId);
      if (!site) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found'
          }
        });
        return;
      }

      // Google Elevation API設定確認
      if (!googleElevationService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Google Elevation API is not configured'
          }
        });
        return;
      }

      // 標高取得・更新
      const result = await googleElevationService.updateSiteElevation(
        siteId,
        site.lat,
        site.lon
      );

      res.json({
        success: true,
        data: {
          site_id: siteId,
          elevation_m: result.elevation,
          updated: result.updated
        },
        message: 'Elevation updated successfully'
      });

    } catch (error) {
      logger.error('Error in updateElevation controller:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      });
    }
  }

  /**
   * POST /api/v2/automation/elevation/batch
   * 複数サイトの標高を一括取得
   */
  async updateElevationBatch(req: Request, res: Response): Promise<void> {
    try {
      const { site_ids } = req.body;

      if (!Array.isArray(site_ids) || site_ids.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'site_ids array is required'
          }
        });
        return;
      }

      // Google Elevation API設定確認
      if (!googleElevationService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Google Elevation API is not configured'
          }
        });
        return;
      }

      // サイト情報を取得
      const sites: Array<{ id: string; lat: number; lon: number }> = [];
      for (const siteId of site_ids) {
        const site = await SiteModel.findByIdWithDetails(siteId);
        if (site) {
          sites.push({
            id: site.id,
            lat: site.lat,
            lon: site.lon
          });
        }
      }

      if (sites.length === 0) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'No valid sites found'
          }
        });
        return;
      }

      // 一括標高取得
      const result = await googleElevationService.updateMultipleSitesElevation(sites);

      res.json({
        success: true,
        data: result,
        message: `Elevation updated for ${result.success} sites`
      });

    } catch (error) {
      logger.error('Error in updateElevationBatch controller:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      });
    }
  }

  /**
   * POST /api/v2/automation/score/:siteId
   * 指定サイトのスコアを再計算
   */
  async calculateScore(req: Request, res: Response): Promise<void> {
    try {
      const { siteId } = req.params;
      const { weights } = req.body;

      if (!siteId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Site ID is required'
          }
        });
        return;
      }

      // サイト存在確認
      const site = await SiteModel.findByIdWithDetails(siteId);
      if (!site) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found'
          }
        });
        return;
      }

      // スコア計算
      const scoreData = await scoringService.calculateSiteScore(siteId, weights);

      if (!scoreData) {
        res.status(500).json({
          success: false,
          error: {
            code: 'CALCULATION_ERROR',
            message: 'Failed to calculate score'
          }
        });
        return;
      }

      // スコア保存
      const saved = await scoringService.saveScore(siteId, weights);

      if (!saved) {
        res.status(500).json({
          success: false,
          error: {
            code: 'SAVE_ERROR',
            message: 'Failed to save score'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          site_id: siteId,
          ...scoreData
        },
        message: 'Score calculated and saved successfully'
      });

    } catch (error) {
      logger.error('Error in calculateScore controller:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      });
    }
  }

  /**
   * POST /api/v2/automation/score/batch
   * 複数サイトのスコアを一括計算
   */
  async calculateScoreBatch(req: Request, res: Response): Promise<void> {
    try {
      const { site_ids, weights } = req.body;

      if (!Array.isArray(site_ids) || site_ids.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'site_ids array is required'
          }
        });
        return;
      }

      const results: Array<{
        siteId: string;
        success: boolean;
        score?: any;
        error?: string;
      }> = [];

      let successCount = 0;
      let failedCount = 0;

      for (const siteId of site_ids) {
        try {
          const scoreData = await scoringService.calculateSiteScore(siteId, weights);
          if (scoreData) {
            await scoringService.saveScore(siteId, weights);
            results.push({
              siteId,
              success: true,
              score: scoreData
            });
            successCount++;
          } else {
            results.push({
              siteId,
              success: false,
              error: 'Failed to calculate score'
            });
            failedCount++;
          }
        } catch (error) {
          results.push({
            siteId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          failedCount++;
        }
      }

      res.json({
        success: true,
        data: {
          success: successCount,
          failed: failedCount,
          results
        },
        message: `Score calculated for ${successCount} sites`
      });

    } catch (error) {
      logger.error('Error in calculateScoreBatch controller:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      });
    }
  }

  /**
   * GET /api/v2/automation/sources/:siteId
   * サイトの自動化ソース情報取得
   */
  async getAutomationSources(req: Request, res: Response): Promise<void> {
    try {
      const { siteId } = req.params;

      if (!siteId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Site ID is required'
          }
        });
        return;
      }

      const site = await SiteModel.findByIdWithDetails(siteId);
      if (!site) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          site_id: siteId,
          automation_sources: site.automation_sources || []
        },
        message: 'Automation sources retrieved successfully'
      });

    } catch (error) {
      logger.error('Error in getAutomationSources controller:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      });
    }
  }

  /**
   * GET /api/v2/automation/status
   * 自動化サービスの状態確認
   */
  async getAutomationStatus(req: Request, res: Response): Promise<void> {
    try {
      const elevationConfigured = googleElevationService.isConfigured();
      const elevationConnected = elevationConfigured 
        ? await googleElevationService.testConnection()
        : false;

      res.json({
        success: true,
        data: {
          elevation_api: {
            configured: elevationConfigured,
            connected: elevationConnected,
            status: elevationConnected ? 'operational' : 'unavailable'
          },
          scoring_service: {
            status: 'operational'
          }
        },
        message: 'Automation status retrieved successfully'
      });

    } catch (error) {
      logger.error('Error in getAutomationStatus controller:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      });
    }
  }
}

export const automationControllerV2 = new AutomationControllerV2();
