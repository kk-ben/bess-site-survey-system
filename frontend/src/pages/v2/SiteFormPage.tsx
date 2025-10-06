// ============================================================================
// BESS Site Survey System v2.0 - Site Form Page (Create/Edit)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { siteServiceV2, SiteWithDetails } from '../../services/v2/site.service';

interface FormData {
  site_code?: string;
  name?: string;
  address: string;
  lat: number;
  lon: number;
  area_m2?: number;
  land_right_status?: string;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  priority_rank?: string;
}

export const SiteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    address: '',
    lat: 35.6812,
    lon: 139.7671,
    status: 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      fetchSite();
    }
  }, [id]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const site = await siteServiceV2.getSiteById(id!);
      setFormData({
        site_code: site.site_code,
        name: site.name || undefined,
        address: site.address,
        lat: site.lat,
        lon: site.lon,
        area_m2: site.area_m2 || undefined,
        land_right_status: site.land_right_status || undefined,
        status: site.status,
        priority_rank: site.priority_rank || undefined
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みエラー');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = '住所は必須です';
    }

    if (formData.lat < -90 || formData.lat > 90) {
      newErrors.lat = '緯度は-90から90の範囲で入力してください';
    }

    if (formData.lon < -180 || formData.lon > 180) {
      newErrors.lon = '経度は-180から180の範囲で入力してください';
    }

    if (formData.area_m2 && formData.area_m2 <= 0) {
      newErrors.area_m2 = '面積は正の数値を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEdit) {
        await siteServiceV2.updateSite(id!, formData);
        alert('サイトを更新しました');
      } else {
        const newSite = await siteServiceV2.createSite(formData);
        alert('サイトを作成しました');
        navigate(`/v2/sites/${newSite.id}`);
        return;
      }

      navigate(`/v2/sites/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存エラー');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => navigate(isEdit ? `/v2/sites/${id}` : '/v2/sites')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← {isEdit ? '詳細に戻る' : '一覧に戻る'}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'サイト編集' : '新規サイト作成'}
        </h1>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* サイトコード */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  サイトコード
                </label>
                <input
                  type="text"
                  value={formData.site_code || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            )}

            {/* サイト名 */}
            <div className={isEdit ? '' : 'md:col-span-2'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                サイト名
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="例: 茨城県つくば市 工業団地跡地"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 住所 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="例: 茨城県つくば市東光台5-19"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* 緯度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                緯度 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.lat}
                onChange={(e) => handleChange('lat', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.lat ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lat && (
                <p className="mt-1 text-sm text-red-600">{errors.lat}</p>
              )}
            </div>

            {/* 経度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                経度 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.lon}
                onChange={(e) => handleChange('lon', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.lon ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lon && (
                <p className="mt-1 text-sm text-red-600">{errors.lon}</p>
              )}
            </div>

            {/* 面積 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                面積 (m²)
              </label>
              <input
                type="number"
                value={formData.area_m2 || ''}
                onChange={(e) => handleChange('area_m2', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="50000"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.area_m2 ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.area_m2 && (
                <p className="mt-1 text-sm text-red-600">{errors.area_m2}</p>
              )}
            </div>

            {/* 土地権利状況 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                土地権利状況
              </label>
              <input
                type="text"
                value={formData.land_right_status || ''}
                onChange={(e) => handleChange('land_right_status', e.target.value)}
                placeholder="例: 所有権"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">下書き</option>
                <option value="under_review">審査中</option>
                <option value="approved">承認済み</option>
                <option value="rejected">却下</option>
                <option value="on_hold">保留</option>
              </select>
            </div>

            {/* 優先度 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                優先度
              </label>
              <select
                value={formData.priority_rank || ''}
                onChange={(e) => handleChange('priority_rank', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">未設定</option>
                <option value="A">A（高）</option>
                <option value="B">B（中）</option>
                <option value="C">C（低）</option>
              </select>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/v2/sites/${id}` : '/v2/sites')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '保存中...' : isEdit ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
};
