// ============================================================================
// BESS Site Survey System v2.0 - Cached Site Service
// ============================================================================

import { SiteServiceV2 } from './site.service';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '../cache.service';
import {
  ISiteWithDetails,
  ICreateSiteDTO,
  IUpdateSiteDTO,
  ISiteFilter,
  IPaginationParams,
  IPaginatedResponse
} from '../../interfaces/v2/site.interface';
import { logger } from '../../utils/logger';

export class CachedSiteServiceV2 extends SiteServiceV2 {
  /**
   * サイト詳細取得（キャッシュ対応）
   */
  override async getSiteById(id: string): Promise<ISiteWithDetails | null> {
    // キャッシュから取得を試みる
    const cacheKey = CACHE_KEYS.SITE_DETAILS(id);
    const cached = await cacheService.get<ISiteWithDetails>(cacheKey);
    
    if (cached) {
      logger.debug(`Cache hit for site: ${id}`);
      return cached;
    }

    // キャッシュミスの場合はDBから取得
    logger.debug(`Cache miss for site: ${id}`);
    const site = await super.getSiteById(id);
    
    if (site) {
      // キャッシュに保存（5分間）
      await cacheService.set(cacheKey, site, CACHE_TTL.MEDIUM);
    }
    
    return site;
  }

  /**
   * サイト一覧取得（キャッシュ対応）
   */
  override async getSites(
    filter: ISiteFilter = {},
    pagination: IPaginationParams = {}
  ): Promise<IPaginatedResponse<ISiteWithDetails>> {
    // フィルターとページネーションをキャッシュキーに含める
    const filterKey = JSON.stringify({ filter, pagination });
    const cacheKey = CACHE_KEYS.SITES_LIST(filterKey);
    
    // キャッシュから取得を試みる
    const cached = await cacheService.get<IPaginatedResponse<ISiteWithDetails>>(cacheKey);
    
    if (cached) {
      logger.debug('Cache hit for sites list');
      return cached;
    }

    // キャッシュミスの場合はDBから取得
    logger.debug('Cache miss for sites list');
    const result = await super.getSites(filter, pagination);
    
    // キャッシュに保存（1分間 - リスト系は短めに）
    await cacheService.set(cacheKey, result, CACHE_TTL.SHORT);
    
    return result;
  }

  /**
   * サイト作成（キャッシュ無効化）
   */
  override async createSite(data: ICreateSiteDTO, userId: string): Promise<ISiteWithDetails> {
    const site = await super.createSite(data, userId);
    
    // リストキャッシュを無効化
    await this.invalidateListCache();
    
    return site;
  }

  /**
   * サイト更新（キャッシュ無効化）
   */
  override async updateSite(
    id: string,
    data: IUpdateSiteDTO,
    userId: string
  ): Promise<ISiteWithDetails> {
    const site = await super.updateSite(id, data, userId);
    
    // 該当サイトのキャッシュを無効化
    await this.invalidateSiteCache(id);
    
    // リストキャッシュも無効化
    await this.invalidateListCache();
    
    return site;
  }

  /**
   * サイト削除（キャッシュ無効化）
   */
  override async deleteSite(id: string, userId: string): Promise<void> {
    await super.deleteSite(id, userId);
    
    // 該当サイトのキャッシュを無効化
    await this.invalidateSiteCache(id);
    
    // リストキャッシュも無効化
    await this.invalidateListCache();
  }

  /**
   * 特定サイトのキャッシュを無効化
   */
  private async invalidateSiteCache(siteId: string): Promise<void> {
    const keys = [
      CACHE_KEYS.SITE(siteId),
      CACHE_KEYS.SITE_DETAILS(siteId),
      CACHE_KEYS.SCORES(siteId)
    ];
    
    for (const key of keys) {
      await cacheService.delete(key);
    }
    
    logger.debug(`Invalidated cache for site: ${siteId}`);
  }

  /**
   * リストキャッシュを無効化
   */
  private async invalidateListCache(): Promise<void> {
    // sites:list:* パターンのキャッシュを全て削除
    const deleted = await cacheService.deletePattern('sites:list:*');
    logger.debug(`Invalidated ${deleted} list cache entries`);
  }

  /**
   * 自動化統計のキャッシュ取得
   */
  async getAutomationStatsWithCache(): Promise<any> {
    const cacheKey = CACHE_KEYS.AUTOMATION_STATS;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      logger.debug('Cache hit for automation stats');
      return cached;
    }

    logger.debug('Cache miss for automation stats');
    const stats = await super.getAutomationStats();
    
    // 統計情報は30分キャッシュ
    await cacheService.set(cacheKey, stats, CACHE_TTL.LONG);
    
    return stats;
  }
}

// エクスポート
export const cachedSiteService = new CachedSiteServiceV2();
