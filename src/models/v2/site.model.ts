// ============================================================================
// BESS Site Survey System v2.0 - Site Models
// ============================================================================

import { supabase } from '../../config/database';
import {
  ISite,
  IGridInfo,
  IGeoRisk,
  ILandRegulatory,
  IAccessPhysical,
  IEconomics,
  IAutomationSource,
  IScore,
  IAuditLog,
  ICreateSiteDTO,
  IUpdateSiteDTO,
  ISiteWithDetails,
  ISiteFilter,
  IPaginationParams,
  IPaginatedResponse
} from '../../interfaces/v2/site.interface';

// ============================================================================
// Site Model
// ============================================================================

export class SiteModel {
  /**
   * サイトコードを自動生成
   */
  static async generateSiteCode(): Promise<string> {
    const { data, error } = await supabase
      .from('sites')
      .select('site_code')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    const year = new Date().getFullYear();
    const lastCode = data && data.length > 0 ? data[0].site_code : null;
    
    if (lastCode && lastCode.startsWith(`STB${year}-`)) {
      const lastNumber = parseInt(lastCode.split('-')[1]);
      const nextNumber = (lastNumber + 1).toString().padStart(6, '0');
      return `STB${year}-${nextNumber}`;
    }
    
    return `STB${year}-000001`;
  }

  /**
   * サイト作成
   */
  static async create(data: ICreateSiteDTO): Promise<ISite> {
    const siteCode = data.site_code || await this.generateSiteCode();
    
    const { data: site, error } = await supabase
      .from('sites')
      .insert({
        site_code: siteCode,
        name: data.name,
        address: data.address,
        lat: data.lat,
        lon: data.lon,
        area_m2: data.area_m2,
        land_right_status: data.land_right_status,
        status: data.status || 'draft',
        priority_rank: data.priority_rank
      })
      .select()
      .single();

    if (error) throw error;
    return site;
  }

  /**
   * サイト取得（詳細情報含む）
   */
  static async findByIdWithDetails(id: string): Promise<ISiteWithDetails | null> {
    const { data: site, error } = await supabase
      .from('sites')
      .select(`
        *,
        grid_info (*),
        geo_risk (*),
        land_regulatory (*),
        access_physical (*),
        economics (*),
        scores (*),
        automation_sources (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return site;
  }

  /**
   * サイト一覧取得（フィルタ・ページネーション対応）
   */
  static async findAll(
    filter: ISiteFilter = {},
    pagination: IPaginationParams = {}
  ): Promise<IPaginatedResponse<ISiteWithDetails>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('sites')
      .select(`
        *,
        grid_info (*),
        geo_risk (*),
        land_regulatory (*),
        access_physical (*),
        economics (*),
        scores (*)
      `, { count: 'exact' });

    // フィルタ適用
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.priority_rank) {
      query = query.eq('priority_rank', filter.priority_rank);
    }

    // ソート
    const sortBy = pagination.sort_by || 'created_at';
    const sortOrder = pagination.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // ページネーション
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * サイト更新
   */
  static async update(id: string, data: IUpdateSiteDTO): Promise<ISite> {
    const { data: site, error } = await supabase
      .from('sites')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return site;
  }

  /**
   * サイト削除
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// ============================================================================
// Grid Info Model
// ============================================================================

export class GridInfoModel {
  static async create(data: Partial<IGridInfo>): Promise<IGridInfo> {
    const { data: gridInfo, error } = await supabase
      .from('grid_info')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return gridInfo;
  }

  static async findBySiteId(siteId: string): Promise<IGridInfo | null> {
    const { data, error } = await supabase
      .from('grid_info')
      .select('*')
      .eq('site_id', siteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  static async update(id: string, data: Partial<IGridInfo>): Promise<IGridInfo> {
    const { data: gridInfo, error } = await supabase
      .from('grid_info')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return gridInfo;
  }
}

// ============================================================================
// Geo Risk Model
// ============================================================================

export class GeoRiskModel {
  static async create(data: Partial<IGeoRisk>): Promise<IGeoRisk> {
    const { data: geoRisk, error } = await supabase
      .from('geo_risk')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return geoRisk;
  }

  static async findBySiteId(siteId: string): Promise<IGeoRisk | null> {
    const { data, error } = await supabase
      .from('geo_risk')
      .select('*')
      .eq('site_id', siteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  static async update(id: string, data: Partial<IGeoRisk>): Promise<IGeoRisk> {
    const { data: geoRisk, error } = await supabase
      .from('geo_risk')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return geoRisk;
  }
}

// ============================================================================
// Automation Source Model
// ============================================================================

export class AutomationSourceModel {
  static async create(data: Partial<IAutomationSource>): Promise<IAutomationSource> {
    const { data: source, error } = await supabase
      .from('automation_sources')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return source;
  }

  static async findBySiteId(siteId: string): Promise<IAutomationSource[]> {
    const { data, error } = await supabase
      .from('automation_sources')
      .select('*')
      .eq('site_id', siteId);

    if (error) throw error;
    return data || [];
  }

  static async findByTableAndField(
    siteId: string,
    tableName: string,
    fieldName: string
  ): Promise<IAutomationSource | null> {
    const { data, error } = await supabase
      .from('automation_sources')
      .select('*')
      .eq('site_id', siteId)
      .eq('table_name', tableName)
      .eq('field_name', fieldName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }
}

// ============================================================================
// Score Model
// ============================================================================

export class ScoreModel {
  static async create(data: Partial<IScore>): Promise<IScore> {
    const { data: score, error } = await supabase
      .from('scores')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return score;
  }

  static async findBySiteId(siteId: string): Promise<IScore[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('site_id', siteId)
      .order('calculated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async findLatestBySiteId(siteId: string): Promise<IScore | null> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('site_id', siteId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }
}

// ============================================================================
// Audit Log Model
// ============================================================================

export class AuditLogModel {
  static async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
    const { data: log, error } = await supabase
      .from('audit_log')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return log;
  }

  static async findBySiteId(siteId: string, limit: number = 50): Promise<IAuditLog[]> {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('site_id', siteId)
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
