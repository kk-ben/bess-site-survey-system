import React from 'react';
import { MapPin, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScreeningResult, Recommendation } from '@/types/screening';
import { format } from 'date-fns';

interface ScreeningResultsProps {
  results: ScreeningResult[];
  onSiteClick?: (siteId: string) => void;
  selectedSiteId?: string;
}

const RECOMMENDATION_CONFIG: Record<
  Recommendation,
  { label: string; className: string; icon: React.ReactNode }
> = {
  excellent: {
    label: '優秀',
    className: 'badge-excellent',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  good: {
    label: '良好',
    className: 'badge-good',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  fair: {
    label: '普通',
    className: 'badge-fair',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  poor: {
    label: '不良',
    className: 'badge-poor',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  unsuitable: {
    label: '不適',
    className: 'badge-unsuitable',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
};

export const ScreeningResults: React.FC<ScreeningResultsProps> = ({
  results,
  onSiteClick,
  selectedSiteId,
}) => {
  if (results.length === 0) {
    return (
      <div className="card text-center py-12">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">条件に一致する候補地が見つかりませんでした</p>
        <p className="text-sm text-gray-500 mt-2">
          フィルタ条件を変更して再度検索してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => {
        const config = RECOMMENDATION_CONFIG[result.recommendation];
        const isSelected = selectedSiteId === result.siteId;

        return (
          <div
            key={result.siteId}
            onClick={() => onSiteClick?.(result.siteId)}
            className={`card cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {result.siteName}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`${config.className} flex items-center gap-1`}>
                  {config.icon}
                  {config.label}
                </span>
                {result.violatesSetback && (
                  <span className="badge bg-red-100 text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    離隔違反
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <ScoreItem label="重み付きスコア" value={result.weightedScore} />
              <ScoreItem label="系統接続" value={result.gridScore} />
              <ScoreItem label="離隔距離" value={result.setbackScore} />
              <ScoreItem label="道路アクセス" value={result.roadScore} />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
              <span>電柱近接: {result.poleScore.toFixed(1)}</span>
              <span>
                評価日時:{' '}
                {format(new Date(result.evaluationDate), 'yyyy/MM/dd HH:mm')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface ScoreItemProps {
  label: string;
  value: number;
}

const ScoreItem: React.FC<ScoreItemProps> = ({ label, value }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${getScoreColor(value)}`}>
        {value.toFixed(1)}
      </div>
    </div>
  );
};
