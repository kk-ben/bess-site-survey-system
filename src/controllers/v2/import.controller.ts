// ============================================================================
// BESS Site Survey System v2.0 - Import Controller
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { CSVImportServiceV2 } from '../../services/v2/csv-import.service';
import { InitialJobService } from '../../services/v2/initial-job.service';
import { logger } from '../../utils/logger';

export class ImportControllerV2 {
  /**
   * CSVインポート
   * POST /api/v2/import/csv
   */
  static async importCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { csv_content, trigger_initial_jobs = true } = req.body;

      if (!csv_content) {
        res.status(400).json({
          success: false,
          message: 'CSV content is required'
        });
        return;
      }

      // CSVインポート実行
      const result = await CSVImportServiceV2.importFromCSV(
        csv_content,
        req.user?.userId || 'system'
      );

      // 初期ジョブトリガー（オプション）
      if (trigger_initial_jobs && result.sites.length > 0) {
        logger.info(`Triggering initial jobs for ${result.sites.length} sites`);
        
        // 非同期で初期ジョブを実行（レスポンスは待たない）
        InitialJobService.processMultipleSites(
          result.sites.map(s => s.id)
        ).catch((error: Error) => {
          logger.error('Error in initial jobs:', error);
        });
      }

      // サマリー生成
      const summary = CSVImportServiceV2.generateSummary(result);
      logger.info(summary);

      res.status(201).json({
        success: true,
        message: 'CSV import completed',
        data: result,
        summary
      });
    } catch (error) {
      logger.error('Error importing CSV:', error);
      next(error);
    }
  }

  /**
   * CSVテンプレートダウンロード
   * GET /api/v2/import/template
   */
  static async downloadTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const template = CSVImportServiceV2.generateTemplate();

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="site-import-template.csv"');
      res.send(template);
    } catch (error) {
      logger.error('Error generating template:', error);
      next(error);
    }
  }

  /**
   * 初期ジョブを手動トリガー
   * POST /api/v2/import/trigger-initial-jobs
   */
  static async triggerInitialJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { site_ids } = req.body;

      if (!site_ids || !Array.isArray(site_ids)) {
        res.status(400).json({
          success: false,
          message: 'site_ids array is required'
        });
        return;
      }

      logger.info(`Manually triggering initial jobs for ${site_ids.length} sites`);

      // 非同期で実行
      InitialJobService.processMultipleSites(site_ids).catch((error: Error) => {
        logger.error('Error in initial jobs:', error);
      });

      res.json({
        success: true,
        message: `Initial jobs triggered for ${site_ids.length} sites`,
        data: { site_ids }
      });
    } catch (error) {
      logger.error('Error triggering initial jobs:', error);
      next(error);
    }
  }
}
