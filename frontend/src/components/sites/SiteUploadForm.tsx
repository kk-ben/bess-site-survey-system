import React, { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { SiteService } from '@/services/site.service';
import toast from 'react-hot-toast';

interface SiteUploadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface UploadPreview {
  file: File;
  data: any[];
  errors: string[];
  warnings: string[];
}

export const SiteUploadForm: React.FC<SiteUploadFormProps> = ({ onSuccess, onCancel }) => {
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => SiteService.uploadCsv(file),
    onSuccess: (response) => {
      toast.success(`${response.data.imported}件のサイトをインポートしました`);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'アップロードに失敗しました');
    },
  });

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast.error('CSVファイルを選択してください');
      return;
    }

    await processFile(file);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    await processFile(files[0]);
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        toast.error('ファイルが空です');
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = { _rowIndex: index + 2 };
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });

      // Validate data
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check required headers
      const requiredHeaders = ['サイト名', '住所', '緯度', '経度', '面積', '土地利用'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        errors.push(`必須列が不足しています: ${missingHeaders.join(', ')}`);
      }

      // Validate data rows
      data.forEach((row) => {
        if (!row['サイト名']) {
          errors.push(`${row._rowIndex}行目: サイト名が必須です`);
        }
        if (!row['住所']) {
          errors.push(`${row._rowIndex}行目: 住所が必須です`);
        }

        const lat = parseFloat(row['緯度']);
        const lng = parseFloat(row['経度']);
        
        if (isNaN(lat) || lat < -90 || lat > 90) {
          errors.push(`${row._rowIndex}行目: 緯度が無効です`);
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          errors.push(`${row._rowIndex}行目: 経度が無効です`);
        }

        const area = parseFloat(row['面積']);
        if (isNaN(area) || area <= 0) {
          errors.push(`${row._rowIndex}行目: 面積が無効です`);
        }

        if (!row['土地利用']) {
          warnings.push(`${row._rowIndex}行目: 土地利用が未入力です`);
        }
      });

      setPreview({
        file,
        data,
        errors,
        warnings,
      });
    } catch (error) {
      toast.error('ファイルの読み込みに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = () => {
    if (preview && preview.errors.length === 0) {
      uploadMutation.mutate(preview.file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      {!preview ? (
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
            onDragLeave={() => setIsDragActive(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary-600">ファイルをドロップしてください</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    CSVファイルをドラッグ&ドロップするか、クリックして選択してください
                  </p>
                  <p className="text-sm text-gray-500">
                    対応形式: CSV (.csv)
                  </p>
                </div>
              )}
            </label>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">CSVフォーマット</h4>
            <p className="text-sm text-blue-800 mb-2">以下の列が必要です：</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• サイト名（必須）</li>
              <li>• 住所（必須）</li>
              <li>• 緯度（必須、数値）</li>
              <li>• 経度（必須、数値）</li>
              <li>• 面積（必須、数値、㎡単位）</li>
              <li>• 土地利用（推奨）</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{preview.file.name}</span>
              <span className="text-sm text-gray-500">
                ({preview.data.length}件のデータ)
              </span>
            </div>
            <button
              onClick={clearPreview}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {preview.errors.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-900">エラー</h4>
              </div>
              <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                {preview.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {preview.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">警告</h4>
              </div>
              <ul className="text-sm text-yellow-800 space-y-1 max-h-40 overflow-y-auto">
                {preview.warnings.slice(0, 10).map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
                {preview.warnings.length > 10 && (
                  <li>...他 {preview.warnings.length - 10} 件</li>
                )}
              </ul>
            </div>
          )}

          {preview.errors.length === 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">
                  データの検証が完了しました
                </span>
              </div>
            </div>
          )}

          {/* Preview table */}
          <div className="max-h-64 overflow-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">サイト名</th>
                  <th className="px-3 py-2 text-left">住所</th>
                  <th className="px-3 py-2 text-left">緯度</th>
                  <th className="px-3 py-2 text-left">経度</th>
                  <th className="px-3 py-2 text-left">面積</th>
                  <th className="px-3 py-2 text-left">土地利用</th>
                </tr>
              </thead>
              <tbody>
                {preview.data.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-3 py-2">{row['サイト名']}</td>
                    <td className="px-3 py-2">{row['住所']}</td>
                    <td className="px-3 py-2">{row['緯度']}</td>
                    <td className="px-3 py-2">{row['経度']}</td>
                    <td className="px-3 py-2">{row['面積']}</td>
                    <td className="px-3 py-2">{row['土地利用']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.data.length > 10 && (
              <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                他 {preview.data.length - 10} 件...
              </div>
            )}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-gray-600">ファイルを処理中...</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {preview && preview.errors.length === 0 && (
          <Button
            variant="primary"
            className="flex-1"
            loading={uploadMutation.isPending}
            onClick={handleUpload}
          >
            アップロード
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={uploadMutation.isPending}
        >
          キャンセル
        </Button>
      </div>
    </div>
  );
};
