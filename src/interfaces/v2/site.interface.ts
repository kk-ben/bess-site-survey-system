// ============================================================================
// BESS Site Survey System v2.0 - Site Interfaces
// ============================================================================

// ============================================================================
// Base Entities
// ============================================================================

export interface ISite {
  id: string;
  site_code: string;
  name: string | null;
  address: string;
  lat: number;
  lon: number;
  area_m2: number | null;
  land_right_status: string | null;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  priority_rank: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface IGridInfo {
  id: string;
  site_id: string;
  target_voltage_kv: number | null;
  substation_distance_m: number | null;
  line_distance_m: number | null;
  capacity_available_mw: number | null;
  congestion_level: 'low' | 'medium' | 'high' | null;
  connection_cost_jpy: number | null;
  reinforcement_plan: string | null;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface IGeoRisk {
  id: string;
  site_id: string;
  elevation_m: number | null;
  slope_pct: number | null;
  flood_depth_class: string | null;
  flood_probability: string | null;
  landslide_risk: 'low' | 'medium' | 'high' | null;
  liquefaction_risk: 'low' | 'medium' | 'high' | null;
  active_fault_distance_m: number | null;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ILandRegulatory {
  id: string;
  site_id: string;
  city_plan_zone: string | null;
  use_district: string | null;
  farmland_class: string | null;
  forest_law_area: string | null;
  natural_park_area: string | null;
  cultural_property_area: boolean | null;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface IAccessPhysical {
  id: string;
  site_id: string;
  parcel_shape: string | null;
  road_access: string | null;
  nearest_road_width_m: number | null;
  nearest_road_type: string | null;
  utility_pole_nearby: boolean | null;
  water_supply_nearby: boolean | null;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface IEconomics {
  id: string;
  site_id: string;
  land_price_jpy_per_m2: number | null;
  acquisition_cost_jpy: number | null;
  planned_power_mw: number | null;
  planned_energy_mwh: number | null;
  estimated_annual_revenue_jpy: number | null;
  estimated_construction_cost_jpy: number | null;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  updated_from_source_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface IScore {
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
  created_at: string;
}

export interface IAutomationSource {
  id: string;
  site_id: string;
  table_name: string;
  field_name: string;
  source_type: 'API' | 'SCRAPING' | 'MANUAL';
  source_name: string;
  source_url: string | null;
  last_updated: string;
  created_at: string;
}

export interface IAuditLog {
  id: string;
  site_id: string;
  actor: string;
  table_name: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  changed_at: string;
  created_at: string;
}

// ============================================================================
// Composite Types
// ============================================================================

export interface ISiteWithDetails extends ISite {
  grid_info: IGridInfo | null;
  geo_risk: IGeoRisk | null;
  land_regulatory: ILandRegulatory | null;
  access_physical: IAccessPhysical | null;
  economics: IEconomics | null;
  scores: IScore[];
  automation_sources: IAutomationSource[];
}

export interface ISiteListItem extends ISite {
  latest_score: IScore | null;
  grid_capacity_mw: number | null;
  grid_voltage_kv: number | null;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface ICreateSiteDTO {
  site_code?: string;
  name?: string;
  address: string;
  lat: number;
  lon: number;
  area_m2?: number;
  land_right_status?: string;
  status?: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  priority_rank?: string;
  created_by?: string;
}

export interface IUpdateSiteDTO {
  name?: string;
  address?: string;
  lat?: number;
  lon?: number;
  area_m2?: number;
  land_right_status?: string;
  status?: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  priority_rank?: string;
  updated_by?: string;
}

export interface ICreateGridInfoDTO {
  site_id: string;
  target_voltage_kv?: number;
  substation_distance_m?: number;
  line_distance_m?: number;
  capacity_available_mw?: number;
  congestion_level?: 'low' | 'medium' | 'high';
  connection_cost_jpy?: number;
  reinforcement_plan?: string;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note?: string;
}

export interface ICreateGeoRiskDTO {
  site_id: string;
  elevation_m?: number;
  slope_pct?: number;
  flood_depth_class?: string;
  flood_probability?: string;
  landslide_risk?: 'low' | 'medium' | 'high';
  liquefaction_risk?: 'low' | 'medium' | 'high';
  active_fault_distance_m?: number;
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note?: string;
}

export interface ICreateScoreDTO {
  site_id: string;
  score_total: number;
  score_grid: number;
  score_geo: number;
  score_regulatory: number;
  score_access: number;
  score_economics: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  formula_version: string;
}

export interface ICreateAutomationSourceDTO {
  site_id: string;
  table_name: string;
  field_name: string;
  source_type: 'API' | 'SCRAPING' | 'MANUAL';
  source_name: string;
  source_url?: string;
}

export interface ICreateAuditLogDTO {
  site_id: string;
  actor: string;
  table_name: string;
  field_name: string;
  old_value?: string;
  new_value: string;
}

// ============================================================================
// Filter and Pagination
// ============================================================================

export interface ISiteFilter {
  status?: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  priority_rank?: string;
  min_score?: number;
  max_score?: number;
  min_capacity_mw?: number;
  max_capacity_mw?: number;
  automation_level?: 'AUTO' | 'SEMI' | 'MANUAL';
  search?: string;
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

// ============================================================================
// API Response Types
// ============================================================================

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface IApiError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================================
// Score Calculation Types
// ============================================================================

export interface IScoreComponents {
  grid: number;
  geo: number;
  regulatory: number;
  access: number;
  economics: number;
}

export interface IScoreWeights {
  grid: number;
  geo: number;
  regulatory: number;
  access: number;
  economics: number;
}

// ============================================================================
// Automation Types
// ============================================================================

export interface IElevationResult {
  elevation: number;
  location: {
    lat: number;
    lng: number;
  };
  resolution: number;
}

export interface IHazardMapResult {
  flood_depth_class: string;
  flood_probability: string;
  landslide_risk: 'low' | 'medium' | 'high';
  liquefaction_risk: 'low' | 'medium' | 'high';
}

export interface IAutomationRequest {
  site_id: string;
  lat: number;
  lon: number;
  automation_type: 'elevation' | 'hazard' | 'all';
}

export interface IAutomationResult {
  success: boolean;
  automation_type: string;
  data?: any;
  error?: string;
  updated_fields: string[];
}
