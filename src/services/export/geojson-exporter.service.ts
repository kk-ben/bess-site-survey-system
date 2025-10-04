import { ScreeningResult } from '../screening.service';
import { logger } from '@/utils/logger';
import { pool } from '@/config/database';
import path from 'path';
import fs from 'fs';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    siteId: string;
    siteName: string;
    totalScore: number;
    weightedScore: number;
    recommendation: string;
    gridScore: number;
    setbackScore: number;
    roadScore: number;
    poleScore: number;
    violatesSetback: boolean;
    evaluationDate: string;
    color: string;
    markerSize: string;
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  metadata: {
    exportDate: string;
    totalFeatures: number;
    averageScore: number;
    recommendationBreakdown: Record<string, number>;
  };
}

export class GeoJsonExporterService {
  /**
   * Export screening results to GeoJSON
   */
  static async exportScreeningResults(
    results: ScreeningResult[],
    filename?: string
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const geoJsonFilename = filename || `bess-screening-results-${timestamp}.geojson`;
    const filePath = path.join(process.env['UPLOAD_DIR'] || './uploads', geoJsonFilename);

    // Ensure upload directory exists
    const uploadDir = path.dirname(filePath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      // Calculate statistics
      const totalScore = results.reduce((sum, result) => sum + result.weightedScore, 0);
      const averageScore = results.length > 0 ? totalScore / results.length : 0;

      const recommendationBreakdown: Record<string, number> = {};
      results.forEach(result => {
        recommendationBreakdown[result.recommendation] = 
          (recommendationBreakdown[result.recommendation] || 0) + 1;
      });

      // Create GeoJSON features
      const features: GeoJSONFeature[] = results.map(result => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [result.longitude, result.latitude],
        },
        properties: {
          siteId: result.siteId,
          siteName: result.siteName,
          totalScore: Math.round(result.totalScore * 10) / 10,
          weightedScore: Math.round(result.weightedScore * 10) / 10,
          recommendation: result.recommendation,
          gridScore: Math.round(result.gridScore * 10) / 10,
          setbackScore: Math.round(result.setbackScore * 10) / 10,
          roadScore: Math.round(result.roadScore * 10) / 10,
          poleScore: Math.round(result.poleScore * 10) / 10,
          violatesSetback: result.violatesSetback,
          evaluationDate: result.evaluationDate.toISOString(),
          color: this.getRecommendationColor(result.recommendation),
          markerSize: this.getMarkerSize(result.weightedScore),
        },
      }));

      // Create GeoJSON collection
      const geoJsonCollection: GeoJSONCollection = {
        type: 'FeatureCollection',
        features,
        metadata: {
          exportDate: new Date().toISOString(),
          totalFeatures: features.length,
          averageScore: Math.round(averageScore * 10) / 10,
          recommendationBreakdown,
        },
      };

      // Write to file
      fs.writeFileSync(filePath, JSON.stringify(geoJsonCollection, null, 2));

      logger.info('GeoJSON export completed', {
        filename: geoJsonFilename,
        featureCount: features.length,
        averageScore,
      });

      return filePath;
    } catch (error) {
      logger.error('GeoJSON export failed:', error);
      throw new Error('Failed to export GeoJSON file');
    }
  }

  /**
   * Export sites with evaluation data to GeoJSON for mapping
   */
  static async exportForMapping(siteIds: string[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const geoJsonFilename = `bess-mapping-data-${timestamp}.geojson`;
    const filePath = path.join(process.env['UPLOAD_DIR'] || './uploads', geoJsonFilename);

    // Ensure upload directory exists
    const uploadDir = path.dirname(filePath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      // Get detailed site and evaluation data
      const placeholders = siteIds.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT 
          s.site_id,
          s.site_name,
          s.address,
          ST_Y(s.location::geometry) as latitude,
          ST_X(s.location::geometry) as longitude,
          s.area_sqm,
          s.land_use,
          s.status,
          e.total_score,
          e.weighted_score,
          e.recommendation,
          e.grid_score,
          e.setback_score,
          e.road_score,
          e.pole_score,
          e.violates_setback,
          e.evaluation_date,
          e.recommendation_reason
        FROM sites s
        LEFT JOIN (
          SELECT DISTINCT ON (site_id) *
          FROM evaluations
          ORDER BY site_id, evaluation_date DESC
        ) e ON s.site_id = e.site_id
        WHERE s.site_id IN (${placeholders})
        ORDER BY s.site_name
      `;

      const result = await pool.query(query, siteIds);

      const features = result.rows.map(row => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)],
        },
        properties: {
          siteId: row.site_id,
          siteName: row.site_name,
          address: row.address || '',
          areaSqm: row.area_sqm || null,
          landUse: row.land_use || '',
          status: row.status,
          totalScore: row.total_score ? Math.round(parseFloat(row.total_score) * 10) / 10 : null,
          weightedScore: row.weighted_score ? Math.round(parseFloat(row.weighted_score) * 10) / 10 : null,
          recommendation: row.recommendation || 'not_evaluated',
          recommendationReason: row.recommendation_reason || '',
          gridScore: row.grid_score ? Math.round(parseFloat(row.grid_score) * 10) / 10 : null,
          setbackScore: row.setback_score ? Math.round(parseFloat(row.setback_score) * 10) / 10 : null,
          roadScore: row.road_score ? Math.round(parseFloat(row.road_score) * 10) / 10 : null,
          poleScore: row.pole_score ? Math.round(parseFloat(row.pole_score) * 10) / 10 : null,
          violatesSetback: row.violates_setback || false,
          evaluationDate: row.evaluation_date || null,
          color: row.recommendation ? this.getRecommendationColor(row.recommendation) : '#6b7280',
          markerSize: row.weighted_score ? this.getMarkerSize(parseFloat(row.weighted_score)) : 'small',
        },
      }));

      const geoJsonCollection = {
        type: 'FeatureCollection' as const,
        features,
        metadata: {
          exportDate: new Date().toISOString(),
          totalFeatures: features.length,
          purpose: 'mapping',
        },
      };

      fs.writeFileSync(filePath, JSON.stringify(geoJsonCollection, null, 2));

      logger.info('Mapping GeoJSON export completed', {
        filename: geoJsonFilename,
        featureCount: features.length,
      });

      return filePath;
    } catch (error) {
      logger.error('Mapping GeoJSON export failed:', error);
      throw new Error('Failed to export mapping GeoJSON file');
    }
  }

  /**
   * Get color based on recommendation
   */
  private static getRecommendationColor(recommendation: string): string {
    const colors: Record<string, string> = {
      excellent: '#22c55e', // Green
      good: '#84cc16',      // Light green
      fair: '#eab308',      // Yellow
      poor: '#f97316',      // Orange
      unsuitable: '#ef4444', // Red
      not_evaluated: '#6b7280', // Gray
    };
    return colors[recommendation] || '#6b7280';
  }

  /**
   * Get marker size based on weighted score
   */
  private static getMarkerSize(weightedScore: number): string {
    if (weightedScore >= 80) return 'large';
    if (weightedScore >= 60) return 'medium';
    return 'small';
  }
}
