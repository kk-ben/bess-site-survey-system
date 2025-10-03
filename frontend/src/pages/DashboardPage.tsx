import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, MapPin, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { SiteService } from '@/services/site.service';

interface DashboardStats {
  totalSites: number;
  evaluatedSites: number;
  approvedSites: number;
  pendingSites: number;
  averageScore: number;
}

export const DashboardPage: React.FC = () => {
  const { data: sitesData, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => SiteService.getSites({}),
  });

  const sites = sitesData?.data?.sites || [];

  // 統計情報を計算
  const stats: DashboardStats = {
    totalSites: sites.length,
    evaluatedSites: sites.filter((s) => s.status === 'evaluated' || s.status === 'approved').length,
    approvedSites: sites.filter((s) => s.status === 'approved').length,
    pendingSites: sites.filter((s) => s.status === 'pending').length,
    averageScore: 0, // 評価スコアの平均（実装時に計算）
  };

  const statCards = [
    {
      title: '総候補地数',
      value: stats.totalSites,
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '評価済み',
      value: stats.evaluatedSites,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '承認済み',
      value: stats.approvedSites,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '未評価',
      value: stats.pendingSites,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  // ステータス別の分布
  const statusDistribution = [
    { status: '未評価', count: stats.pendingSites, color: 'bg-gray-400' },
    { status: '評価済み', count: stats.evaluatedSites - stats.approvedSites, color: 'bg-blue-400' },
    { status: '承認済み', count: stats.approvedSites, color: 'bg-green-400' },
  ];

  const maxCount = Math.max(...statusDistribution.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-1">BESS用地調査システムの概要</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">読み込み中...</p>
        </div>
      ) : (
        <>
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} ${card.textColor} p-3 rounded-lg`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ステータス分布 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">ステータス分布</h2>
            </div>

            <div className="space-y-4">
              {statusDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    <span className="text-sm text-gray-600">{item.count}件</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最近の候補地 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">最近追加された候補地</h2>
            {sites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                候補地が登録されていません
              </div>
            ) : (
              <div className="space-y-3">
                {sites.slice(0, 5).map((site) => (
                  <div
                    key={site.siteId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{site.siteName}</p>
                        <p className="text-sm text-gray-600">{site.address}</p>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        site.status === 'approved'
                          ? 'badge-excellent'
                          : site.status === 'evaluated'
                          ? 'badge-good'
                          : site.status === 'rejected'
                          ? 'badge-poor'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getStatusLabel(site.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* クイックアクション */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => (window.location.href = '/sites')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
              >
                <MapPin className="w-6 h-6 text-primary-600 mb-2" />
                <p className="font-medium text-gray-900">候補地管理</p>
                <p className="text-sm text-gray-600 mt-1">候補地の登録・編集</p>
              </button>

              <button
                onClick={() => (window.location.href = '/screening')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
              >
                <BarChart3 className="w-6 h-6 text-primary-600 mb-2" />
                <p className="font-medium text-gray-900">スクリーニング</p>
                <p className="text-sm text-gray-600 mt-1">条件による絞り込み</p>
              </button>

              <button
                onClick={() => (window.location.href = '/users')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
              >
                <CheckCircle className="w-6 h-6 text-primary-600 mb-2" />
                <p className="font-medium text-gray-900">ユーザー管理</p>
                <p className="text-sm text-gray-600 mt-1">ユーザーの管理</p>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '未評価',
    evaluated: '評価済み',
    approved: '承認済み',
    rejected: '却下',
  };
  return labels[status] || status;
}
