// ============================================================================
// BESS Site Survey System v2.0 - Site Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import {
  SiteModel,
  GridInfoModel,
  GeoRiskModel,
  AutomationSourceModel,
  ScoreModel,
  AuditLogModel
} from '../../models/v2/site.model';
import { ICreateSiteDTO, IUpdateSiteDTO, ISiteFilter, IPaginationParams } from '../../interfaces/v2/site.interface';
import { logger } from '../../utils/logger';

export class SiteControllerV2 {
  /**
   * サイト一覧取得
   * GET /api/v2/sites
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filter: ISiteFilter = {
        status: req.query.status as any,
        priority_rank: req.query.priority_rank as string,
        grade: req.query.grade as any,
        min_score: req.query.min_score ? parseFloat(req.query.min_score as string) : undefined,
        max_score: req.query.max_score ? parseFloat(req.query.max_score as string) : undefined,
        has_pending_review: req.query.has_pending_review === 'true'
      };

      const pagination: IPaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc'
      };

      const result = await SiteModel.findAll(filter, pagination);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Error listing sites:', error);
      next(error);
    }
  }

  /**
   * サイト詳細取得
   * GET /api/v2/sites/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const site = await SiteModel.findByIdWithDetails(id);

      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'Site not found'
        });
      }

      res.json({
        success: true,
        data: site
      });
    } catch (error) {
      logger.error('Error getting site:', error);
      next(error);
    }
  }

  /**
   * サイト作成
   * POST /api/v2/sites
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const siteData: ICreateSiteDTO = req.body;
      
      // バリデーション
      if (!siteData.address || !siteData.lat || !siteData.lon) {
        return res.status(400).json({
          success: false,
          message: 'Required fields: address, lat, lon'
        });
      }

      // サイト作成
      const site = await SiteModel.create(siteData);

      // 監査ログ記録
      await AuditLogModel.create({
        site_id: site.id,
        actor: req.user?.id || 'system',
        table_name: 'sites',
        field_name: 'created',
        new_value: site.site_code,
        changed_at: new Date()
      });

      logger.info(`Site created: ${site.site_code}`);

      res.status(201).json({
        success: true,
        data: site
      });
    } catch (error) {
      logger.error('Error creating site:', error);
      next(error);
    }
  }

  /**
   * サイト更新
   * PUT /api/v2/sites/:id
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: IUpdateSiteDTO = req.body;

      // 既存サイト取得
      const existingSite = await SiteModel.findByIdWithDetails(id);
      if (!existingSite) {
        return res.status(404).json({
          success: false,
          message: 'Site not found'
        });
      }

      // サイト更新
      const updatedSite = await SiteModel.update(id, updateData);

      // 監査ログ記録（変更されたフィールドのみ）
      for (const [key, value] of Object.entries(updateData)) {
        if ((existingSite as any)[key] !== value) {
          await AuditLogModel.create({
            site_id: id,
            actor: req.user?.id || 'system',
            table_name: 'sites',
            field_name: key,
            old_value: String((existingSite as any)[key]),
            new_value: String(value),
            changed_at: new Date()
          });
        }
      }

      logger.info(`Site updated: ${updatedSite.site_code}`);

      res.json({
        success: true,
        data: updatedSite
      });
    } catch (error) {
      logger.error('Error updating site:', error);
      next(error);
    }
  }

  /**
   * サイト削除
   * DELETE /api/v2/sites/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // 既存サイト確認
      const site = await SiteModel.findByIdWithDetails(id);
      if (!site) {
        return res.status(404).json({
          success: false,
          message: 'Site not found'
        });
      }

      // 監査ログ記録
      await AuditLogModel.create({
        site_id: id,
        actor: req.user?.id || 'system',
        table_name: 'sites',
        field_name: 'deleted',
        old_value: site.site_code,
        changed_at: new Date()
      });

      // サイト削除（CASCADE で関連データも削除）
      await SiteModel.delete(id);

      logger.info(`Site deleted: ${site.site_code}`);

      res.json({
        success: true,
        message: 'Site deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting site:', error);
      next(error);
    }
  }

  /**
   * サイトの監査ログ取得
   * GET /api/v2/sites/:id/audit-log
   */
  static async getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const logs = await AuditLogModel.findBySiteId(id, limit);

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      logger.error('Error getting audit log:', error);
      next(error);
    }
  }

  /**
   * サイトのスコア履歴取得
   * GET /api/v2/sites/:id/scores
   */
  static async getScores(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const scores = await ScoreModel.findBySiteId(id);

      res.json({
        success: true,
        data: scores
      });
    } catch (error) {
      logger.error('Error getting scores:', error);
      next(error);
    }
  }

  /**
   * サイトの自動化ソース取得
   * GET /api/v2/sites/:id/automation-sources
   */
  static async getAutomationSources(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sources = await AutomationSourceModel.findBySiteId(id);

      res.json({
        success: true,
        data: sources
      });
    } catch (error) {
      logger.error('Error getting automation sources:', error);
      next(error);
    }
  }

  /**
   * Grid Info更新
   * PUT /api/v2/sites/:id/grid-info
   */
  static async updateGridInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const gridData = req.body;

      // 既存のGrid Info取得
      let gridInfo = await GridInfoModel.findBySiteId(id);

      if (gridInfo) {
        // 更新
        gridInfo = await GridInfoModel.update(gridInfo.id, gridData);
      } else {
        // 新規作成
        gridInfo = await GridInfoModel.create({
          ...gridData,
          site_id: id
        });
      }

      // 監査ログ記録
      await AuditLogModel.create({
        site_id: id,
        actor: req.user?.id || 'system',
        table_name: 'grid_info',
        field_name: 'updated',
        new_value: JSON.stringify(gridData),
        changed_at: new Date()
      });

      res.json({
        success: true,
        data: gridInfo
      });
    } catch (error) {
      logger.error('Error updating grid info:', error);
      next(error);
    }
  }

  /**
   * Geo Risk更新
   * PUT /api/v2/sites/:id/geo-risk
   */
  static async updateGeoRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const geoData = req.body;

      // 既存のGeo Risk取得
      let geoRisk = await GeoRiskModel.findBySiteId(id);

      if (geoRisk) {
        // 更新
        geoRisk = await GeoRiskModel.update(geoRisk.id, geoData);
      } else {
        // 新規作成
        geoRisk = await GeoRiskModel.create({
          ...geoData,
          site_id: id
        });
      }

      // 監査ログ記録
      await AuditLogModel.create({
        site_id: id,
        actor: req.user?.id || 'system',
        table_name: 'geo_risk',
        field_name: 'updated',
        new_value: JSON.stringify(geoData),
        changed_at: new Date()
      });

      res.json({
        success: true,
        data: geoRisk
      });
    } catch (error) {
      logger.error('Error updating geo risk:', error);
      next(error);
    }
  }
}
