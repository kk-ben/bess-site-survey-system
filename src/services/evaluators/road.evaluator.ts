import { pool } from '@/config/database';
import {
  IEvaluator,
  EvaluationContext,
  EvaluationResult,
  ConfigParameters,
} from '@/interfaces/evaluator.interface';

export class RoadEvaluator implements IEvaluator {
  getName(): string {
    return 'Road Access';
  }

  getWeight(config: ConfigParameters): number {
    return config.roadWeight;
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { latitude, longitude, configParams } = context;

    // Find nearest roads (from amenities table with type 'road' or 'highway')
    const result = await pool.query(
      `SELECT 
        amenity_name,
        amenity_type,
        metadata,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance_m
       FROM amenities
       WHERE (amenity_type ILIKE '%road%' OR amenity_type ILIKE '%highway%')
       AND ST_DWithin(
         location,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $3
       )
       ORDER BY distance_m ASC
       LIMIT 5`,
      [longitude, latitude, configParams.roadMaxDistanceM]
    );

    if (result.rows.length === 0) {
      return {
        score: 0,
        passed: false,
        reason: `No road access found within ${configParams.roadMaxDistanceM}m`,
        details: {
          nearestRoad: null,
          distanceM: null,
          estimatedWidthM: null,
        },
      };
    }

    const nearestRoad = result.rows[0];
    const distanceM = parseFloat(nearestRoad.distance_m);

    // Estimate road width from type (heuristic)
    let estimatedWidthM = 4.0; // default
    const roadType = nearestRoad.amenity_type.toLowerCase();

    if (roadType.includes('highway') || roadType.includes('motorway')) {
      estimatedWidthM = 12.0;
    } else if (roadType.includes('primary') || roadType.includes('trunk')) {
      estimatedWidthM = 8.0;
    } else if (roadType.includes('secondary')) {
      estimatedWidthM = 6.0;
    } else if (roadType.includes('tertiary')) {
      estimatedWidthM = 5.0;
    }

    // Try to get width from metadata
    if (nearestRoad.metadata && nearestRoad.metadata.width) {
      estimatedWidthM = parseFloat(nearestRoad.metadata.width);
    }

    // Calculate score
    let score = 100;

    // Distance score (closer is better)
    const distanceScore = Math.max(
      0,
      100 * (1 - distanceM / configParams.roadMaxDistanceM)
    );

    // Width score (wider is better for truck access)
    const widthScore =
      estimatedWidthM >= configParams.roadMinWidthM
        ? 100
        : (estimatedWidthM / configParams.roadMinWidthM) * 100;

    // Road type bonus
    let typeBonus = 0;
    if (roadType.includes('highway') || roadType.includes('motorway')) {
      typeBonus = 20;
    } else if (roadType.includes('primary')) {
      typeBonus = 10;
    }

    score = Math.min(100, distanceScore * 0.5 + widthScore * 0.5 + typeBonus);

    const passed = score >= 50 && estimatedWidthM >= configParams.roadMinWidthM;

    return {
      score,
      passed,
      reason: passed
        ? 'Good road access available'
        : estimatedWidthM < configParams.roadMinWidthM
        ? `Road width insufficient (${estimatedWidthM.toFixed(1)}m < ${configParams.roadMinWidthM}m)`
        : 'Road access is marginal',
      details: {
        nearestRoad: {
          name: nearestRoad.amenity_name,
          type: nearestRoad.amenity_type,
        },
        distanceM: Math.round(distanceM),
        estimatedWidthM: estimatedWidthM.toFixed(1),
        distanceScore: Math.round(distanceScore),
        widthScore: Math.round(widthScore),
        meetsWidthRequirement: estimatedWidthM >= configParams.roadMinWidthM,
      },
    };
  }
}
