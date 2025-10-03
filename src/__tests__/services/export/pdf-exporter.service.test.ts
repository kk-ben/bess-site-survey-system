import { describe, it, expect } from 'vitest';
import { PdfExporterService } from '../../../services/export/pdf-exporter.service';
import { Site } from '../../../interfaces/site.interface';
import { EvaluationResult } from '../../../interfaces/evaluation.interface';

describe('PdfExporterService', () => {
  const mockSites: Site[] = [
    {
      siteId: 'site-1',
      siteName: 'テストサイト1',
      address: '東京都千代田区1-1-1',
      latitude: 35.6895,
      longitude: 139.6917,
      areaSqm: 10000,
      landUse: '工業用地',
      status: 'evaluated',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      siteId: 'site-2',
      siteName: 'テストサイト2',
      address: '大阪府大阪市2-2-2',
      latitude: 34.6937,
      longitude: 135.5023,
      areaSqm: 15000,
      landUse: '商業用地',
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockEvaluations = new Map<string, EvaluationResult>([
    [
      'site-1',
      {
        evaluationId: 'eval-1',
        siteId: 'site-1',
        overallScore: 85,
        gridConnectionScore: 90,
        roadAccessScore: 80,
        setbackScore: 85,
        poleProximityScore: 85,
        recommendations: ['優良な候補地です', '系統連系が良好です'],
        warnings: [],
        evaluatedAt: new Date(),
        evaluatedBy: 'user-1',
      },
    ],
    [
      'site-2',
      {
        evaluationId: 'eval-2',
        siteId: 'site-2',
        overallScore: 65,
        gridConnectionScore: 70,
        roadAccessScore: 60,
        setbackScore: 65,
        poleProximityScore: 65,
        recommendations: ['良好な候補地です'],
        warnings: ['道路アクセスに注意が必要です'],
        evaluatedAt: new Date(),
        evaluatedBy: 'user-1',
      },
    ],
  ]);

  describe('exportSitesToPdf', () => {
    it('should generate PDF buffer for sites with evaluations', async () => {
      const pdfBuffer = await PdfExporterService.exportSitesToPdf(
        mockSites,
        mockEvaluations
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
      
      // PDFヘッダーの確認
      const header = pdfBuffer.toString('utf8', 0, 4);
      expect(header).toBe('%PDF');
    });

    it('should generate PDF buffer for sites without evaluations', async () => {
      const pdfBuffer = await PdfExporterService.exportSitesToPdf(
        mockSites,
        new Map()
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should handle empty sites array', async () => {
      const pdfBuffer = await PdfExporterService.exportSitesToPdf(
        [],
        new Map()
      );

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should include site information in PDF', async () => {
      const pdfBuffer = await PdfExporterService.exportSitesToPdf(
        [mockSites[0]],
        mockEvaluations
      );

      const pdfContent = pdfBuffer.toString('utf8');
      
      // サイト名が含まれているか確認（PDFの内部表現として）
      expect(pdfContent).toContain('site-1');
    });
  });
});
