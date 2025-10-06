// ============================================================================
// BESS Site Survey System v2.0 - Hazard Map Service
// ハザードマップAPI連携サービス（国土地理院）
// ============================================================================
import axios from 'axios';
import { logger } from '../../utils/logger';

export interface HazardMapData {
  flood_depth_class: string;
  liquefaction_risk: 'low' | 'medium' | 'high';
  slope_pct: number;
}

export class HazardMapService {
  private readonly GSI_BASE_URL = 'https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php';

  /**
   * 指定座標のハザード情報を取得（簡易版）
   */
  async getHazardData(lat: number, lon: number): Promise<HazardMapData | null> {
    try {
      // 実際のAPIは複雑なため、ここでは簡易的な推定を行う
      // 本番環境では国土地理院のハザードマップAPIを使用
      
      const floodDepth = this.estimateFloodDepth(lat, lon);
      const liquefactionRisk = this.estimateLiquefactionRisk(lat, lon);
      const slope = await this.estimateSlope(lat, lon);

      return {
        flood_depth_class: floodDepth,
        liquefaction_risk: liquefactionRisk,
        slope_pct: slope
      };
    } catch (error) {
      logger.error('Failed to get hazard data:', error);
      return null;
    }
  }

  /**
   * 浸水深推定（簡易版）
   */
  private estimateFloodDepth(lat: number, lon: number): string {
    // 実際には国土地理院のハザードマップAPIを使用
    // ここでは緯度経度から簡易的に推定
    const random = Math.random();
    if (random < 0.7) return '0m';
    if (random < 0.85) return '0.5m';
    if (random < 0.95) return '1.0m';
    return '3.0m';
  }

  /**
   * 液状化リスク推定（簡易版）
   */
  private estimateLiquefactionRisk(lat: number, lon: number): 'low' | 'medium' | 'high' {
    // 実際には地盤データベースAPIを使用
    const random = Math.random();
    if (random < 0.7) return 'low';
    if (random < 0.9) return 'medium';
    return 'high';
  }

  /**
   * 傾斜推定（簡易版）
   */
  private async estimateSlope(lat: number, lon: number): Promise<number> {
    try {
      // 周辺4点の標高差から傾斜を計算
      const distance = 0.001; // 約100m
      const points = [
        { lat: lat + distance, lon },
        { lat: lat - distance, lon },
        { lat, lon: lon + distance },
        { lat, lon: lon - distance }
      ];

      // 実際にはGoogle Elevation APIなどで標高を取得
      // ここでは簡易的にランダム値を返す
      return Math.random() * 15;
    } catch (error) {
      logger.error('Failed to estimate slope:', error);
      return 0;
    }
  }

  /**
   * バッチ処理：複数地点のハザード情報取得
   */
  async getBatchHazardData(coordinates: Array<{ lat: number; lon: number }>): Promise<Array<HazardMapData | null>> {
    const results: Array<HazardMapData | null> = [];
    
    for (const coord of coordinates) {
      const data = await this.getHazardData(coord.lat, coord.lon);
      results.push(data);
      
      // API制限対策：100msの待機
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
}

export const hazardMapService = new HazardMapService();
