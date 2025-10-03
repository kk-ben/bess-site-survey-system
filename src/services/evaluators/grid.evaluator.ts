import { pool } from '@/config/database';
import {
  IEvaluator,
  EvaluationContext,
  EvaluationResult,
  ConfigParameters,
} from '@/interfaces/evaluator.interface';

export class GridEvaluator implements IEvaluator {
  getName(): string {
    return 'Grid Connectivity';
  }

  getWeight(config: ConfigParameters): number {
    return config.gridWeight;
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { latitude, longitude, configParams } = context;

    // Find nearest grid assets within max distance
    const result = await pool.query(
      `SELECT 
        asset_id,
        asset_type,
        asset_name,
        voltage_kv,
        available_capacity_kw,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance_m
       FROM grid_assets
       WHERE ST_DWithin(
         location,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $3
       )
       AND available_capacity_kw >= $4
       ORDER BY 
         CASE 
           WHEN asset_type = 'substation' THEN 1
           WHEN asset_type = 'distribution_line' THEN 2
           ELSE 3
         END,
         distance_m ASC
       LIMIT 1`,
      [
        longitude,
        latitude,
        configParams.gridMaxDistanceM,
        configParams.gridMinCapacityKw,
      ]
    );

    if (result.rows.length === 0) {
      return {
        score: 0,
        passed: false,
        reason: `No suitable grid connection found within ${configParams.gridMaxDistanceM}m`,
        details: {
          nearestAsset: null,
          distanceM: null,
          capacityKw: null,
        },
      };
    }

    const asset = result.rows[0];
    const distanceM = parseFloat(asset.distance_m);
    const capacityKw = parseFloat(asset.available_capacity_kw);

    // Calculate score based on distance and capacity
    // Closer distance and higher capacity = higher score
    const distanceScore = Math.max(
      0,
      100 * (1 - distanceM / configParams.gridMaxDistanceM)
    );
    const capacityScore = Math.min(
      100,
      (capacityKw / configParams.gridMinCapacityKw) * 50
    );

    // Bonus for substation
    const typeBonus = asset.asset_type === 'substation' ? 20 : 0;

    const finalScore = Math.min(
      100,
      distanceScore * 0.5 + capacityScore * 0.5 + typeBonus
    );

    return {
      score: finalScore,
      passed: finalScore >= 50,
      reason:
        finalScore >= 50
          ? `Good grid connection available (${asset.asset_type})`
          : 'Grid connection is marginal',
      details: {
        nearestAsset: {
          id: asset.asset_id,
          type: asset.asset_type,
          name: asset.asset_name,
          voltageKv: asset.voltage_kv,
        },
        distanceM: Math.round(distanceM),
        capacityKw: Math.round(capacityKw),
        distanceScore: Math.round(distanceScore),
        capacityScore: Math.round(capacityScore),
      },
    };
  }
}
