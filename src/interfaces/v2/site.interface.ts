// ============================================================================
// BESS Site Survey System v2.0 - Site Interfaces
// ============================================================================

export interface ISite {
  id: string;
  site_code: string;
  name?: string;
  address: string;
  lat: number;
  lon: number;
  area_m2?: number;
  land_right_status?: string;
  status: 'draft' | 'under_review' | 'approved' | 'rejected';
  priority_rank?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IGridInfo {
  id: string;
  site_id: string;
  target_voltage_kv?: number;
  substation_distance_m?: number;
  line_distance_m?: number;
  capacity_available_mw?: number;
  congestion_level?: 'low' | 'medium' | 'high';
  connection_cost_jpy?: number;
  reinforcement_plan?: string;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at?: Date;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IGeoRisk {
  id: string;
  site_id: string;
  elevation_m?: number;
  slope_pct?: number;
  flood_depth_class?: string;
  liquefaction_risk?: 'low' | 'medium' | 'high';
  sun_hours_loss?: number;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at?: Date;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ILandRegulatory {
  id: string;
  site_id: string;
  city_plan_zone?: string;
  land_use_zone?: string;
  farmland_class?: string;
  cultural_env_zone?: string;
  park_landscape_zone?: string;
  local_ordinances?: string;
  build_restrictions?: string;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at?: Date;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IAccessPhysical {
  id: string;
  site_id: string;
  parcel_shape?: string;
  road_access?: string;
  nearest_road_width_m?: number;
  inside_setback_need?: string;
  neighbor_clearance_e?: number;
  neighbor_clearance_w?: number;
  neighbor_clearance_n?: number;
  neighbor_clearance_s?: number;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at?: Date;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IEconomics {
  id: string;
  site_id: string;
  land_price_jpy_per_m2?: number;
  land_rent_jpy_per_tsubo_month?: number;
  connection_cost_estimate_jpy?: number;
  construction_cost_estimate_jpy?: number;
  planned_power_mw?: number;
  planned_energy_mwh?: number;
  expected_capacity_factor_pct?: number;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at?: Date;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IAutomationSource {
  id: string;
  site_id: string;
  table_name: string;
  field_name: string;
  source_type?: 'API' | 'PDF' | 'CSV' | 'Manual' | 'Scraper';
  source_name?: string;
  source_url?: string;
  last_refreshed_at?: Date;
  refresh_interval_hours?: number;
  parser_version?: string;
  note?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IScore {
  id: string;
  site_id: string;
  score_total?: number;
  score_grid?: number;
  score_geo?: number;
  score_regulatory?: number;
  score_access?: number;
  score_economics?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  formula_version?: string;
  calculated_at: Date;
  created_at: Date;
}

export interface IAuditLog {
  id: string;
  site_id?: string;
  actor: string;
  table_name?: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  changed_at: Date;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface ICreateSiteDTO {
  site_code?: string; // 自動生成される場合はオプション
  name?: string;
  address: string;
  lat: number;
  lon: number;
  area_m2?: number;
  land_right_status?: string;
  status?: 'draft' | 'under_review' | 'approved' | 'rejected';
  priority_rank?: string;
}

export interface IUpdateSiteDTO {
  name?: string;
  address?: string;
  lat?: number;
  lon?: number;
  area_m2?: number;
  land_right_status?: string;
  status?: 'draft' | 'under_review' | 'approved' | 'rejected';
  priority_rank?: string;
}

export interface ISiteWithDetails extends ISite {
  grid_info?: IGridInfo;
  geo_risk?: IGeoRisk;
  land_regulatory?: ILandRegulatory;
  access_physical?: IAccessPhysical;
  economics?: IEconomics;
  scores?: IScore[];
  automation_sources?: IAutomationSource[];
}

// ============================================================================
// Query Filters
// ============================================================================

export interface ISiteFilter {
  status?: 'draft' | 'under_review' | 'approved' | 'rejected';
  priority_rank?: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  min_score?: number;
  max_score?: number;
  has_pending_review?: boolean; // SEMI automation_level があるか
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
