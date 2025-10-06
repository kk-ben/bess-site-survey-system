// ============================================================================
// BESS Site Survey System v2.0 - Frontend Automation Service
// ============================================================================

import { api } from '../lib/api';

export interface AutomationStatus {
  elevation_api: {
    configured: boolean;
    connected: boolean;
    status: 'operational' | 'unavailable';
  };
  scoring_service: {
    status: 'operational' | 'unavailable';
  };
}

export interface ElevationResult {
  site_id: string;
  elevation_m: number;
  updated: boolean;
}

export interface ScoreResult {
  site_id: string;
  score_total: number;
  score_components: {
    score_grid: number;
    score_geo: number;
    score_regulatory: number;
    score_access: number;
    score_economics: number;
  };
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface BatchResult<T> {
  success: number;
  failed: number;
  results: Array<{
    siteId: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
}

export interface ScoreWeights {
  grid: number;
  geo: number;
  regulatory: number;
  access: number;
  economics: number;
}

export class AutomationServiceV2 {
  private baseUrl = '/api/v2/automation';

  /**
   * 自動化サービスの状態確認
   */
  async getStatus(): Promise<AutomationStatus> {
    const response = await api.get(`${this.baseUrl}/status`);
    return response.data.data;
  }

  /**
   * 指定サイトの標高を自動取得
   */
  async updateElevation(siteId: string): Promise<ElevationResult> {
    const response = await api.post(`${this.baseUrl}/elevation/${siteId}`);
    return response.data.data;
  }

  /**
   * 複数サイトの標高を一括取得
   */
  async updateElevationBatch(siteIds: string[]): Promise<BatchResult<ElevationResult>> {
    const response = await api.post(`${this.baseUrl}/elevation/batch`, {
      site_ids: siteIds
    });
    return response.data.data;
  }

  /**
   * 指定サイトのスコアを再計算
   */
  async calculateScore(siteId: string, weights?: ScoreWeights): Promise<ScoreResult> {
    const response = await api.post(`${this.baseUrl}/score/${siteId}`, {
      weights
    });
    return response.data.data;
  }

  /**
   * 複数サイトのスコアを一括計算
   */
  async calculateScoreBatch(
    siteIds: string[],
    weights?: ScoreWeights
  ): Promise<BatchResult<ScoreResult>> {
    const response = await api.post(`${this.baseUrl}/score/batch`, {
      site_ids: siteIds,
      weights
    });
    return response.data.data;
  }

  /**
   * サイトの自動化ソース情報取得
   */
  async getAutomationSources(siteId: string): Promise<{
    site_id: string;
    automation_sources: any[];
  }> {
    const response = await api.get(`${this.baseUrl}/sources/${siteId}`);
    return response.data.data;
  }
}

export const automationServiceV2 = new AutomationServiceV2();
