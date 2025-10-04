import { pool } from '@/config/database';
import { logger } from '@/utils/logger';

export interface ScreeningFilters {
  minScore?: number;
  maxScore?: number;
  recommendation?: string[];
  status?: string[];
  minArea?: number;
  maxArea?: number;
  landUse?: string[];
  hasEvaluation?: boolean;
  gridDistanceMax?: number;
  setbackViolation?: boolean;
  search?: string;
}

export interface ScreeningOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ScreeningCriteria extends ScreeningFilters, ScreeningOptions {}

export interface ScreeningResult {
  siteId: string;
  siteName: string;
  address: string;
  latitude: number;
  longitude: number;
  areaSqm: number;
  landUse: string;
  status?: string;
  weightedScore: number;
  totalScore: number;
  recommendation: string;
  evaluationId?: string;
  gridScore: number;
  setbackScore: number;
  roadScore: number;
  poleScore: number;
  violatesSetback: boolean;
  evaluationDate: Date;
}

export class ScreeningService {
  static async screenSites(
    filters: ScreeningFilters,
    options: ScreeningOptions = {}
  ) {
    const { page = 1, limit = 20, sortBy = 'weighted_score', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause
    if (filters.minScore !== undefined) {
      conditions.push(`e.weighted_score >= $${paramIndex++}`);
      values.push(filters.minScore);
    }

    if (filters.maxScore !== undefined) {
      conditions.push(`e.weighted_score <= $${paramIndex++}`);
      values.push(filters.maxScore);
    }

    if (filters.recommendation && filters.recommendation.length > 0) {
      conditions.push(`e.recommendation = ANY($${paramIndex++})`);
      values.push(filters.recommendation);
    }

    if (filters.status && filters.status.length > 0) {
      conditions.push(`s.status = ANY($${paramIndex++})`);
      values.push(filters.status);
    }

    if (filters.minArea !== undefined) {
      conditions.push(`s.area_sqm >= $${paramIndex++}`);
      values.push(filters.minArea);
    }

    if (filters.maxArea !== undefined) {
      conditions.push(`s.area_sqm <= $${paramIndex++}`);
      values.push(filters.maxArea);
    }

    if (filters.landUse && filters.landUse.length > 0) {
      conditions.push(`s.land_use = ANY($${paramIndex++})`);
      values.push(filters.landUse);
    }

    if (filters.gridDistanceMax !== undefined) {
      conditions.push(`e.grid_distance_m <= $${paramIndex++}`);
      values.push(filters.gridDistanceMax);
    }

    if (filters.setbackViolation !== undefined) {
      conditions.push(`e.violates_setback = $${paramIndex++}`);
      values.push(filters.setbackViolation);
    }

    if (filters.search) {
      conditions.push(
        `(s.site_name ILIKE $${paramIndex} OR s.address ILIKE $${paramIndex})`
      );
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Base query
    let whereClause = '';
    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Count total
    const countQuery = `
      SELECT COUNT(DISTINCT s.site_id)
      FROM sites s
      ${filters.hasEvaluation !== false ? 'INNER' : 'LEFT'} JOIN (
        SELECT DISTINCT ON (site_id) *
        FROM evaluations
        ORDER BY site_id, evaluation_date DESC
      ) e ON s.site_id = e.site_id
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get results
    const validSortColumns = [
      'site_name',
      'weighted_score',
      'total_score',
      'grid_score',
      'setback_score',
      'road_score',
      'pole_score',
      'area_sqm',
      'evaluation_date',
      'created_at',
    ];

    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'weighted_score';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    values.push(limit, offset);

    const dataQuery = `
      SELECT 
        s.site_id,
        s.site_name,
        s.address,
        ST_Y(s.location::geometry) as latitude,
        ST_X(s.location::geometry) as longitude,
        s.area_sqm,
        s.land_use,
        s.status,
        s.created_at,
        e.evaluation_id,
        e.evaluation_date,
        e.grid_score,
        e.setback_score,
        e.road_score,
        e.pole_score,
        e.total_score,
        e.weighted_score,
        e.recommendation,
        e.recommendation_reason,
        e.grid_distance_m,
        e.nearest_asset_type,
        e.violates_setback,
        e.min_residential_distance_m,
        e.road_width_m,
        e.nearest_pole_distance_m
      FROM sites s
      ${filters.hasEvaluation !== false ? 'INNER' : 'LEFT'} JOIN (
        SELECT DISTINCT ON (site_id) *
        FROM evaluations
        ORDER BY site_id, evaluation_date DESC
      ) e ON s.site_id = e.site_id
      ${whereClause}
      ORDER BY ${sortColumn === 'site_name' ? 's.' : 'e.'}${sortColumn} ${order}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const dataResult = await pool.query(dataQuery, values);

    logger.info('Screening completed', {
      filters,
      total,
      returned: dataResult.rows.length,
    });

    return {
      sites: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters,
    };
  }

  static async getScreeningStats(filters: ScreeningFilters) {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause (same as screenSites)
    if (filters.minScore !== undefined) {
      conditions.push(`e.weighted_score >= $${paramIndex++}`);
      values.push(filters.minScore);
    }

    if (filters.maxScore !== undefined) {
      conditions.push(`e.weighted_score <= $${paramIndex++}`);
      values.push(filters.maxScore);
    }

    if (filters.recommendation && filters.recommendation.length > 0) {
      conditions.push(`e.recommendation = ANY($${paramIndex++})`);
      values.push(filters.recommendation);
    }

    let whereClause = '';
    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_sites,
        AVG(e.weighted_score) as avg_score,
        MIN(e.weighted_score) as min_score,
        MAX(e.weighted_score) as max_score,
        COUNT(CASE WHEN e.recommendation = 'excellent' THEN 1 END) as excellent_count,
        COUNT(CASE WHEN e.recommendation = 'good' THEN 1 END) as good_count,
        COUNT(CASE WHEN e.recommendation = 'fair' THEN 1 END) as fair_count,
        COUNT(CASE WHEN e.recommendation = 'poor' THEN 1 END) as poor_count,
        COUNT(CASE WHEN e.recommendation = 'unsuitable' THEN 1 END) as unsuitable_count,
        COUNT(CASE WHEN e.violates_setback = true THEN 1 END) as setback_violations
      FROM sites s
      INNER JOIN (
        SELECT DISTINCT ON (site_id) *
        FROM evaluations
        ORDER BY site_id, evaluation_date DESC
      ) e ON s.site_id = e.site_id
      ${whereClause}
    `;

    const result = await pool.query(statsQuery, values);

    return result.rows[0];
  }
}
