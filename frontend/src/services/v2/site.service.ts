// ============================================================================
// BESS Site Survey System v2.0 - Frontend Site Service
// ============================================================================

import { api } from '../lib/api';

// 型定義
export interface Site {
  id: string;
  site_code: string;
  name: string | null;
  address: string;
  lat: number;
  lon: number;
  area_m2: number | null;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  priority_rank: string | null;
  created_at: string;
  updated_at: string;
}

export interface GridInfo {
  id: string;
  site_id: string;
  target_voltage_kv: number | null;
  substation_distance_m: number | null;
  capacity_available_mw: number | null;
  connection_cost_jpy: number | null;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note: string | null;
}

export interface GeoRisk {
  id: string;
  site_id: string;
  elevation_m: number | null;
  slope_pct: number | null;
  flood_depth_class: string | null;
  liquefaction_risk: 'low' | 'medium' | 'high' | null;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note: string | null;
}

export interface Score {
  id: string;
  site_id: string;
  score_total: number;
  score_grid: number;
  score_geo: number;
  score_regulatory: number;
  score_access: number;
  score_economics: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  formula_version: string;
  calculated_at: string;
}

export interface SiteWithDetails extends Site {
  grid_info: GridInfo | null;
  geo_risk: GeoRisk | null;
  land_regulatory: any | null;
  access_physical: any | null;
  economics: any | null;
  scores: Score[];
  automation_sources: any[];
}

export interface SiteFilter {
  status?: string;
  priority_rank?: string;
  min_score?: number;
  max_score?: number;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export class SiteServiceV2 {
  private baseUrl = '/api/v2/sites';

  /**
   * サイト一覧取得
   */
  async getSites(
    filter: SiteFilter = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<SiteWithDetails>> {
    const params = new URLSearchParams();
    
    if (filter.status) params.append('status', filter.status);
    if (filter.priority_rank) params.append('priority_rank', filter.priority_rank);
    if (filter.min_score) params.append('min_score', filter.min_score.toString());
    if (filter.max_score) params.append('max_score', filter.max_score.toString());
    if (filter.search) params.append('search', filter.search);
    
    if (pagination.page) params.append('page', pagination.page.toString());
    if (pagination.limit) params.append('limit', pagination.limit.toString());
    if (pagination.sort_by) params.append('sort_by', pagination.sort_by);
    if (pagination.sort_order) params.append('sort_order', pagination.sort_order);

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data.data;
  }

  /**
   * サイト詳細取得
   */
  async getSiteById(id: string): Promise<SiteWithDetails> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  /**
   * サイト作成
   */
  async createSite(data: Partial<Site>): Promise<SiteWithDetails> {
    const response = await api.post(this.baseUrl, data);
    return response.data.data;
  }

  /**
   * サイト更新
   */
  async updateSite(id: string, data: Partial<Site>): Promise<SiteWithDetails> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  /**
   * サイト削除
   */
  async deleteSite(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * 自動化統計取得
   */
  async getAutomationStats(): Promise<{
    grid_info: Record<string, number>;
    geo_risk: Record<string, number>;
    total_sites: number;
  }> {
    const response = await api.get(`${this.baseUrl}/stats/automation`);
    return response.data.data;
  }
}

export const siteServiceV2 = new SiteServiceV2();
