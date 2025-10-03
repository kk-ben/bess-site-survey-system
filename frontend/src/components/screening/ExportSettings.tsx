import React, { useState } from 'react';
import { Download, FileText, Map, FileType } from 'lucide-react';
import { ExportFormat, ScreeningCriteria } from '@/types/screening';
import toast from 'react-hot-toast';
import { ScreeningService } from '@/services/screening.service';

interface ExportSettingsProps {
  criteria: ScreeningCriteria;
  resultCount: number;
  disabled?: boolean;
}

export const ExportSettings: React.FC<ExportSettingsProps> = ({
  criteria,
  resultCount,
  disabled = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState('');

  const handleExport = async () => {
    if (resultCount === 0) {
      toast.error('エクスポートする結果がありません');
      return;
    }

    setIsExporting(true);
    try {
      await ScreeningService.exportResults(
        criteria,
        selectedFormat,
        filename || undefined
      );
      toast.success(`${selectedFormat.toUpperCase()}ファイルをダウンロードしました`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  const formats: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
    {
      value: 'csv',
      label: 'CSV',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      value: 'geojson',
      label: 'GeoJSON',
      icon: <Map className="w-5 h-5" />,
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: <FileType className="w-5 h-5" />,
    },
  ];

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">エクスポート</h3>
      </div>

      <div className="space-y-4">
        {/* フォーマット選択 */}
        <div>
          <label className="label">フォーマット</label>
          <div className="grid grid-cols-3 gap-3">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedFormat === format.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
                disabled={disabled || isExporting}
              >
                {format.icon}
                <span className="font-medium">{format.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ファイル名 */}
        <div>
          <label className="label">ファイル名（オプション）</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="input"
            placeholder={`screening-results.${selectedFormat}`}
            disabled={disabled || isExporting}
          />
          <p className="text-xs text-gray-500 mt-1">
            空欄の場合、自動的にファイル名が生成されます
          </p>
        </div>

        {/* 結果サマリー */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">エクスポート対象</div>
          <div className="text-2xl font-bold text-gray-900">{resultCount} 件</div>
        </div>

        {/* エクスポートボタン */}
        <button
          onClick={handleExport}
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={disabled || isExporting || resultCount === 0}
        >
          <Download className="w-5 h-5" />
          {isExporting ? 'エクスポート中...' : 'エクスポート'}
        </button>

        {resultCount === 0 && (
          <p className="text-sm text-center text-gray-500">
            エクスポートするには、まずフィルタを適用してください
          </p>
        )}
      </div>
    </div>
  );
};
