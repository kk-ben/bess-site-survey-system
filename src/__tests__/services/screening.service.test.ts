import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreeningService, ScreeningCriteria } from '@/services/screening.service';
import { pool } from '@/config/database';

vi.mock('@/config/database', () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe('ScreeningService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('screenSites', () => {
    it('should screen sites with minimum score criteria', async () => {
      const mockResults = [
        {
          site_id: 'site-1',
          site_name: 'Test Site 1',
          latitude: '35.6812',
          longitude: '139.7671',
          total_score: 85,
          weighted_score: 88,
          recommendation: 'excellent',
          evaluation_date: '2025-01-15T10:00:00Z',
          grid_score: 90,
          setback_score: 85,
          road_score: 80,
          pole_score: 90,
          violates_setback: false,
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({ rows: mockResults } as any);

      const criteria: ScreeningCriteria = {
        minWeightedScore: 80,
      };

      const results = await ScreeningService.screenSites(criteria);

      expect(results).toHaveLength(1);
      expect(results[0].siteName).toBe('Test Site 1');
      expect(results[0].weightedScore).toBe(88);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE e.weighted_score >= $1'),
        [80]
      );
    });

    it('should screen sites with multiple criteria', async () => {
      const mockResults = [
        {
          site_id: 'site-1',
          site_name: 'Test Site 1',
          latitude: '35.6812',
          longitude: '139.7671',
          total_score: 85,
          weighted_score: 88,
          recommendation: 'excellent',
          evaluation_date: '2025-01-15T10:00:00Z',
          grid_score: 90,
          setback_score: 85,
          road_score: 80,
          pole_score: 90,
          violates_setback: false,
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({ rows: mockResults } as any);

      const criteria: ScreeningCriteria = {
        minGridScore: 85,
        minSetbackScore: 80,
        excludeViolations: true,
      };

      const results = await ScreeningService.screenSites(criteria);

      expect(results).toHaveLength(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('e.grid_score >= $1'),
        expect.arrayContaining([85, 80])
      );
    });

    it('should filter by recommendation', async () => {
      const mockResults = [
        {
          site_id: 'site-1',
          site_name: 'Test Site 1',
          latitude: '35.6812',
          longitude: '139.7671',
          total_score: 85,
          weighted_score: 88,
          recommendation: 'excellent',
          evaluation_date: '2025-01-15T10:00:00Z',
          grid_score: 90,
          setback_score: 85,
          road_score: 80,
          pole_score: 90,
          violates_setback: false,
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({ rows: mockResults } as any);

      const criteria: ScreeningCriteria = {
        recommendations: ['excellent', 'good'],
      };

      const results = await ScreeningService.screenSites(criteria);

      expect(results).toHaveLength(1);
      expect(results[0].recommendation).toBe('excellent');
    });

    it('should exclude setback violations', async () => {
      const mockResults = [
        {
          site_id: 'site-1',
          site_name: 'Test Site 1',
          latitude: '35.6812',
          longitude: '139.7671',
          total_score: 85,
          weighted_score: 88,
          recommendation: 'excellent',
          evaluation_date: '2025-01-15T10:00:00Z',
          grid_score: 90,
          setback_score: 85,
          road_score: 80,
          pole_score: 90,
          violates_setback: false,
        },
      ];

      vi.mocked(pool.query).mockResolvedValue({ rows: mockResults } as any);

      const criteria: ScreeningCriteria = {
        excludeViolations: true,
      };

      const results = await ScreeningService.screenSites(criteria);

      expect(results).toHaveLength(1);
      expect(results[0].violatesSetback).toBe(false);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('e.violates_setback = false'),
        []
      );
    });

    it('should return empty array when no sites match', async () => {
      vi.mocked(pool.query).mockResolvedValue({ rows: [] } as any);

      const criteria: ScreeningCriteria = {
        minWeightedScore: 95,
      };

      const results = await ScreeningService.screenSites(criteria);

      expect(results).toHaveLength(0);
    });
  });

  describe('getScreeningStats', () => {
    it('should calculate screening statistics', async () => {
      const mockScreeningResults = [
        {
          site_id: 'site-1',
          site_name: 'Test Site 1',
          latitude: '35.6812',
          longitude: '139.7671',
          total_score: 85,
          weighted_score: 88,
          recommendation: 'excellent',
          evaluation_date: '2025-01-15T10:00:00Z',
          grid_score: 90,
          setback_score: 85,
          road_score: 80,
          pole_score: 90,
          violates_setback: false,
        },
        {
          site_id: 'site-2',
          site_name: 'Test Site 2',
          latitude: '35.6812',
          longitude: '139.7671',
          total_score: 75,
          weighted_score: 78,
          recommendation: 'good',
          evaluation_date: '2025-01-15T10:00:00Z',
          grid_score: 80,
          setback_score: 75,
          road_score: 70,
          pole_score: 80,
          violates_setback: false,
        },
      ];

      const mockTotalCount = { rows: [{ count: '10' }] };

      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: mockScreeningResults } as any)
        .mockResolvedValueOnce(mockTotalCount as any);

      const criteria: ScreeningCriteria = {
        minWeightedScore: 70,
      };

      const stats = await ScreeningService.getScreeningStats(criteria);

      expect(stats.totalSites).toBe(10);
      expect(stats.matchingSites).toBe(2);
      expect(stats.averageScore).toBe(83);
      expect(stats.recommendationBreakdown).toEqual({
        excellent: 1,
        good: 1,
      });
    });

    it('should handle empty results', async () => {
      vi.mocked(pool.query)
        .mockResolvedValueOnce({ rows: [] } as any)
        .mockResolvedValueOnce({ rows: [{ count: '10' }] } as any);

      const criteria: ScreeningCriteria = {
        minWeightedScore: 95,
      };

      const stats = await ScreeningService.getScreeningStats(criteria);

      expect(stats.totalSites).toBe(10);
      expect(stats.matchingSites).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.recommendationBreakdown).toEqual({});
    });
  });
});
