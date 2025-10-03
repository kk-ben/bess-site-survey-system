import { pool } from '@/config/database';
import {
  IEvaluator,
  EvaluationContext,
  EvaluationResult,
  ConfigParameters,
} from '@/interfaces/evaluator.interface';

export class PoleEvaluator implements IEvaluator {
  getName(): string {
    return 'Pole Proximity';
  }

  getWeight(config: ConfigParameters): number {
    return config.poleWeight;
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { latitude, longitude, configParams } = context;

    // Find nearest high-voltage pole
    const result = await pool.query(
      `SELECT 
        pole_id,
        pole_number,
        voltage_kv,
        pole_type,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance_m
       FROM poles
       WHERE ST_DWithin(
         location,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $2
       )
       ORDER BY distance_m ASC
       LIMIT 1`,
      [longitude, latitude, configParams.poleMaxDistanceM]
    );

    if (result.rows.length === 0) {
      return {
        score: 50, // Not critical, so give partial score
        passed: true,
        reason: `No high-voltage pole within ${configParams.poleMaxDistanceM}m (not critical)`,
        details: {
          nearestPole: null,
          distanceM: null,
        },
      };
    }

    const pole = result.rows[0];
    const distanceM = parseFloat(pole.distance_m);

    // Calculate score (closer is better)
    const score = Math.max(
      0,
      100 * (1 - distanceM / configParams.poleMaxDistanceM)
    );

    return {
      score,
      passed: true, // Pole proximity is a bonus, not a requirement
      reason:
        distanceM < 50
          ? 'Excellent pole proximity'
          : distanceM < 100
          ? 'Good pole proximity'
          : 'Pole available within acceptable distance',
      details: {
        nearestPole: {
          id: pole.pole_id,
          number: pole.pole_number,
          voltageKv: pole.voltage_kv,
          type: pole.pole_type,
        },
        distanceM: Math.round(distanceM),
      },
    };
  }
}
