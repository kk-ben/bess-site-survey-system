// ============================================================================
// BESS Site Survey System v2.0 - Google Elevation API Service
// ============================================================================

import axios from 'axios';
import { logger } from '../../utils/logger';
import { IElevationResult } from '../../interfaces/v2/site.interface';
import { GeoRiskModel, AutomationSourceModel } from '../../models/v2/site.model';

export class GoogleElevationService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/elevation/json';
  private maxRetries = 3;
  private retryDelay = 1000; // ms

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('Google Maps API key not configured');
    }
  }

  /**
   * 指定座標の標高を取得
   */
  async getElevation(lat: number, lon: number): Promise<IElevationResult> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Fetching elevation for (${lat}, ${lon}) - Attempt ${attempt}/${this.maxRetries}`);

        const response = await axios.get(this.baseUrl, {
          params: {
            locations: `${lat},${lon}`,
            key: this.apiKey
          },
          timeout: 10000
        });

        if (response.data.status !== 'OK') {
          throw new Error(`Google Elevation API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
        }

        if (!response.data.results || response.data.results.length === 0) {
          throw new Error('No elevation data returned');
        }

        const result = response.data.results[0];
        
        logger.info(`Elevation retrieved: ${result.elevation}m at (${lat}, ${lon})`);

        return {
          elevation: result.elevation,
          location: result.location,
          resolution: result.resolution
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        logger.warn(`Elevation API attempt ${attempt} failed:`, lastError.message);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw new Error(`Failed to fetch elevation after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * サイトの標高を取得してデータベースに保存
   */
  async updateSiteElevation(siteId: string, lat: number, lon: number): Promise<{
    elevation: number;
    updated: boolean;
  }> {
    try {
      // 標高取得
      const elevationData = await this.getElevation(lat, lon);

      // geo_riskテーブルを取得または作成
      let geoRisk = await GeoRiskModel.findBySiteId(siteId);

      if (geoRisk) {
        // 既存レコードを更新
        geoRisk = await GeoRiskModel.update(geoRisk.id, {
          elevation_m: elevationData.elevation,
          automation_level: 'AUTO',
          updated_from_source_at: new Date().toISOString(),
          note: `標高データはGoogle Elevation APIより自動取得（解像度: ${elevationData.resolution}m）`
        });
      } else {
        // 新規レコード作成
        geoRisk = await GeoRiskModel.create({
          site_id: siteId,
          elevation_m: elevationData.elevation,
          automation_level: 'AUTO',
          updated_from_source_at: new Date().toISOString(),
          note: `標高データはGoogle Elevation APIより自動取得（解像度: ${elevationData.resolution}m）`
        });
      }

      // automation_sourcesテーブルに記録
      const existingSource = await AutomationSourceModel.findByTableAndField(
        siteId,
        'geo_risk',
        'elevation_m'
      );

      if (!existingSource) {
        await AutomationSourceModel.create({
          site_id: siteId,
          table_name: 'geo_risk',
          field_name: 'elevation_m',
          source_type: 'API',
          source_name: 'Google Elevation API',
          source_url: this.baseUrl,
          last_updated: new Date().toISOString()
        });
      }

      logger.info(`Site ${siteId} elevation updated: ${elevationData.elevation}m`);

      return {
        elevation: elevationData.elevation,
        updated: true
      };

    } catch (error) {
      logger.error(`Failed to update site elevation for ${siteId}:`, error);
      throw error;
    }
  }

  /**
   * 複数サイトの標高を一括取得
   */
  async updateMultipleSitesElevation(sites: Array<{
    id: string;
    lat: number;
    lon: number;
  }>): Promise<{
    success: number;
    failed: number;
    results: Array<{
      siteId: string;
      success: boolean;
      elevation?: number;
      error?: string;
    }>;
  }> {
    const results: Array<{
      siteId: string;
      success: boolean;
      elevation?: number;
      error?: string;
    }> = [];

    let successCount = 0;
    let failedCount = 0;

    for (const site of sites) {
      try {
        const result = await this.updateSiteElevation(site.id, site.lat, site.lon);
        results.push({
          siteId: site.id,
          success: true,
          elevation: result.elevation
        });
        successCount++;

        // API制限を考慮して少し待機
        await this.delay(200);

      } catch (error) {
        results.push({
          siteId: site.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failedCount++;
      }
    }

    logger.info(`Batch elevation update completed: ${successCount} success, ${failedCount} failed`);

    return {
      success: successCount,
      failed: failedCount,
      results
    };
  }

  /**
   * 遅延ユーティリティ
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * APIキーが設定されているか確認
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * API接続テスト
   */
  async testConnection(): Promise<boolean> {
    try {
      // 東京駅の座標でテスト
      await this.getElevation(35.6812, 139.7671);
      return true;
    } catch (error) {
      logger.error('Google Elevation API connection test failed:', error);
      return false;
    }
  }
}

export const googleElevationService = new GoogleElevationService();
