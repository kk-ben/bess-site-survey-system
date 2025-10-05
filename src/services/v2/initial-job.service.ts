// ============================================================================
// BESS Site Survey System v2.0 - Initial Job Service
// インポート直後の自動データ取得
// ============================================================================

import {
  SiteModel,
  GridInfoModel,
  GeoRiskModel,
  AutomationSourceModel,
  ScoreModel
} from '../../models/v2/site.model';
import { logger } from '../../utils/logger';

export class InitialJobService {
  /**
   * 複数サイトの初期ジョブを処理
   */
  static async processMultipleSites(siteIds: string[]): Promise<void> {
    logger.info(`Processing initial jobs for ${siteIds.length} sites`);

    for (const siteId of siteIds) {
      try {
        await this.processSingleSite(siteId);
      } catch (error) {
        logger.error(`Error processing site ${siteId}:`, error);
        // エラーがあっても続行
      }
    }

    logger.info('Initial jobs completed');
  }

  /**
   * 単一サイトの初期ジョブを処理
   */
  static async processSingleSite(siteId: string): Promise<void> {
    logger.info(`Processing initial job for site: ${siteId}`);

    const site = await SiteModel.findByIdWithDetails(siteId);
    if (!site) {
      throw new Error(`Site not found: ${siteId}`);
    }

    // 1. Geo Risk自動取得（AUTO）
    await this.processGeoRisk(site.id, site.lat, site.lon);

    // 2. Grid Info自動取得（AUTO + SEMIプレースホルダ）
    await this.processGridInfo(site.id, site.lat, site.lon);

    // 3. 初期スコア計算
    await this.calculateInitialScore(site.id);

    logger.info(`Initial job completed for site: ${site.site_code}`);
  }

  /**
   * Geo Risk自動取得
   */
  private static async processGeoRisk(siteId: string, lat: number, lon: number): Promise<void> {
    try {
      // TODO: 実際のAPI呼び出しは後で実装
      // 現在はプレースホルダデータを作成
      
      const geoRisk = await GeoRiskModel.create({
        site_id: siteId,
        elevation_m: null, // TODO: Google Elevation API
        slope_pct: null,   // TODO: DEM計算
        flood_depth_class: null, // TODO: 国土地理院ハザードタイル
        liquefaction_risk: null,
        sun_hours_loss: null, // TODO: Google Solar API
        automation_level: 'AUTO',
        updated_from_source_at: new Date(),
        note: 'Placeholder - API integration pending'
      });

      // automation_sources記録
      await AutomationSourceModel.create({
        site_id: siteId,
        table_name: 'geo_risk',
        field_name: 'elevation_m',
        source_type: 'API',
        source_name: 'Google Elevation API',
        source_url: 'https://maps.googleapis.com/maps/api/elevation',
        last_refreshed_at: new Date(),
        refresh_interval_hours: null, // 初回のみ
        parser_version: 'v1.0',
        note: 'Pending implementation'
      });

      logger.info(`Geo risk created for site: ${siteId}`);
    } catch (error) {
      logger.error(`Error processing geo risk for site ${siteId}:`, error);
      throw error;
    }
  }

  /**
   * Grid Info自動取得
   */
  private static async processGridInfo(siteId: string, lat: number, lon: number): Promise<void> {
    try {
      // TODO: 実際の変電所距離計算は後で実装
      
      const gridInfo = await GridInfoModel.create({
        site_id: siteId,
        target_voltage_kv: null, // MANUAL
        substation_distance_m: null, // TODO: 変電所座標DBから計算
        line_distance_m: null, // TODO: OSM送電線データから計算
        capacity_available_mw: null, // SEMI - プレースホルダ
        congestion_level: null,
        connection_cost_jpy: null, // MANUAL
        reinforcement_plan: null,
        automation_level: 'SEMI', // 空き容量は要レビュー
        updated_from_source_at: new Date(),
        note: 'Placeholder - Capacity data requires review'
      });

      // automation_sources記録
      await AutomationSourceModel.create({
        site_id: siteId,
        table_name: 'grid_info',
        field_name: 'substation_distance_m',
        source_type: 'API',
        source_name: 'Substation Database',
        source_url: null,
        last_refreshed_at: new Date(),
        refresh_interval_hours: null,
        parser_version: 'v1.0',
        note: 'Pending implementation'
      });

      logger.info(`Grid info created for site: ${siteId}`);
    } catch (error) {
      logger.error(`Error processing grid info for site ${siteId}:`, error);
      throw error;
    }
  }

  /**
   * 初期スコア計算
   */
  private static async calculateInitialScore(siteId: string): Promise<void> {
    try {
      // TODO: 実際のスコア計算は後で実装
      // 現在はプレースホルダスコアを作成
      
      const score = await ScoreModel.create({
        site_id: siteId,
        score_total: null,
        score_grid: null,
        score_geo: null,
        score_regulatory: null,
        score_access: null,
        score_economics: null,
        grade: null,
        formula_version: 'v1.0',
        calculated_at: new Date()
      });

      logger.info(`Initial score created for site: ${siteId}`);
    } catch (error) {
      logger.error(`Error calculating initial score for site ${siteId}:`, error);
      throw error;
    }
  }
}
