import { pool } from '@/config/database';
import { NotFoundError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import {
  EvaluationContext,
  ConfigParameters,
  FinalEvaluation,
} from '@/interfaces/evaluator.interface';
import { GridEvaluator } from './evaluators/grid.evaluator';
import { SetbackEvaluator } from './evaluators/setback.evaluator';
import { RoadEvaluator } from './evaluators/road.evaluator';
import { PoleEvaluator } from './evaluators/pole.evaluator';

export class EvaluationService {
  private static evaluators = [
    new GridEvaluator(),
    new SetbackEvaluator(),
    new RoadEvaluator(),
    new PoleEvaluator(),
  ];

  static async getActiveConfig(): Promise<ConfigParameters> {
    const result = await pool.query(
      `SELECT * FROM config_parameters WHERE is_active = true ORDER BY created_at DESC LIMIT 1`
    );

    if (result.rows.length === 0) {
      throw new Error('No active configuration found');
    }

    const config = result.rows[0];

    return {
      gridWeight: parseFloat(config.grid_weight),
      setbackWeight: parseFloat(config.setback_weight),
      roadWeight: parseFloat(config.road_weight),
      poleWeight: parseFloat(config.pole_weight),
      gridMaxDistanceM: config.grid_max_distance_m,
      gridMinCapacityKw: parseFloat(config.grid_min_capacity_kw),
      residentialSetbackM: config.residential_setback_m,
      schoolSetbackM: config.school_setback_m,
      hospitalSetbackM: config.hospital_setback_m,
      roadMaxDistanceM: config.road_max_distance_m,
      roadMinWidthM: parseFloat(config.road_min_width_m),
      poleMaxDistanceM: config.pole_max_distance_m,
    };
  }

  static async evaluateSite(
    siteId: string,
    userId: string
  ): Promise<FinalEvaluation> {
    // Get site details
    const siteResult = await pool.query(
      `SELECT 
        site_id,
        site_name,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude
       FROM sites
       WHERE site_id = $1`,
      [siteId]
    );

    if (siteResult.rows.length === 0) {
      throw new NotFoundError('Site not found');
    }

    const site = siteResult.rows[0];
    const configParams = await this.getActiveConfig();

    const context: EvaluationContext = {
      siteId,
      latitude: site.latitude,
      longitude: site.longitude,
      configParams,
    };

    // Run all evaluators
    const [gridResult, setbackResult, roadResult, poleResult] = await Promise.all([
      this.evaluators[0].evaluate(context),
      this.evaluators[1].evaluate(context),
      this.evaluators[2].evaluate(context),
      this.evaluators[3].evaluate(context),
    ]);

    // Calculate weighted score
    const totalScore =
      gridResult.score + setbackResult.score + roadResult.score + poleResult.score;
    const averageScore = totalScore / 4;

    const weightedScore =
      gridResult.score * configParams.gridWeight +
      setbackResult.score * configParams.setbackWeight +
      roadResult.score * configParams.roadWeight +
      poleResult.score * configParams.poleWeight;

    // Determine recommendation
    let recommendation: FinalEvaluation['recommendation'];
    let recommendationReason: string;

    // Critical failure: setback violation
    if (!setbackResult.passed) {
      recommendation = 'unsuitable';
      recommendationReason = setbackResult.reason || 'Fails setback requirements';
    } else if (weightedScore >= 80) {
      recommendation = 'excellent';
      recommendationReason = 'Excellent site with strong scores across all criteria';
    } else if (weightedScore >= 65) {
      recommendation = 'good';
      recommendationReason = 'Good site with acceptable scores';
    } else if (weightedScore >= 50) {
      recommendation = 'fair';
      recommendationReason = 'Fair site with some limitations';
    } else if (weightedScore >= 30) {
      recommendation = 'poor';
      recommendationReason = 'Poor site with significant limitations';
    } else {
      recommendation = 'unsuitable';
      recommendationReason = 'Unsuitable site with critical deficiencies';
    }

    // Save evaluation to database
    const evalResult = await pool.query(
      `INSERT INTO evaluations (
        site_id,
        evaluated_by,
        grid_score,
        grid_distance_m,
        nearest_asset_id,
        nearest_asset_type,
        available_capacity_kw,
        setback_score,
        min_residential_distance_m,
        violates_setback,
        nearby_amenities,
        road_score,
        nearest_road_distance_m,
        road_width_m,
        road_type,
        pole_score,
        nearest_pole_distance_m,
        nearest_pole_id,
        total_score,
        weighted_score,
        recommendation,
        recommendation_reason,
        config_used
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING evaluation_id`,
      [
        siteId,
        userId,
        gridResult.score,
        gridResult.details.distanceM,
        gridResult.details.nearestAsset?.id,
        gridResult.details.nearestAsset?.type,
        gridResult.details.capacityKw,
        setbackResult.score,
        setbackResult.details.minResidentialDistanceM,
        !setbackResult.passed,
        JSON.stringify(setbackResult.details),
        roadResult.score,
        roadResult.details.distanceM,
        roadResult.details.estimatedWidthM,
        roadResult.details.nearestRoad?.type,
        poleResult.score,
        poleResult.details.distanceM,
        poleResult.details.nearestPole?.id,
        averageScore,
        weightedScore,
        recommendation,
        recommendationReason,
        JSON.stringify(configParams),
      ]
    );

    logger.info('Site evaluation completed', {
      siteId,
      evaluationId: evalResult.rows[0].evaluation_id,
      recommendation,
      weightedScore: Math.round(weightedScore),
    });

    return {
      siteId,
      gridScore: Math.round(gridResult.score * 10) / 10,
      setbackScore: Math.round(setbackResult.score * 10) / 10,
      roadScore: Math.round(roadResult.score * 10) / 10,
      poleScore: Math.round(poleResult.score * 10) / 10,
      totalScore: Math.round(averageScore * 10) / 10,
      weightedScore: Math.round(weightedScore * 10) / 10,
      recommendation,
      recommendationReason,
      details: {
        grid: gridResult.details,
        setback: setbackResult.details,
        road: roadResult.details,
        pole: poleResult.details,
      },
    };
  }

  static async getEvaluationHistory(siteId: string) {
    const result = await pool.query(
      `SELECT 
        evaluation_id,
        evaluation_date,
        grid_score,
        setback_score,
        road_score,
        pole_score,
        total_score,
        weighted_score,
        recommendation,
        recommendation_reason
       FROM evaluations
       WHERE site_id = $1
       ORDER BY evaluation_date DESC`,
      [siteId]
    );

    return result.rows;
  }
}
