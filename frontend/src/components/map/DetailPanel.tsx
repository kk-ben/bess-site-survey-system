import React from 'react';
import { X, MapPin, Maximize, Navigation } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface DetailPanelProps {
  site: any;
  onClose: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ site, onClose }) => {
  const handleNavigate = () => {
    // Google Mapsで開く
    const url = `https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`;
    window.open(url, '_blank');
  };

  const handleViewDetails = () => {
    // 詳細ページへ遷移
    window.location.href = `/sites/${site.siteId}`;
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{site.siteName}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* コンテンツ */}
      <div className="p-4 space-y-4">
        {/* ステータス */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">ステータス</label>
          <div className="mt-1">
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

        {/* 住所 */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">住所</label>
          <p className="text-sm text-gray-900 mt-1 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{site.address}</span>
          </p>
        </div>

        {/* 座標 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">緯度</label>
            <p className="text-sm text-gray-900 mt-1">{site.latitude.toFixed(6)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">経度</label>
            <p className="text-sm text-gray-900 mt-1">{site.longitude.toFixed(6)}</p>
          </div>
        </div>

        {/* 面積 */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">面積</label>
          <p className="text-sm text-gray-900 mt-1">{site.areaSqm.toLocaleString()} ㎡</p>
        </div>

        {/* 土地利用 */}
        {site.landUse && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">土地利用</label>
            <p className="text-sm text-gray-900 mt-1">{site.landUse}</p>
          </div>
        )}

        {/* 評価スコア */}
        {site.overallScore !== undefined && (
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">総合スコア</label>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl font-bold text-gray-900">{site.overallScore}/100</span>
                <span className="text-sm text-gray-600">{getScoreLabel(site.overallScore)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    site.overallScore >= 80
                      ? 'bg-green-500'
                      : site.overallScore >= 60
                      ? 'bg-blue-500'
                      : site.overallScore >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${site.overallScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* アクション */}
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            className="w-full"
            icon={<Maximize className="w-4 h-4" />}
            onClick={handleViewDetails}
          >
            詳細を表示
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            icon={<Navigation className="w-4 h-4" />}
            onClick={handleNavigate}
          >
            ナビゲーション
          </Button>
        </div>
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

function getScoreLabel(score: number): string {
  if (score >= 80) return '優良';
  if (score >= 60) return '良好';
  if (score >= 40) return '可';
  return '不可';
}
