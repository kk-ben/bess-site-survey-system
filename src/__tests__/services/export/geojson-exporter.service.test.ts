import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GeoJsonExporterService, GeoJSONCollection } from '@/services/export/geojson-exporter.service';
import { ScreeningResult } from '@/services/screening.service';
import fs from 'fs';

vi.mock('@/config/database', () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe('GeoJsonExporterService', () => {
  const testUploadDir = './test-uploads';

  beforeEach(() => {
    process.env['UPLOAD_DIR'] = testUploadDir;
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
  });

  describe('exportScreeningResults', () => {
    it('should export screening results to GeoJSON', async () => {
      const mockResults: ScreeningResult[] = [
        {
          siteId: 'site-1',
          siteName: 'Test Site 1',
          latitude: 35.6812,
          longitude: 139.7671,
          totalScore: 85,
          weightedScore: 88,
          recommendation: 'excellent',
          evaluationDate: '2025-01-15T10:00:00Z',
          gridScore: 90,
          setbackScore: 85,
          roadScore: 80,
          poleScore: 90,
          violatesSetback: false,
        },
        {
          siteId: 'site-2',
          siteName: 'Test Site 2',
          latitude: 35.6895,
          longitude: 139.6917,
          totalScore: 75,
          weightedScore: 78,
          recommendation: 'good',
          evaluationDate: '2025-01-15T11:00:00Z',
          gridScore: 80,
          setbackScore: 75,
          roadScore: 70,
          poleScore: 80,
          violatesSetback: false,
        },
      ];

      const filePath = await GeoJsonExporterService.exportScreeningResults(
        mockResults,
        'test-screening.geojson'
      );

      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      const geoJson: GeoJSONCollection = JSON.parse(content);

      expect(geoJson.type).toBe('FeatureCollection');
      expect(geoJson.features).toHaveLength(2);
      expect(geoJson.metadata.totalFeatures).toBe(2);
      expect(geoJson.metadata.averageScore).toBe(83);
    });

    it('should create valid GeoJSON features', async () => {
      const mockResults: ScreeningResult[] = [
        {
          siteId: 'site-1',
          siteName: 'Test Site 1',
          latitude: 35.6812,
          longitude: 139.7671,
          totalScore: 85,
          weightedScore: 88,
          recommendation: 'excellent',
          evaluationDate: '2025-01-15T10:00:00Z',
          gridScore: 90,
          setbackScore: 85,
          roadScore: 80,
          poleScore: 90,
          violatesSetback: false,
        },
      ];

      const filePath = await GeoJsonExporterService.exportScreeningResults(mockResults);
      const content = fs.readFileSync(filePath, 'utf-8');
      const geoJson: GeoJSONCollection = JSON.parse(content);

      const feature = geoJson.features[0];
      expect(feature.type).toBe('Feature');
      expect(feature.geometry.type).toBe('Point');
      expect(feature.geometry.coordinates).toEqual([139.7671, 35.6812]);
      expect(feature.properties.siteId).toBe('site-1');
      expect(feature.properties.siteName).toBe('Test Site 1');
      expect(feature.properties.weightedScore).toBe(88);
      expect(feature.properties.recommendation).toBe('excellent');
    });

    it('should assign correct colors based on recommendation', async () => {
      const mockResults: ScreeningResult[] = [
        {
          siteId: 'site-1',
          siteName: 'Excellent Site',
          latitude: 35.6812,
          longitude: 139.7671,
          totalScore: 90,
          weightedScore: 92,
          recommendation: 'excellent',
          evaluationDate: '2025-01-15T10:00:00Z',
          gridScore: 95,
          setbackScore: 90,
          roadScore: 90,
          poleScore: 95,
          violatesSetback: false,
        },
        {
          siteId: 'site-2',
          siteName: 'Good Site',
          latitude: 35.6895,
          longitude: 139.6917,
          totalScore: 75,
          weightedScore: 78,
          recommendation: 'good',
          evaluationDate: '2025-01-15T11:00:00Z',
          gridScore: 80,
          setbackScore: 75,
          roadScore: 75,
          poleScore: 80,
          violatesSetback: false,
        },
        {
          siteId: 'site-3',
          siteName: 'Poor Site',
          latitude: 35.6700,
          longitude: 139.7000,
          totalScore: 45,
          weightedScore: 48,
          recommendation: 'poor',
          evaluationDate: '2025-01-15T12:00:00Z',
          gridScore: 50,
          setbackScore: 45,
          roadScore: 45,
          poleScore: 50,
          violatesSetback: true,
        },
      ];

      const filePath = await GeoJsonExporterService.exportScreeningResults(mockResults);
      const content = fs.readFileSync(filePath, 'utf-8');
      const geoJson: GeoJSONCollection = JSON.parse(content);

      expect(geoJson.features[0].properties.color).toBe('#22c55e'); // Green for excellent
      expect(geoJson.features[1].properties.color).toBe('#84cc16'); // Light green for good
      expect(geoJson.features[2].properties.color).toBe('#f97316'); // Orange for poor
    });

    it('should assign correct marker sizes based on score', async () => {
      const mockResults: ScreeningResult[] = [
        {
          siteId: 'site-1',
          siteName: 'High Score Site',
          latitude: 35.6812,
          longitude: 139.7671,
          totalScore: 85,
          weightedScore: 85,
          recommendation: 'excellent',
          evaluationDate: '2025-01-15T10:00:00Z',
          gridScore: 90,
          setbackScore: 85,
          roadScore: 80,
          poleScore: 90,
          violatesSetback: false,
        },
        {
          siteId: 'site-2',
          siteName: 'Medium Score Site',
          latitude: 35.6895,
          longitude: 139.6917,
          totalScore: 65,
          weightedScore: 65,
          recommendation: 'fair',
          evaluationDate: '2025-01-15T11:00:00Z',
          gridScore: 70,
          setbackScore: 65,
          roadScore: 60,
          poleScore: 70,
          violatesSetback: false,
        },
        {
          siteId: 'site-3',
          siteName: 'Low Score Site',
          latitude: 35.6700,
          longitude: 139.7000,
          totalScore: 45,
          weightedScore: 45,
          recommendation: 'poor',
          evaluationDate: '2025-01-15T12:00:00Z',
          gridScore: 50,
          setbackScore: 45,
          roadScore: 40,
          poleScore: 50,
          violatesSetback: false,
        },
      ];

      const filePath = await GeoJsonExporterService.exportScreeningResults(mockResults);
      const content = fs.readFileSync(filePath, 'utf-8');
      const geoJson: GeoJSONCollection = JSON.parse(content);

      expect(geoJson.features[0].properties.markerSize).toBe('large'); // >= 80
      expect(geoJson.features[1].properties.markerSize).toBe('medium'); // >= 60
      expect(geoJson.features[2].properties.markerSize).toBe('small'); // < 60
    });

    it('should calculate recommendation breakdown correctly', async () => {
      const mockResults: ScreeningResult[] = [
        {
          siteId: 'site-1',
          siteName: 'Site 1',
          latitude: 35.6812,
          longitude: 139.7671,
          totalScore: 90,
          weightedScore: 92,
          recommendation: 'excellent',
          evaluationDate: '2025-01-15T10:00:00Z',
          gridScore: 95,
          setbackScore: 90,
          roadScore: 90,
          poleScore: 95,
          violatesSetback: false,
        },
        {
          siteId: 'site-2',
          siteName: 'Site 2',
          latitude: 35.6895,
          longitude: 139.6917,
          totalScore: 88,
          weightedScore: 90,
          recommendation: 'excellent',
          evaluationDate: '2025-01-15T11:00:00Z',
          gridScore: 92,
          setbackScore: 88,
          roadScore: 88,
          poleScore: 92,
          violatesSetback: false,
        },
        {
          siteId: 'site-3',
          siteName: 'Site 3',
          latitude: 35.6700,
          longitude: 139.7000,
          totalScore: 75,
          weightedScore: 78,
          recommendation: 'good',
          evaluationDate: '2025-01-15T12:00:00Z',
          gridScore: 80,
          setbackScore: 75,
          roadScore: 75,
          poleScore: 80,
          violatesSetback: false,
        },
      ];

      const filePath = await GeoJsonExporterService.exportScreeningResults(mockResults);
      const content = fs.readFileSync(filePath, 'utf-8');
      const geoJson: GeoJSONCollection = JSON.parse(content);

      expect(geoJson.metadata.recommendationBreakdown).toEqual({
        excellent: 2,
        good: 1,
      });
    });
  });
});
