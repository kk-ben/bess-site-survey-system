// ============================================================================
// BESS Site Survey System v2.0 - Elevation Service
// Google Elevation APIを使用した標高自動取得
// ============================================================================

import axios from 'axios';
import { logger } from '../../utils/logger';
import { supabase } from '../../config/database';

export interface ElevationResult {
  elevation: number;
  location: { lat: number; lng: number };
}

export class ElevationService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/elevation/json';

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  }

  /**
   * 指定座標の標高を取得してGeoRiskテーブルを更新
   */
  async updateElevation(siteId: string, lat: number, lon: number): Promise<boolean> {
    try {
      if (!this.apiKey) {
        logger.warn('Google Maps API key not configured');
        return false;
      }

      const response = await axios.get(this.baseUrl, {
        params: { locations: `${lat},${lon}`, key: this.apiKey },
        timeout: 10000
      });

      if (response.data.status !== 'OK' || !response.data.results?.[0]) {
        logger.error('Failed to get elevation:', response.data.status);
        return false;
      }

      const elevation = Math.round(response.data.results[0].elevation * 10) / 10;

      // GeoRiskテーブルを更新
      const { error: updateError } = await supabase
        .from('geo_risk')
        .upsert({
          site_id: siteId,
          elevation_m: elevation,
          automation_level: 'AUTO',
          updated_at: new Date().toISOString()
        }, { onConflict: 'site_id' });

      if (updateError) {
        logger.error('Failed to update geo_risk:', updateError);
        return false;
      }

      // 自動化ソースを記録
      await this.recordAutomationSource(siteId, 'geo_risk', 'elevation_m', 
        'Google Elevation API', 'https://maps.googleapis.com/maps/api/elevation/json');

      logger.info(`Elevation updated: ${elevation}m for site ${siteId}`);
      return true;
    } catch (error) {
      logger.error('Error updating elevation:', error);
      return false;
    }
  }

  /**
   * 自動化ソースを記録
   */
  private async recordAutomationSource(
    siteId: string,
    tableName: string,
    fieldName: string,
    sourceName: string,
    sourceUrl: string
  ): Promise<void> {
    try {
      await supabase.from('automation_sources').upsert({
        site_id: siteId,
        table_name: tableName,
        field_name: fieldName,
        source_type: 'API',
        source_name: sourceName,
        source_url: sourceUrl,
        last_updated: new Date().toISOString()
      }, { onConflict: 'site_id,table_name,field_name' });
    } catch (error) {
      logger.error('Failed to record automation source:', error);
    }
  }
}

export const elevationService = new ElevationService();
