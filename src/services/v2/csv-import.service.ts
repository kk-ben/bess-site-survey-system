// ============================================================================
// BESS Site Survey System v2.0 - CSV Import Service
// ============================================================================

import { parse } from 'csv-parse/sync';
import { SiteModel } from '../../models/v2/site.model';
import { ICreateSiteDTO } from '../../interfaces/v2/site.interface';
import { logger } from '../../utils/logger';

export interface ICSVImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  sites: Array<{ site_code: string; id: string }>;
}

export class CSVImportServiceV2 {
  /**
   * CSVファイルからサイトをインポート
   */
  static async importFromCSV(
    csvContent: string,
    userId: string
  ): Promise<ICSVImportResult> {
    const result: ICSVImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      sites: []
    };

    try {
      // CSV解析
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      logger.info(`Importing ${records.length} sites from CSV`);

      // 各行を処理
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNumber = i + 2; // ヘッダー行を考慮

        try {
          // データ検証
          const siteData = this.validateAndTransformRow(row);

          // サイト作成
          const site = await SiteModel.create(siteData);

          result.success++;
          result.sites.push({
            site_code: site.site_code,
            id: site.id
          });

          logger.info(`Site imported: ${site.site_code}`);
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            error: error.message
          });

          logger.error(`Error importing row ${rowNumber}:`, error);
        }
      }

      logger.info(`Import completed: ${result.success} success, ${result.failed} failed`);

      return result;
    } catch (error) {
      logger.error('Error parsing CSV:', error);
      throw new Error(`CSV parsing error: ${error.message}`);
    }
  }

  /**
   * CSV行のバリデーションと変換
   */
  private static validateAndTransformRow(row: any): ICreateSiteDTO {
    // 必須フィールドチェック
    if (!row.address || !row.lat || !row.lon) {
      throw new Error('Missing required fields: address, lat, lon');
    }

    // 緯度経度の検証
    const lat = parseFloat(row.lat);
    const lon = parseFloat(row.lon);

    if (isNaN(lat) || isNaN(lon)) {
      throw new Error('Invalid lat/lon values');
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error('Lat/lon out of range');
    }

    // データ変換
    const siteData: ICreateSiteDTO = {
      address: row.address,
      lat,
      lon,
      name: row.name || undefined,
      area_m2: row.area_m2 ? parseFloat(row.area_m2) : undefined,
      land_right_status: row.land_right_status || undefined,
      status: row.status || 'draft',
      priority_rank: row.priority_rank || undefined
    };

    return siteData;
  }

  /**
   * CSVテンプレート生成
   */
  static generateTemplate(): string {
    const headers = [
      'address',
      'lat',
      'lon',
      'name',
      'area_m2',
      'land_right_status',
      'status',
      'priority_rank'
    ];

    const example = [
      '東京都千代田区丸の内1-1-1',
      '35.681236',
      '139.767125',
      'サンプルサイト',
      '10000',
      '所有',
      'draft',
      'A'
    ];

    return `${headers.join(',')}\n${example.join(',')}\n`;
  }

  /**
   * インポート結果のサマリー生成
   */
  static generateSummary(result: ICSVImportResult): string {
    let summary = `CSV Import Summary\n`;
    summary += `==================\n`;
    summary += `Total: ${result.success + result.failed}\n`;
    summary += `Success: ${result.success}\n`;
    summary += `Failed: ${result.failed}\n\n`;

    if (result.errors.length > 0) {
      summary += `Errors:\n`;
      result.errors.forEach(err => {
        summary += `  Row ${err.row}: ${err.error}\n`;
      });
    }

    if (result.sites.length > 0) {
      summary += `\nImported Sites:\n`;
      result.sites.forEach(site => {
        summary += `  ${site.site_code} (${site.id})\n`;
      });
    }

    return summary;
  }
}
