import { pool } from '@/config/database';
import {
  IEvaluator,
  EvaluationContext,
  EvaluationResult,
  ConfigParameters,
} from '@/interfaces/evaluator.interface';

export class SetbackEvaluator implements IEvaluator {
  getName(): string {
    return 'Setback Distance';
  }

  getWeight(config: ConfigParameters): number {
    return config.setbackWeight;
  }

  async evaluate(context: EvaluationContext): Promise<EvaluationResult> {
    const { latitude, longitude, configParams } = context;

    // Check for nearby amenities within buffer zones
    const result = await pool.query(
      `SELECT 
        amenity_type,
        amenity_name,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance_m
       FROM amenities
       WHERE ST_DWithin(
         location,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $3
       )
       ORDER BY distance_m ASC`,
      [longitude, latitude, Math.max(
        configParams.residentialSetbackM,
        configParams.schoolSetbackM,
        configParams.hospitalSetbackM
      )]
    );

    const violations: any[] = [];
    const warnings: any[] = [];
    let minResidentialDistance = Infinity;

    for (const amenity of result.rows) {
      const distanceM = parseFloat(amenity.distance_m);
      const type = amenity.amenity_type.toLowerCase();

      // Check residential setback (mandatory)
      if (
        (type.includes('residential') || type.includes('house') || type.includes('apartment')) &&
        distanceM < configParams.residentialSetbackM
      ) {
        violations.push({
          type: amenity.amenity_type,
          name: amenity.amenity_name,
          distanceM: Math.round(distanceM),
          requiredM: configParams.residentialSetbackM,
          severity: 'critical',
        });
        minResidentialDistance = Math.min(minResidentialDistance, distanceM);
      }

      // Check school setback
      if (
        (type.includes('school') || type.includes('kindergarten')) &&
        distanceM < configParams.schoolSetbackM
      ) {
        warnings.push({
          type: amenity.amenity_type,
          name: amenity.amenity_name,
          distanceM: Math.round(distanceM),
          requiredM: configParams.schoolSetbackM,
          severity: 'high',
        });
      }

      // Check hospital setback
      if (
        (type.includes('hospital') || type.includes('clinic')) &&
        distanceM < configParams.hospitalSetbackM
      ) {
        warnings.push({
          type: amenity.amenity_type,
          name: amenity.amenity_name,
          distanceM: Math.round(distanceM),
          requiredM: configParams.hospitalSetbackM,
          severity: 'high',
        });
      }
    }

    // Calculate score
    let score = 100;

    // Critical violations = automatic fail
    if (violations.length > 0) {
      score = 0;
    } else {
      // Deduct points for warnings
      score -= warnings.length * 15;

      // Bonus for being far from residential
      if (minResidentialDistance !== Infinity) {
        const distanceRatio = minResidentialDistance / configParams.residentialSetbackM;
        if (distanceRatio > 2) {
          score = Math.min(100, score + 20);
        }
      }
    }

    score = Math.max(0, score);

    return {
      score,
      passed: violations.length === 0,
      reason:
        violations.length > 0
          ? `Violates residential setback requirement (${configParams.residentialSetbackM}m)`
          : warnings.length > 0
          ? `Has ${warnings.length} setback warning(s)`
          : 'Meets all setback requirements',
      details: {
        violations,
        warnings,
        minResidentialDistanceM:
          minResidentialDistance !== Infinity
            ? Math.round(minResidentialDistance)
            : null,
        nearbyAmenities: result.rows.length,
      },
    };
  }
}
