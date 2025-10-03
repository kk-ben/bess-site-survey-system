import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, MapPin } from 'lucide-react';
import { ScreeningFilters } from '@/components/screening/ScreeningFilters';
import { ScreeningResults } from '@/components/screening/ScreeningResults';
import { ExportSettings } from '@/components/screening/ExportSettings';
import { ScreeningService } from '@/services/screening.service';
import { ScreeningCriteria } from '@/types/screening';
import toast from 'react-hot-toast';

export const ScreeningPage: React.FC = () => {
  const [criteria, setCriteria] = useState<ScreeningCriteria>({});
  const [selectedSiteId, setSelectedSiteId] = useState<string>();
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['screening', criteria],
    queryFn: () => ScreeningService.screenSites(criteria),
    enabled: false,
  });

  const handleApplyFilters = async (newCriteria: ScreeningCriteria) => {
    setCriteria(newCriteria);
    setHasSearched(true);
    try {
      await refetch();
      toast.success('スクリーニングが完了しました');
    } catch (error) {
      console.error('Screening failed:', error);
      toast.error('スクリーニングに失敗しました');
    }
  };

  const handleResetFilters = () => {
    setCriteria({});
    setHasSearched(false);
    setSelectedSiteId(undefined);
  };

  const results = data?.data?.results || [];
  const stats = data?.data?.stats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                候補地スクリーニング
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                評価済みの候補地を条件でフィルタリングし、結果をエクスポートします
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左サイドバー: フィルタとエクスポート */}
          <div className="space-y-6">
            <ScreeningFilters
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              isLoading={isLoading}
            />

            {hasSearched && (
              <ExportSettings
                criteria={criteria}
                resultCount={results.length}
                disabled={isLoading}
              />
            )}
          </div>

          {/* メインエリア: 結果と統計 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 統計情報 */}
            {hasSearched && stats && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    スクリーニング結果
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="総候補地数"
                    value={stats.totalSites}
                    color="text-gray-900"
                  />
                  <StatCard
                    label="一致件数"
                    value={stats.matchingSites}
                    color="text-primary-600"
                  />
                  <StatCard
                    label="平均スコア"
                    value={stats.averageScore.toFixed(1)}
                    color="text-success-600"
                  />
                  <StatCard
                    label="一致率"
                    value={`${((stats.matchingSites / stats.totalSites) * 100).toFixed(1)}%`}
                    color="text-warning-600"
                  />
                </div>

                {/* 推奨度内訳 */}
                {Object.keys(stats.recommendationBreakdown).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      推奨度内訳
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.recommendationBreakdown).map(
                        ([recommendation, count]) => (
                          <span
                            key={recommendation}
                            className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                          >
                            {getRecommendationLabel(recommendation)}: {count}件
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 結果リスト */}
            {hasSearched && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    候補地一覧 ({results.length}件)
                  </h3>
                </div>
                <ScreeningResults
                  results={results}
                  onSiteClick={setSelectedSiteId}
                  selectedSiteId={selectedSiteId}
                />
              </div>
            )}

            {/* 初期状態 */}
            {!hasSearched && (
              <div className="card text-center py-16">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  スクリーニングを開始
                </h3>
                <p className="text-gray-600 mb-6">
                  左側のフィルタ条件を設定して、候補地を検索してください
                </p>
              </div>
            )}

            {/* ローディング状態 */}
            {isLoading && (
              <div className="card text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">スクリーニング中...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  return (
    <div className="text-center">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
};

function getRecommendationLabel(recommendation: string): string {
  const labels: Record<string, string> = {
    excellent: '優秀',
    good: '良好',
    fair: '普通',
    poor: '不良',
    unsuitable: '不適',
  };
  return labels[recommendation] || recommendation;
}
