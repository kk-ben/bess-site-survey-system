import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CsvExporterService } from '@/services/export/csv-exporter.service';
import { ScreeningResult } from '@/services/screening.service';
import fs from 'fs';
import path from 'path';

vi.mock('@/config/database', () => ({
  pool: {
    query: vi.fn(),
  },
}));

describe('CsvExporterService', () => {
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
    it('should export screening results to CSV', async () => {
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

      const filePath = await CsvExporterService.exportScreeningResults(
        mockResults,
        'test-screening.csv'
      );

      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('サイト名');
      expect(content).toContain('Test Site 1');
      expect(content).toContain('Test Site 2');
      expect(content).toContain('35.681200');
      expect(content).toContain('139.767100');
      expect(content).toContain('優秀');
      expect(content).toContain('良好');
    });

    it('should create upload directory if it does not exist', async () => {
      const newUploadDir = './new-test-uploads';
      process.env['UPLOAD_DIR'] = newUploadDir;

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

      const filePath = await CsvExporterService.exportScreeningResults(mockResults);

      expect(fs.existsSync(newUploadDir)).toBe(true);
      expect(fs.existsSync(filePath)).toBe(true);

      // Cleanup
      fs.rmSync(newUploadDir, { recursive: true, force: true });
    });

    it('should translate recommendations to Japanese', async () => {
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
          totalScore: 45,
          weightedScore: 48,
          recommendation: 'poor',
          evaluationDate: '2025-01-15T11:00:00Z',
          gridScore: 50,
          setbackScore: 45,
          roadScore: 40,
          poleScore: 50,
          violatesSetback: true,
        },
      ];

      const filePath = await CsvExporterService.exportScreeningResults(mockResults);
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('優秀');
      expect(content).toContain('不良');
      expect(content).toContain('あり');
      expect(content).toContain('なし');
    });

    it('should format numbers correctly', async () => {
      const mockResults: ScreeningResult[] = [
        {
          siteId: 'site-1',
          siteName: 'Test Site 1',
          latitude: 35.681234567,
          longitude: 139.767123456,
          totalScore: 85.456,
          weightedScore: 88.789,
          recommendation: 'excellent',
          evaluationDate: '2025-01-15T10:00:00Z',
          gridScore: 90.123,
          setbackScore: 85.456,
          roadScore: 80.789,
          poleScore: 90.012,
          violatesSetback: false,
        },
      ];

      const filePath = await CsvExporterService.exportScreeningResults(mockResults);
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('35.681235'); // 6 decimal places
      expect(content).toContain('139.767123');
      expect(content).toContain('85.5'); // 1 decimal place
      expect(content).toContain('88.8');
    });
  });
});
