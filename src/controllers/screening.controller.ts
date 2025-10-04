import { Response, NextFunction } from 'express';
import { ScreeningService, ScreeningCriteria } from '../services/screening.service';
// import { CsvExporterService } from '../services/export/csv-exporter.service';
import { GeoJsonExporterService } from '../services/export/geojson-exporter.service';
import { PdfExporterService } from '../services/export/pdf-exporter.service';
import { ValidationError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import path from 'path';

// Temporary workaround for module resolution issue
const CsvExporterService = require('../services/export/csv-exporter.service').CsvExporterService;

export class ScreeningController {
  static async screenSites(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const criteria: ScreeningCriteria = req.body;

      const results = await ScreeningService.screenSites(criteria);
      const stats = await ScreeningService.getScreeningStats(criteria);

      res.json({
        success: true,
        data: {
          results,
          stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportCsv(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const criteria: ScreeningCriteria = req.body;
      const { filename } = req.query;

      const results = await ScreeningService.screenSites(criteria);
      
      if (results.sites.length === 0) {
        throw new ValidationError('No sites match the screening criteria');
      }

      const filePath = await CsvExporterService.exportScreeningResults(
        results.sites,
        filename as string
      );

      const fileName = path.basename(filePath);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      next(error);
    }
  }

  static async exportGeoJson(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const criteria: ScreeningCriteria = req.body;
      const { filename } = req.query;

      const results = await ScreeningService.screenSites(criteria);
      
      if (results.sites.length === 0) {
        throw new ValidationError('No sites match the screening criteria');
      }

      const filePath = await GeoJsonExporterService.exportScreeningResults(
        results.sites,
        filename as string
      );

      const fileName = path.basename(filePath);

      res.setHeader('Content-Type', 'application/geo+json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      next(error);
    }
  }

  static async exportEvaluationSummary(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { siteIds } = req.body;

      if (!siteIds || !Array.isArray(siteIds) || siteIds.length === 0) {
        throw new ValidationError('Site IDs are required');
      }

      const filePath = await CsvExporterService.exportEvaluationSummary(siteIds);
      const fileName = path.basename(filePath);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      next(error);
    }
  }

  static async exportForMapping(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { siteIds } = req.body;

      if (!siteIds || !Array.isArray(siteIds) || siteIds.length === 0) {
        throw new ValidationError('Site IDs are required');
      }

      const filePath = await GeoJsonExporterService.exportForMapping(siteIds);
      const fileName = path.basename(filePath);

      res.setHeader('Content-Type', 'application/geo+json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      next(error);
    }
  }

  static async exportPdf(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const criteria: ScreeningCriteria = req.body;
      const { filename } = req.query;

      const results = await ScreeningService.screenSites(criteria);
      
      if (results.sites.length === 0) {
        throw new ValidationError('No sites match the screening criteria');
      }

      const evaluations = new Map();
      for (const site of results.sites) {
        if (site.evaluationId) {
          // 評価結果を取得（実装は省略）
        }
      }

      const pdfBuffer = await PdfExporterService.exportSitesToPdf(results.sites, evaluations);

      const fileName = filename || `screening-results-${Date.now()}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
