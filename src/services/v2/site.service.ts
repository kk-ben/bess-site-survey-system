// ============================================================================
// BESS Site Survey System v2.0 - Site Service
// ============================================================================

import { supabase } from '../../config/database';
import {
  ISite,
  ISiteWithDetails,
  ICreateSiteDTO,
  IUpdateSiteDTO,
  ISiteFilter,
  IPaginationParams,
  IPaginatedResponse,
  ICreateAuditLogDTO
} from '../../interfaces/v2/site.interface';
import {
  SiteModel,
  GridInfoModel,
  GeoRiskModel,
  ScoreModel,
  AutomationSourceModel,
  AuditLogModel
} from '../../models/v2/site.model';
import { logger } from '../../utils/logger';

export class SiteServiceV2 {
  /**
   * サイト一覧取得（フィルター・ページング対応）
   */
  async getSites(
    filter: ISiteFilter = {},
    pagination: IPaginationParams = {}
  ): Promise<IPaginatedResponse<ISiteWithDetails>> {
    try {
      logger.info('Fetching sites with filter:', filter);
      const result = await SiteModel.findAll(filter, pagination);
      logger.info(`Found ${result.total} sites`);
      return result;
    } catch (error) {
      logger.error('Error fetching sites:', error);
      throw new Error(`Failed to fetch sites: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * サイト詳細取得（全関連データ含む）
   */
  async getSiteById(id: string): Promise<ISiteWithDetails | null> {
    try {
      logger.info(`Fetching site details for ID: ${id}`);
      const site = await SiteModel.findByIdWithDetails(id);
      
      if (!site) {
        logger.warn(`Site not found: ${id}`);
        return null;
      }

      logger.info(`Site found: ${site.site_code}`);
      return site;
    } catch (error) {
      logger.error('Error fetching site details:', error);
      throw new Error(`Failed to fetch site: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * サイト新規作成（トランザクション処理）
   */
  async createSite(data: ICreateSiteDTO, userId: string): Promise<ISiteWithDetails> {
    try {
      logger.info('Creating new site:', data);

      // サイト作成
      const site = await SiteModel.create({
        ...data,
        created_by: userId
      });

      logger.info(`Site created: ${site.site_code}`);

      // 監査ログ記録
      await this.createAuditLog({
        site_id: site.id,
        actor: userId,
        table_name: 'sites',
        field_name: 'status',
        new_value: site.status
      });

      // 詳細情報を取得して返す
      const siteWithDetails = await this.getSiteById(site.id);
      if (!siteWithDetails) {
        throw new Error('Failed to retrieve created site');
      }

      return siteWithDetails;
    } catch (error) {
      logger.error('Error creating site:', error);
      throw new Error(`Failed to create site: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * サイト更新（監査ログ記録）
   */
  async updateSite(id: string, data: IUpdateSiteDTO, userId: string): Promise<ISiteWithDetails> {
    try {
      logger.info(`Updating site ${id}:`, data);

      // 既存データ取得（変更前の値を記録するため）
      const existingSite = await SiteModel.findByIdWithDetails(id);
      if (!existingSite) {
        throw new Error('Site not found');
      }

      // サイト更新
      const updatedSite = await SiteModel.update(id, {
        ...data,
        updated_by: userId
      });

      // 変更された各フィールドの監査ログ記録
      for (const [field, newValue] of Object.entries(data)) {
        const oldValue = (existingSite as any)[field];
        if (oldValue !== newValue) {
          await this.createAuditLog({
            site_id: id,
            actor: userId,
            table_name: 'sites',
            field_name: field,
            old_value: oldValue ? String(oldValue) : undefined,
            new_value: String(newValue)
          });
        }
      }

      logger.info(`Site updated: ${updatedSite.site_code}`);

      // 詳細情報を取得して返す
      const siteWithDetails = await this.getSiteById(id);
      if (!siteWithDetails) {
        throw new Error('Failed to retrieve updated site');
      }

      return siteWithDetails;
    } catch (error) {
      logger.error('Error updating site:', error);
      throw new Error(`Failed to update site: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * サイト削除（カスケード削除）
   */
  async deleteSite(id: string, userId: string): Promise<void> {
    try {
      logger.info(`Deleting site ${id} by user ${userId}`);

      // サイト存在確認
      const site = await SiteModel.findByIdWithDetails(id);
      if (!site) {
        throw new Error('Site not found');
      }

      // 監査ログ記録
      await this.createAuditLog({
        site_id: id,
        actor: userId,
        table_name: 'sites',
        field_name: 'deleted',
        new_value: 'true'
      });

      // サイト削除（関連データはカスケード削除される）
      await SiteModel.delete(id);

      logger.info(`Site deleted: ${site.site_code}`);
    } catch (error) {
      logger.error('Error deleting site:', error);
      throw new Error(`Failed to delete site: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 監査ログ作成
   */
  private async createAuditLog(data: ICreateAuditLogDTO): Promise<void> {
    try {
      await AuditLogModel.create(data);
    } catch (error) {
      // 監査ログの失敗はメイン処理を止めない
      logger.error('Failed to create audit log:', error);
    }
  }

  /**
   * サイトコード重複チェック
   */
  async checkSiteCodeExists(siteCode: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('id')
        .eq('site_code', siteCode)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      logger.error('Error checking site code:', error);
      return false;
    }
  }

  /**
   * 自動化レベル別統計取得
   */
  async getAutomationStats(): Promise<{
    grid_info: Record<string, number>;
    geo_risk: Record<string, number>;
    total_sites: number;
  }> {
    try {
      const [gridStats, geoStats, totalSites] = await Promise.all([
        this.getAutomationStatsByTable('grid_info'),
        this.getAutomationStatsByTable('geo_risk'),
        this.getTotalSitesCount()
      ]);

      return {
        grid_info: gridStats,
        geo_risk: geoStats,
        total_sites: totalSites
      };
    } catch (error) {
      logger.error('Error getting automation stats:', error);
      return {
        grid_info: {},
        geo_risk: {},
        total_sites: 0
      };
    }
  }

  /**
   * テーブル別自動化レベル統計
   */
  private async getAutomationStatsByTable(tableName: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from(tableName)
      .select('automation_level');

    if (error) {
      logger.error(`Error getting automation stats for ${tableName}:`, error);
      return {};
    }

    const stats: Record<string, number> = {};
    data?.forEach((item: any) => {
      const level = item.automation_level || 'MANUAL';
      stats[level] = (stats[level] || 0) + 1;
    });

    return stats;
  }

  /**
   * 総サイト数取得
   */
  private async getTotalSitesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('sites')
      .select('id', { count: 'exact', head: true });

    if (error) {
      logger.error('Error getting total sites count:', error);
      return 0;
    }

    return count || 0;
  }
}

export const siteServiceV2 = new SiteServiceV2();
