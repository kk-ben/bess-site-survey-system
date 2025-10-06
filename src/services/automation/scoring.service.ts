// ============================================================================
// BESS Site Survey System v2.0 - Scoring Service
// 自動スコア計算サービス
// ============================================================================
import { supabase } from '../../config/database';
import { logger } from '../../utils/logger';

export interface ScoreWeights {
  grid: number;
  geo: number;
  regulatory: number;
  access: number;
  economics: number;
}

export interface ScoreComponents {
  score_grid: number;
  score_geo: number;
  score_regulatory: number;
  score_access: number;
  score_economics: number;
}

export class ScoringService {
  private readonly FORMULA_VERSION = 'v2.0.0';
  
  private readonly DEFAULT_WEIGHTS: ScoreWeights = {
    grid: 0.30,
    geo: 0.25,
    regulatory: 0.20,
    access: 0.15,
    economics: 0.10
  };

  /**
   * サイトの総合スコアを計算
   */
  async calculateSiteScore(siteId: string, weights?: ScoreWeights): Promise<{
    score_total: number;
    score_components: ScoreComponents;
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
  } | null> {
    try {
      const w = weights || this.DEFAULT_WEIGHTS;

      // 各カテゴリのスコアを計算
      const [gridScore, geoScore, regulatoryScore, accessScore, economicsScore] = await Promise.all([
        this.calculateGridScore(siteId),
        this.calculateGeoScore(siteId),
        this.calculateRegulatoryScore(siteId),
        this.calculateAccessScore(siteId),
        this.calculateEconomicsScore(siteId)
      ]);

      // 総合スコア計算
      const scoreTotal = 
        gridScore * w.grid +
        geoScore * w.geo +
        regulatoryScore * w.regulatory +
        accessScore * w.access +
        economicsScore * w.economics;

      const grade = this.calculateGrade(scoreTotal);

      return {
        score_total: Math.round(scoreTotal * 10) / 10,
        score_components: {
          score_grid: Math.round(gridScore * 10) / 10,
          score_geo: Math.round(geoScore * 10) / 10,
          score_regulatory: Math.round(regulatoryScore * 10) / 10,
          score_access: Math.round(accessScore * 10) / 10,
          score_economics: Math.round(economicsScore * 10) / 10
        },
        grade
      };
    } catch (error) {
      logger.error('Failed to calculate site score:', error);
      return null;
    }
  }

  /**
   * スコアをDBに保存
   */
  async saveScore(siteId: string, weights?: ScoreWeights): Promise<boolean> {
    try {
      const scoreData = await this.calculateSiteScore(siteId, weights);
      if (!scoreData) {
        return false;
      }

      const { error } = await supabase.from('scores').insert({
        site_id: siteId,
        score_total: scoreData.score_total,
        score_grid: scoreData.score_components.score_grid,
        score_geo: scoreData.score_components.score_geo,
        score_regulatory: scoreData.score_components.score_regulatory,
        score_access: scoreData.score_components.score_access,
        score_economics: scoreData.score_components.score_economics,
        grade: scoreData.grade,
        formula_version: this.FORMULA_VERSION
      });

      if (error) {
        logger.error('Failed to save score:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in saveScore:', error);
      return false;
    }
  }

  /**
   * 系統接続スコア計算
   */
  private async calculateGridScore(siteId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('grid_info')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error || !data) {
        return 50; // デフォルトスコア
      }

      let score = 100;

      // 距離による減点
      if (data.substation_distance_m > 5000) score -= 30;
      else if (data.substation_distance_m > 2000) score -= 15;
      else if (data.substation_distance_m > 1000) score -= 5;

      // 容量による加点
      if (data.capacity_available_mw >= 50) score += 0;
      else if (data.capacity_available_mw >= 20) score -= 10;
      else if (data.capacity_available_mw >= 10) score -= 20;
      else score -= 40;

      // 接続コストによる減点
      if (data.connection_cost_jpy > 500000000) score -= 20;
      else if (data.connection_cost_jpy > 200000000) score -= 10;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Error calculating grid score:', error);
      return 50;
    }
  }

  /**
   * 地理リスクスコア計算
   */
  private async calculateGeoScore(siteId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('geo_risk')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error || !data) {
        return 50;
      }

      let score = 100;

      // 傾斜による減点
      if (data.slope_pct > 15) score -= 40;
      else if (data.slope_pct > 10) score -= 25;
      else if (data.slope_pct > 5) score -= 10;

      // 液状化リスクによる減点
      if (data.liquefaction_risk === 'high') score -= 30;
      else if (data.liquefaction_risk === 'medium') score -= 15;

      // 浸水深による減点
      const floodDepth = parseFloat(data.flood_depth_class.replace('m', ''));
      if (floodDepth > 3) score -= 40;
      else if (floodDepth > 1) score -= 20;
      else if (floodDepth > 0.5) score -= 10;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Error calculating geo score:', error);
      return 50;
    }
  }

  /**
   * 規制スコア計算
   */
  private async calculateRegulatoryScore(siteId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('land_regulatory')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error || !data) {
        return 50;
      }

      let score = 100;

      // 農地区分による減点
      if (data.farmland_class === '第1種農地') score -= 50;
      else if (data.farmland_class === '第2種農地') score -= 30;
      else if (data.farmland_class === '第3種農地') score -= 10;

      // 都市計画区域による減点
      if (data.city_plan_zone.includes('市街化区域')) score -= 20;
      else if (data.city_plan_zone.includes('市街化調整区域')) score -= 10;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Error calculating regulatory score:', error);
      return 50;
    }
  }

  /**
   * アクセススコア計算
   */
  private async calculateAccessScore(siteId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('access_physical')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error || !data) {
        return 50;
      }

      let score = 100;

      // 道路幅による減点
      if (data.nearest_road_width_m < 4) score -= 30;
      else if (data.nearest_road_width_m < 6) score -= 15;

      // 道路接続による減点
      if (data.road_access === '接道なし') score -= 50;
      else if (data.road_access === '私道のみ') score -= 25;

      // 区画形状による減点
      if (data.parcel_shape === '不整形') score -= 20;
      else if (data.parcel_shape === 'やや不整形') score -= 10;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Error calculating access score:', error);
      return 50;
    }
  }

  /**
   * 経済性スコア計算
   */
  private async calculateEconomicsScore(siteId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('economics')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error || !data) {
        return 50;
      }

      let score = 100;

      // 土地単価による減点
      if (data.land_price_jpy_per_m2 > 50000) score -= 40;
      else if (data.land_price_jpy_per_m2 > 30000) score -= 25;
      else if (data.land_price_jpy_per_m2 > 10000) score -= 10;

      // 計画出力による加点
      if (data.planned_power_mw >= 50) score += 10;
      else if (data.planned_power_mw >= 20) score += 5;
      else if (data.planned_power_mw < 5) score -= 10;

      return Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Error calculating economics score:', error);
      return 50;
    }
  }

  /**
   * グレード計算
   */
  private calculateGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }
}

export const scoringService = new ScoringService();
