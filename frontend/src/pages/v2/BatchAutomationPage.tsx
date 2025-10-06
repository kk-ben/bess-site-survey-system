// ============================================================================
// BESS Site Survey System v2.0 - Batch Automation Page
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { siteServiceV2, SiteWithDetails } from '../../services/v2/site.service';
import { automationServiceV2 } from '../../services/v2/automation.service';

export const BatchAutomationPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [sites, setSites] = useState<SiteWithDetails[]>([]);
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // 実行状態
  const [elevationRunning, setElevationRunning] = useState(false);
  const [scoreRunning, setScoreRunning] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await siteServiceV2.getSites({}, { limit: 100 });
      setSites(response.data);
    } catch (err) {
      alert('サイト読み込みエラー: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const toggleSite = (siteId: string) => {
    setSelectedSites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        newSet.add(siteId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedSites.size === sites.length) {
      setSelectedSites(new Set());
    } else {
      setSelectedSites(new Set(sites.map(s => s.id)));
    }
  };

  const handleBatchElevation = async () => {
    if (selectedSites.size === 0) {
      alert('サイトを選択してください');
      return;
    }

    if (!confirm(`${selectedSites.size}件のサイトの標高を取得しますか？`)) {
      return;
    }

    try {
      setElevationRunning(true);
      setProgress('標高取得中...');
      setResults(null);

      const siteIds = Array.from(selectedSites);
      const result = await automationServiceV2.updateElevationBatch(siteIds);

      setResults(result);
      setProgress('完了');
      alert(`標高取得完了: 成功 ${result.success}件, 失敗 ${result.failed}件`);
      
      // データ再取得
      await fetchSites();
    } catch (err) {
      alert('標高取得エラー: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setElevationRunning(false);
    }
  };

  const handleBatchScore = async () => {
    if (selectedSites.size === 0) {
      alert('サイトを選択してください');
      return;
    }

    if (!confirm(`${selectedSites.size}件のサイトのスコアを計算しますか？`)) {
      return;
    }

    try {
      setScoreRunning(true);
      setProgress('スコア計算中...');
      setResults(null);

      const siteIds = Array.from(selectedSites);
      const result = await automationServiceV2.calculateScoreBatch(siteIds);

      setResults(result);
      setProgress('完了');
      alert(`スコア計算完了: 成功 ${result.success}件, 失敗 ${result.failed}件`);
      
      // データ再取得
      await fetchSites();
    } catch (err) {
      alert('スコア計算エラー: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setScoreRunning(false);
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
    <div className="container mx-auto px-4 py-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/v2/sites')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          ← 一覧に戻る
        </button>
        <h1 className="text-3xl font-bold text-gray-900">一括自動化実行</h1>
        <p className="text-gray-600 mt-1">複数サイトの標高取得・スコア計算を一括実行</p>
      </div>

      {/* アクションパネル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">選択中: {selectedSites.size}件</h2>
            <p className="text-sm text-gray-600">全{sites.length}件</p>
          </div>
          <button
            onClick={toggleAll}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {selectedSites.size === sites.length ? '全解除' : '全選択'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 標高取得 */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">標高データ一括取得</h3>
            <p className="text-sm text-green-700 mb-4">
              Google Elevation APIを使用して選択したサイトの標高を取得
            </p>
            <button
              onClick={handleBatchElevation}
              disabled={elevationRunning || selectedSites.size === 0}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {elevationRunning ? '実行中...' : '標高取得実行'}
            </button>
          </div>

          {/* スコア計算 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">スコア一括計算</h3>
            <p className="text-sm text-blue-700 mb-4">
              5カテゴリの総合評価スコアを計算
            </p>
            <button
              onClick={handleBatchScore}
              disabled={scoreRunning || selectedSites.size === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scoreRunning ? '実行中...' : 'スコア計算実行'}
            </button>
          </div>
        </div>

        {/* 進捗表示 */}
        {(elevationRunning || scoreRunning) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">{progress}</span>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {results && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">実行結果</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-3 bg-green-100 rounded">
                <div className="text-2xl font-bold text-green-700">{results.success}</div>
                <div className="text-sm text-green-600">成功</div>
              </div>
              <div className="text-center p-3 bg-red-100 rounded">
                <div className="text-2xl font-bold text-red-700">{results.failed}</div>
                <div className="text-sm text-red-600">失敗</div>
              </div>
            </div>
            {results.results && results.results.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                  詳細を表示
                </summary>
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {results.results.map((r: any, i: number) => (
                    <div key={i} className={`text-sm p-2 ${r.success ? 'text-green-700' : 'text-red-700'}`}>
                      {r.success ? '✓' : '✗'} {r.siteId} {r.error && `- ${r.error}`}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* サイト一覧 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSites.size === sites.length && sites.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  サイトコード
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  サイト名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  標高
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  スコア
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ステータス
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sites.map((site) => (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSites.has(site.id)}
                      onChange={() => toggleSite(site.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {site.site_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {site.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {site.geo_risk?.elevation_m !== null && site.geo_risk?.elevation_m !== undefined
                      ? `${site.geo_risk.elevation_m.toFixed(1)} m`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {site.scores && site.scores.length > 0
                      ? `${site.scores[0].score_total.toFixed(1)} (${site.scores[0].grade})`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {site.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
