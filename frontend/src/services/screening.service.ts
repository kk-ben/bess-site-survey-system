import { apiClient } from '@/lib/api';
import {
  ScreeningCriteria,
  ScreeningResponse,
  ExportFormat,
} from '@/types/screening';

export class ScreeningService {
  static async screenSites(criteria: ScreeningCriteria): Promise<ScreeningResponse> {
    return apiClient.post<ScreeningResponse>('/screening/screen', criteria);
  }

  static async exportResults(
    criteria: ScreeningCriteria,
    format: ExportFormat,
    filename?: string
  ): Promise<void> {
    const url = `/screening/export/${format}`;
    const queryParams = filename ? `?filename=${encodeURIComponent(filename)}` : '';
    
    await apiClient.downloadFile(
      `${url}${queryParams}`,
      criteria,
      filename || `screening-results.${format}`
    );
  }

  static async exportEvaluationSummary(siteIds: string[]): Promise<void> {
    await apiClient.downloadFile(
      '/screening/export/evaluation-summary',
      { siteIds },
      'evaluation-summary.csv'
    );
  }

  static async exportForMapping(siteIds: string[]): Promise<void> {
    await apiClient.downloadFile(
      '/screening/export/mapping',
      { siteIds },
      'mapping-data.geojson'
    );
  }
}
