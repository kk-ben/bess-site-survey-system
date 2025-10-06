// ============================================================================
// BESS Site Survey System v2.0 - Site Detail Model
// 正規化スキーマに対応した詳細サイトモデル
// ============================================================================

export interface SiteV2 {
  id: string;
  site_code: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  area_m2: number;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  priority_rank: 'S' | 'A' | 'B' | 'C' | 'D';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface GridInfoV2 {
  id: string;
  site_id: string;
  target_voltage_kv: number;
  substation_distance_m: number;
  capacity_available_mw: number;
  connection_cost_jpy: number;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface GeoRiskV2 {
  id: string;
  site_id: string;
  elevation_m: number;
  slope_pct: number;
  flood_depth_class: string;
  liquefaction_risk: 'low' | 'medium' | 'high';
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface LandRegulatoryV2 {
  id: string;
  site_id: string;
  city_plan_zone: string;
  farmland_class: string;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessPhysicalV2 {
  id: string;
  site_id: string;
  parcel_shape: string;
  road_access: string;
  nearest_road_width_m: number;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface EconomicsV2 {
  id: string;
  site_id: string;
  land_price_jpy_per_m2: number;
  planned_power_mw: number;
  planned_energy_mwh: number;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreV2 {
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
  created_at: string;
}

export interface AutomationSourceV2 {
  id: string;
  site_id: string;
  table_name: string;
  field_name: string;
  source_type: 'API' | 'SCRAPING' | 'MANUAL';
  source_name: string;
  source_url?: string;
  last_updated: string;
  created_at: string;
}

export interface AuditLogV2 {
  id: string;
  site_id: string;
  actor: string;
  table_name: string;
  field_name: string;
  old_value?: string;
  new_value: string;
  created_at: string;
}

// 複合型：サイト詳細（全関連データ含む）
export interface SiteDetailV2 {
  site: SiteV2;
  grid_info?: GridInfoV2;
  geo_risk?: GeoRiskV2;
  land_regulatory?: LandRegulatoryV2;
  access_physical?: AccessPhysicalV2;
  economics?: EconomicsV2;
  scores: ScoreV2[];
  automation_sources: AutomationSourceV2[];
  audit_logs: AuditLogV2[];
}

// API レスポンス型
export interface SiteListResponseV2 {
  sites: Array<SiteV2 & {
    latest_score?: ScoreV2;
    grid_info?: Pick<GridInfoV2, 'target_voltage_kv' | 'capacity_available_mw'>;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface SiteDetailResponseV2 {
  data: SiteDetailV2;
  success: boolean;
  message?: string;
}

// API リクエスト型
export interface CreateSiteRequestV2 {
  site_code: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  area_m2: number;
  priority_rank: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface UpdateSiteRequestV2 extends Partial<CreateSiteRequestV2> {
  status?: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
}

// フィルター型
export interface SiteFilterV2 {
  status?: string[];
  priority_rank?: string[];
  min_score?: number;
  max_score?: number;
  min_capacity_mw?: number;
  max_capacity_mw?: number;
  automation_level?: string[];
  search?: string;
}
