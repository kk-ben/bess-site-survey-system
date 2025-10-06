// ============================================================================
// BESS Site Survey System v2.0 - Site Controller
// ============================================================================

import { Request, Response } from 'express';
import { siteServiceV2 } from '../../services/v2/site.service';
import {
  ISiteFilter,
  IPaginationParams,
  ICreateSiteDTO,
  IUpdateSiteDTO
} from '../../interfaces/v2/site.interface';
import { logger } from '../../utils/logger';

export class SiteControllerV2 {
  /**
   * GET /api/v2/sites
   * サイト一覧取得
   */
  async getSites(req: Request, res: Response): Promise<void> {
    try {
      // クエリパラメータからフィルターとページネーションを構築
      const filter: ISiteFilter = {
        status: req.query.status as any,
        priority_rank: req.query.priority_rank as string,
        min_score: req.query.min_score ? parseFloat(req.query.min_score as string) : undefined,
        max_score: req.query.max_score ? parseFloat(req.query.max_score as string) : undefined,
        min_capacity_mw: req.query.min_capacity_mw ? parseFloat(req.query.min_capacity_mw as string) : undefined,
        max_capacity_mw: req.query.max_capacity_mw ? parseFloat(req.query.max_capacity_mw as string) : undefined,
        automation_level: req.query.automation_level as any,
        search: req.query.search as string
      };

      const pagination: IPaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sort_by: req.query.sort_by as string || 'created_at',
        sort_order: (req.query.sort_order as 'asc' | 'desc') || 'desc'
      };

      const result = await siteServiceV2.getSites(filter, pagination);

      res.json({
        success: true,
        data: result,
        message: `Found ${result.total} sites`
      });
    } catch (error) {
      logger.error('Error in getSites controller:', error);
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
   * GET /api/v2/sites/:id
   * サイト詳細取得
   */
  async getSiteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Site ID is required'
          }
        });
        return;
      }

      const site = await siteServiceV2.getSiteById(id);

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
        data: site,
        message: 'Site retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getSiteById controller:', error);
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
   * POST /api/v2/sites
   * サイト新規作成
   */
  async createSite(req: Request, res: Response): Promise<void> {
    try {
      const siteData: ICreateSiteDTO = req.body;
      const userId = (req as any).user?.id || 'system';

      // バリデーション
      const validationError = this.validateCreateSiteRequest(siteData);
      if (validationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationError
          }
        });
        return;
      }

      // サイトコード重複チェック
      if (siteData.site_code) {
        const exists = await siteServiceV2.checkSiteCodeExists(siteData.site_code);
        if (exists) {
          res.status(400).json({
            success: false,
            error: {
              code: 'DUPLICATE_SITE_CODE',
              message: 'Site code already exists'
            }
          });
          return;
        }
      }

      const site = await siteServiceV2.createSite(siteData, userId);

      res.status(201).json({
        success: true,
        data: site,
        message: 'Site created successfully'
      });
    } catch (error) {
      logger.error('Error in createSite controller:', error);
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
   * PUT /api/v2/sites/:id
   * サイト更新
   */
  async updateSite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: IUpdateSiteDTO = req.body;
      const userId = (req as any).user?.id || 'system';

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Site ID is required'
          }
        });
        return;
      }

      // バリデーション
      const validationError = this.validateUpdateSiteRequest(updateData);
      if (validationError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationError
          }
        });
        return;
      }

      const site = await siteServiceV2.updateSite(id, updateData, userId);

      res.json({
        success: true,
        data: site,
        message: 'Site updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateSite controller:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found'
          }
        });
        return;
      }

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
   * DELETE /api/v2/sites/:id
   * サイト削除
   */
  async deleteSite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || 'system';

      if (!id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Site ID is required'
          }
        });
        return;
      }

      await siteServiceV2.deleteSite(id, userId);

      res.json({
        success: true,
        message: 'Site deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteSite controller:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Site not found'
          }
        });
        return;
      }

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
   * GET /api/v2/sites/stats/automation
   * 自動化レベル統計取得
   */
  async getAutomationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await siteServiceV2.getAutomationStats();

      res.json({
        success: true,
        data: stats,
        message: 'Automation statistics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getAutomationStats controller:', error);
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
   * サイト作成リクエストのバリデーション
   */
  private validateCreateSiteRequest(data: ICreateSiteDTO): string | null {
    if (!data.address) {
      return 'Address is required';
    }

    if (typeof data.lat !== 'number' || data.lat < -90 || data.lat > 90) {
      return 'Valid latitude is required (-90 to 90)';
    }

    if (typeof data.lon !== 'number' || data.lon < -180 || data.lon > 180) {
      return 'Valid longitude is required (-180 to 180)';
    }

    if (data.area_m2 !== undefined && (typeof data.area_m2 !== 'number' || data.area_m2 <= 0)) {
      return 'Valid area in square meters is required';
    }

    if (data.status && !['draft', 'under_review', 'approved', 'rejected', 'on_hold'].includes(data.status)) {
      return 'Invalid status value';
    }

    return null;
  }

  /**
   * サイト更新リクエストのバリデーション
   */
  private validateUpdateSiteRequest(data: IUpdateSiteDTO): string | null {
    if (data.lat !== undefined && (typeof data.lat !== 'number' || data.lat < -90 || data.lat > 90)) {
      return 'Valid latitude is required (-90 to 90)';
    }

    if (data.lon !== undefined && (typeof data.lon !== 'number' || data.lon < -180 || data.lon > 180)) {
      return 'Valid longitude is required (-180 to 180)';
    }

    if (data.area_m2 !== undefined && (typeof data.area_m2 !== 'number' || data.area_m2 <= 0)) {
      return 'Valid area in square meters is required';
    }

    if (data.status && !['draft', 'under_review', 'approved', 'rejected', 'on_hold'].includes(data.status)) {
      return 'Invalid status value';
    }

    return null;
  }
}

export const siteControllerV2 = new SiteControllerV2();
