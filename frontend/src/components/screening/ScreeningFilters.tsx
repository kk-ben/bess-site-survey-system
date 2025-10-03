import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { ScreeningCriteria, Recommendation } from '@/types/screening';

interface ScreeningFiltersProps {
  onApply: (criteria: ScreeningCriteria) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const RECOMMENDATIONS: { value: Recommendation; label: string; color: string }[] = [
  { value: 'excellent', label: '優秀', color: 'bg-success-100 text-success-800' },
  { value: 'good', label: '良好', color: 'bg-green-100 text-green-800' },
  { value: 'fair', label: '普通', color: 'bg-warning-100 text-warning-800' },
  { value: 'poor', label: '不良', color: 'bg-orange-100 text-orange-800' },
  { value: 'unsuitable', label: '不適', color: 'bg-danger-100 text-danger-800' },
];

export const ScreeningFilters: React.FC<ScreeningFiltersProps> = ({
  onApply,
  onReset,
  isLoading = false,
}) => {
  const [criteria, setCriteria] = useState<ScreeningCriteria>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof ScreeningCriteria, value: any) => {
    setCriteria((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleRecommendationToggle = (recommendation: Recommendation) => {
    setCriteria((prev) => {
      const current = prev.recommendations || [];
      const updated = current.includes(recommendation)
        ? current.filter((r) => r !== recommendation)
        : [...current, recommendation];
      return {
        ...prev,
        recommendations: updated.length > 0 ? updated : undefined,
      };
    });
  };

  const handleApply = () => {
    onApply(criteria);
  };

  const handleReset = () => {
    setCriteria({});
    onReset();
  };

  const hasActiveFilters = Object.keys(criteria).length > 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">スクリーニング条件</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            クリア
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 重み付きスコア */}
        <div>
          <label className="label">重み付きスコア（最小値）</label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={criteria.minWeightedScore || ''}
            onChange={(e) =>
              handleInputChange('minWeightedScore', parseFloat(e.target.value))
            }
            className="input"
            placeholder="例: 80"
            disabled={isLoading}
          />
        </div>

        {/* 推奨度フィルタ */}
        <div>
          <label className="label">推奨度</label>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDATIONS.map((rec) => (
              <button
                key={rec.value}
                onClick={() => handleRecommendationToggle(rec.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  criteria.recommendations?.includes(rec.value)
                    ? rec.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isLoading}
              >
                {rec.label}
              </button>
            ))}
          </div>
        </div>

        {/* 離隔違反除外 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="excludeViolations"
            checked={criteria.excludeViolations || false}
            onChange={(e) => handleInputChange('excludeViolations', e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            disabled={isLoading}
          />
          <label htmlFor="excludeViolations" className="ml-2 text-sm text-gray-700">
            離隔違反サイトを除外
          </label>
        </div>

        {/* 詳細フィルタ */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            disabled={isLoading}
          >
            {showAdvanced ? '詳細フィルタを隠す' : '詳細フィルタを表示'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">系統接続スコア（最小値）</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={criteria.minGridScore || ''}
                  onChange={(e) =>
                    handleInputChange('minGridScore', parseFloat(e.target.value))
                  }
                  className="input"
                  placeholder="例: 80"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="label">離隔距離スコア（最小値）</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={criteria.minSetbackScore || ''}
                  onChange={(e) =>
                    handleInputChange('minSetbackScore', parseFloat(e.target.value))
                  }
                  className="input"
                  placeholder="例: 70"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="label">道路アクセススコア（最小値）</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={criteria.minRoadScore || ''}
                  onChange={(e) =>
                    handleInputChange('minRoadScore', parseFloat(e.target.value))
                  }
                  className="input"
                  placeholder="例: 60"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="label">電柱近接スコア（最小値）</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={criteria.minPoleScore || ''}
                  onChange={(e) =>
                    handleInputChange('minPoleScore', parseFloat(e.target.value))
                  }
                  className="input"
                  placeholder="例: 70"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="label">総合スコア（最小値）</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={criteria.minTotalScore || ''}
                onChange={(e) =>
                  handleInputChange('minTotalScore', parseFloat(e.target.value))
                }
                className="input"
                placeholder="例: 75"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleApply}
            className="btn-primary flex-1"
            disabled={isLoading}
          >
            {isLoading ? '検索中...' : 'フィルタを適用'}
          </button>
        </div>
      </div>
    </div>
  );
};
