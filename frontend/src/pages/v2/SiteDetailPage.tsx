// ============================================================================
// BESS Site Survey System v2.0 - Site Detail Page
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { siteServiceV2, SiteWithDetails } from '../../services/v2/site.service';
import { automationServiceV2 } from '../../services/v2/automation.service';
import { Tabs, TabPanel, Tab } from '../../components/v2/Tabs';
import { AutomationBadge } from '../../components/v2/AutomationBadge';
import { ScoreGrade, ScoreCard } from '../../components/v2/ScoreGrade';

export const SiteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [site, setSite] = useState<SiteWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // 自動化実行状態
  const [elevationLoading, setElevationLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSiteDetail();
    }
  }, [id]);

  const fetchSiteDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await siteServiceV2.getSiteById(id!);
      setSite(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みエラー');
    } finally {
      setLoading(false);
    }
  };

  // 標高取得
  const handleUpdateElevation = async () => {
    try {
      setElevationLoading(true);
      await automationServiceV2.updateElevation(id!);
      await fetchSiteDetail(); // データ再取得
      alert('標高データを更新しました');
    } catch (err) {
      alert('標高取得に失敗しました: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setElevationLoading(false);
    }
  };

  // スコア再計算
  const handleCalculateScore = async () => {
    try {
      setScoreLoading(true);
      await automationServiceV2.calculateScore(id!);
      await fetchSiteDetail(); // データ再取得
      alert('スコアを再計算しました');
    } catch (err) {
      alert('スコア計算に失敗しました: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setScoreLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'サイトが見つかりません'}
        </div>
      </div>
    );
  }

  const latestScore = site.scores && site.scores.length > 0 ? site.scores[0] : null;

  const tabs: Tab[] = [
    { id: 'basic', label: '基本情報' },
    { id: 'grid', label: '系統情報', badge: site.grid_info ? '✓' : undefined },
    { id: 'geo', label: '地理リスク', badge: site.geo_risk ? '✓' : undefined },
    { id: 'regulatory', label: '法規制', badge: site.land_regulatory ? '✓' : undefined },
    { id: 'access', label: '物理条件', badge: site.access_physical ? '✓' : undefined },
    { id: 'economics', label: '経済性', badge: site.economics ? '✓' : undefined },
    { id: 'scores', label: 'スコア履歴', badge: site.scores?.length || 0 },
    { id: 'automation', label: '自動化' }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/v2/sites')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← 一覧に戻る
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{site.name || site.site_code}</h1>
            <p className="text-gray-600 mt-1">{site.site_code}</p>
            <p className="text-sm text-gray-500 mt-1">{site.address}</p>
          </div>
          
          <div className="flex gap-3">
            {latestScore && (
              <ScoreGrade grade={latestScore.grade} score={latestScore.score_total} size="lg" />
            )}
            <button
              onClick={() => navigate(`/v2/sites/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              編集
            </button>
          </div>
        </div>
      </div>

      {/* タブ */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
        {/* 基本情報タブ */}
        <TabPanel id="basic" activeTab={activeTab}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">サイトコード</dt>
                <dd className="mt-1 text-sm text-gray-900">{site.site_code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">サイト名</dt>
                <dd className="mt-1 text-sm text-gray-900">{site.name || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">住所</dt>
                <dd className="mt-1 text-sm text-gray-900">{site.address}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">座標</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {site.lat.toFixed(6)}, {site.lon.toFixed(6)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">面積</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {site.area_m2 ? `${site.area_m2.toLocaleString()} m²` : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="mt-1 text-sm text-gray-900">{site.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">優先度</dt>
                <dd className="mt-1 text-sm text-gray-900">{site.priority_rank || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">作成日時</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(site.created_at).toLocaleString('ja-JP')}
                </dd>
              </div>
            </dl>
          </div>
        </TabPanel>

        {/* 系統情報タブ */}
        <TabPanel id="grid" activeTab={activeTab}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">系統情報</h2>
              {site.grid_info && (
                <AutomationBadge level={site.grid_info.automation_level} />
              )}
            </div>
            {site.grid_info ? (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">目標電圧</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {site.grid_info.target_voltage_kv ? `${site.grid_info.target_voltage_kv} kV` : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">変電所距離</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {site.grid_info.substation_distance_m ? `${site.grid_info.substation_distance_m} m` : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">利用可能容量</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {site.grid_info.capacity_available_mw ? `${site.grid_info.capacity_available_mw} MW` : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">接続コスト</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {site.grid_info.connection_cost_jpy 
                      ? `¥${site.grid_info.connection_cost_jpy.toLocaleString()}` 
                      : '-'}
                  </dd>
                </div>
                {site.grid_info.note && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">備考</dt>
                    <dd className="mt-1 text-sm text-gray-900">{site.grid_info.note}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-gray-500">データがありません</p>
            )}
          </div>
        </TabPanel>

        {/* 地理リスクタブ */}
        <TabPanel id="geo" activeTab={activeTab}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">地理リスク</h2>
              <div className="flex gap-2">
                {site.geo_risk && (
                  <AutomationBadge level={site.geo_risk.automation_level} />
                )}
                <button
                  onClick={handleUpdateElevation}
                  disabled={elevationLoading}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {elevationLoading ? '取得中...' : '標高取得'}
                </button>
              </div>
            </div>
            {site.geo_risk ? (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">標高</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {site.geo_risk.elevation_m !== null ? `${site.geo_risk.elevation_m.toFixed(1)} m` : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">傾斜</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {site.geo_risk.slope_pct !== null ? `${site.geo_risk.slope_pct.toFixed(1)} %` : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">浸水深</dt>
                  <dd className="mt-1 text-sm text-gray-900">{site.geo_risk.flood_depth_class || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">液状化リスク</dt>
                  <dd className="mt-1 text-sm text-gray-900">{site.geo_risk.liquefaction_risk || '-'}</dd>
                </div>
                {site.geo_risk.note && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">備考</dt>
                    <dd className="mt-1 text-sm text-gray-900">{site.geo_risk.note}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-gray-500">データがありません</p>
            )}
          </div>
        </TabPanel>

        {/* スコア履歴タブ */}
        <TabPanel id="scores" activeTab={activeTab}>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">スコア履歴</h2>
              <button
                onClick={handleCalculateScore}
                disabled={scoreLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {scoreLoading ? '計算中...' : 'スコア再計算'}
              </button>
            </div>

            {latestScore && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">最新スコア</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ScoreCard title="系統接続性" score={latestScore.score_grid} />
                  <ScoreCard title="地理リスク" score={latestScore.score_geo} />
                  <ScoreCard title="法規制" score={latestScore.score_regulatory} />
                  <ScoreCard title="アクセス性" score={latestScore.score_access} />
                  <ScoreCard title="経済性" score={latestScore.score_economics} />
                  <div className="flex items-center justify-center">
                    <ScoreGrade grade={latestScore.grade} score={latestScore.score_total} size="lg" />
                  </div>
                </div>
              </div>
            )}

            {site.scores && site.scores.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        計算日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        総合スコア
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        グレード
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        バージョン
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {site.scores.map((score) => (
                      <tr key={score.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(score.calculated_at).toLocaleString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {score.score_total.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ScoreGrade grade={score.grade} size="sm" showScore={false} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {score.formula_version}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabPanel>

        {/* 自動化タブ */}
        <TabPanel id="automation" activeTab={activeTab}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">自動化情報</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">標高データ自動取得</h3>
                  <p className="text-sm text-gray-600">Google Elevation APIを使用</p>
                </div>
                <button
                  onClick={handleUpdateElevation}
                  disabled={elevationLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {elevationLoading ? '実行中...' : '実行'}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">スコア自動計算</h3>
                  <p className="text-sm text-gray-600">5カテゴリの総合評価</p>
                </div>
                <button
                  onClick={handleCalculateScore}
                  disabled={scoreLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {scoreLoading ? '実行中...' : '実行'}
                </button>
              </div>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};
