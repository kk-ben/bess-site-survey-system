import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Share2, 
  BarChart3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import {
  openGoogleMapsNavigation,
  openGoogleMapsLocation,
  getCurrentPosition,
  calculateDistance,
  formatDistance,
} from '@/utils/navigation';

interface MobileSiteDetailProps {
  site: any;
  evaluation?: any;
}

export const MobileSiteDetail: React.FC<MobileSiteDetailProps> = ({
  site,
  evaluation,
}) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // 現在地からの距離を計算
    getCurrentPosition()
      .then((position) => {
        const dist = calculateDistance(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          {
            latitude: site.latitude,
            longitude: site.longitude,
          }
        );
        setDistance(dist);
      })
      .catch(() => {
        // 位置情報が取得できない場合は無視
      });
  }, [site]);

  const handleNavigate = () => {
    openGoogleMapsNavigation({
      latitude: site.latitude,
      longitude: site.longitude,
      name: site.siteName,
    });
  };

  const handleViewOnMap = () => {
    openGoogleMapsLocation({
      latitude: site.latitude,
      longitude: site.longitude,
      name: site.siteName,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: site.siteName,
          text: `${site.siteName} - ${site.address}`,
          url: window.location.href,
        });
      } catch (error) {
        // ユーザーがキャンセルした場合など
      }
    } else {
      // Web Share APIが使えない場合はクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      alert('URLをコピーしました');
    }
  };

  return (
    <div className="bg-white">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">{site.siteName}</h1>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{site.address}</span>
        </div>
        {distance !== null && (
          <div className="mt-2 text-sm text-primary-600 font-medium">
            現在地から {formatDistance(distance)}
          </div>
        )}
      </div>

      {/* アクションボタン */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <button
          onClick={handleNavigate}
          className="flex flex-col items-center gap-2 p-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <Navigation className="w-6 h-6" />
          <span className="text-xs font-medium">ナビ</span>
        </button>

        <button
          onClick={handleViewOnMap}
          className="flex flex-col items-center gap-2 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MapPin className="w-6 h-6" />
          <span className="text-xs font-medium">地図</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-2 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-xs font-medium">共有</span>
        </button>
      </div>

      {/* 基本情報 */}
      <div className="p-4 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">基本情報</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">面積</span>
            <span className="text-sm font-medium text-gray-900">
              {site.areaSqm.toLocaleString()} ㎡
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">土地利用</span>
            <span className="text-sm font-medium text-gray-900">
              {site.landUse || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">ステータス</span>
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
        </div>
      </div>

      {/* 評価結果 */}
      {evaluation && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">評価結果</h2>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* 総合スコア（常に表示） */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">総合スコア</span>
              <span className="text-2xl font-bold text-gray-900">
                {evaluation.overallScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  evaluation.overallScore >= 80
                    ? 'bg-green-500'
                    : evaluation.overallScore >= 60
                    ? 'bg-blue-500'
                    : evaluation.overallScore >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${evaluation.overallScore}%` }}
              ></div>
            </div>
          </div>

          {/* 詳細（展開時のみ表示） */}
          {isExpanded && (
            <div className="space-y-3">
              {evaluation.gridConnectionScore !== undefined && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">系統連系</span>
                    <span className="text-sm font-medium text-gray-900">
                      {evaluation.gridConnectionScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${evaluation.gridConnectionScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {evaluation.roadAccessScore !== undefined && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">道路アクセス</span>
                    <span className="text-sm font-medium text-gray-900">
                      {evaluation.roadAccessScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${evaluation.roadAccessScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {evaluation.setbackScore !== undefined && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">セットバック</span>
                    <span className="text-sm font-medium text-gray-900">
                      {evaluation.setbackScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${evaluation.setbackScore}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {evaluation.poleProximityScore !== undefined && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">電柱近接性</span>
                    <span className="text-sm font-medium text-gray-900">
                      {evaluation.poleProximityScore}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${evaluation.poleProximityScore}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 座標情報 */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          座標: {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
        </button>
      </div>
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
