// ============================================================================
// BESS Site Survey System v2.0 - Sites List Page
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { siteServiceV2, SiteWithDetails, SiteFilter, PaginationParams } from '../../services/v2/site.service';
import { AutomationBadge } from '../../components/v2/AutomationBadge';
import { ScoreGrade } from '../../components/v2/ScoreGrade';

export const SitesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // フィルター状態
  const [filter, setFilter] = useState<SiteFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // ページネーション状態
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // データ取得
  useEffect(() => {
    fetchSites();
  }, [filter, pagination]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await siteServiceV2.getSites(filter, pagination);
      setSites(response.data);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みエラー');
    } finally {
      setLoading(false);
    }
  };

  // フィルター変更
  const handleFilterChange = (key: keyof SiteFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // ページをリセット
  };

  // 検索実行
  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  // ページ変更
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // ソート変更
  const handleSort = (sortBy: string) => {
    setPagination(prev => ({
      ...prev,
      sort_by: sortBy,
      sort_order: prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 最新スコア取得
  const getLatestScore = (site: SiteWithDetails) => {
    return site.scores && site.scores.length > 0 ? site.scores[0] : null;
  };

  if (loading && sites.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">サイト一覧 v2.0</h1>
          <p className="text-gray-600 mt-1">全{total}件のサイト</p>
        </div>
        <button
          onClick={() => navigate('/v2/sites/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新規サイト
        </button>
      </div>

      {/* フィルター・検索エリア */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 検索 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="サイト名、住所で検索..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                検索
              </button>
            </div>
          </div>

          {/* ステータスフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={filter.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全て</option>
              <option value="draft">下書き</option>
              <option value="under_review">審査中</option>
              <option value="approved">承認済み</option>
              <option value="rejected">却下</option>
              <option value="on_hold">保留</option>
            </select>
          </div>

          {/* 優先度フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              優先度
            </label>
            <select
              value={filter.priority_rank || ''}
              onChange={(e) => handleFilterChange('priority_rank', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全て</option>
              <option value="A">A（高）</option>
              <option value="B">B（中）</option>
              <option value="C">C（低）</option>
            </select>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* テーブル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('site_code')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  サイトコード
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  サイト名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  自動化レベル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スコア
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  系統容量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  優先度
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sites.map((site) => {
                const latestScore = getLatestScore(site);
                return (
                  <tr
                    key={site.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/v2/sites/${site.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {site.site_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {site.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {site.grid_info && (
                          <AutomationBadge level={site.grid_info.automation_level} size="sm" />
                        )}
                        {site.geo_risk && (
                          <AutomationBadge level={site.geo_risk.automation_level} size="sm" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {latestScore ? (
                        <ScoreGrade
                          grade={latestScore.grade}
                          score={latestScore.score_total}
                          size="sm"
                          showScore={true}
                        />
                      ) : (
                        <span className="text-sm text-gray-400">未計算</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {site.grid_info?.capacity_available_mw
                        ? `${site.grid_info.capacity_available_mw} MW`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        site.status === 'approved' ? 'bg-green-100 text-green-800' :
                        site.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                        site.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        site.status === 'on_hold' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {site.status === 'approved' ? '承認済み' :
                         site.status === 'under_review' ? '審査中' :
                         site.status === 'rejected' ? '却下' :
                         site.status === 'on_hold' ? '保留' :
                         '下書き'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      {site.priority_rank || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/v2/sites/${site.id}/edit`);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        編集
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/v2/sites/${site.id}`);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              {total}件中 {(pagination.page! - 1) * pagination.limit! + 1} - {Math.min(pagination.page! * pagination.limit!, total)}件を表示
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page! - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                前へ
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded-lg ${
                      pagination.page === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page! + 1)}
                disabled={pagination.page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
