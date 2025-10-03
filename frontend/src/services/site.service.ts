import { apiClient } from '@/lib/api';
import { Site, CreateSiteData, UpdateSiteData } from '@/types/site';

export class SiteService {
  static async getSites(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: { sites: Site[]; total: number } }> {
    return apiClient.get('/sites', params);
  }

  static async getSiteById(siteId: string): Promise<{ success: boolean; data: { site: Site } }> {
    return apiClient.get(`/sites/${siteId}`);
  }

  static async createSite(data: CreateSiteData): Promise<{ success: boolean; data: { site: Site } }> {
    return apiClient.post('/sites', data);
  }

  static async updateSite(
    siteId: string,
    data: UpdateSiteData
  ): Promise<{ success: boolean; data: { site: Site } }> {
    return apiClient.put(`/sites/${siteId}`, data);
  }

  static async deleteSite(siteId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`/sites/${siteId}`);
  }

  static async evaluateSite(siteId: string): Promise<{ success: boolean; data: any }> {
    return apiClient.post(`/evaluations/evaluate`, { siteIds: [siteId] });
  }

  static async uploadCsv(file: File): Promise<{ success: boolean; data: { imported: number; errors: string[] } }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/sites/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}
