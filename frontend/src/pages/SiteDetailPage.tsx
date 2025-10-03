import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  Edit,
  Trash2,
  Play
} from 'lucide-react';
import { SiteService } from '@/services/site.service';
import { EvaluationService } from '@/services/evaluation.service';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { SiteForm } from '@/components/sites/SiteForm';
import { MapContainer } from '@/components/map/MapContainer';
import { MobileSiteDetail } from '@/components/mobile/MobileSiteDetail';
import toast from 'react-hot-toast';

// モバイルデバイスの判定
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const SiteDetailPage: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const { data: siteData, isLoading: siteLoading } = useQuery({
    queryKey: ['site', siteId],
    queryFn: () => SiteService.getSiteById(siteId!),
    enabled: !!siteId,
  });

  const { data: evaluationData, isLoading: evaluationLoading } = useQuery({
    queryKey: ['evaluation', siteId],
    queryFn: () => EvaluationService.getEvaluationBySiteId(siteId!),
    enabled: !!siteId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => SiteService.deleteSite(siteId!),
    onSuccess: () => {
      toast.success('候補地を削除しました');
      navigate('/sites');
    },
    onError: () => {
      toast.error('削除に失敗しました');
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: () => EvaluationService.evaluateSite(siteId!),
    onSuccess: () => {
      toast.success('評価を開始しました');
      queryClient.invalidateQueries({ queryKey: ['evaluation', siteId] });
      queryClient.invalidateQueries({ queryKey: ['site', siteId] });
    },
    onError: () => {
      toast.error('評価の開始に失敗しました');
    },
  });

  const handleDelete = () => {
    if (window.confirm('この候補地を削除しますか？')) {
      deleteMutation.mutate();
    }
  };

  const handleEvaluate = () => {
    evaluateMutation.mutate();
  };

  if (siteLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">読み込み中...</p>
      </div>
    );
  }

  if (!siteData?.data?.site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">候補地が見つかりません</p>
        <Button
          variant="secondary"
          onClick={() => navigate('/sites')}
          className="mt-4"
        >
          候補地一覧に戻る
        </Button>
      </div>
    );
  }

  const site = siteData.data.site;
  const evaluation = evaluationData?.data?.evaluation;

  // モバイル表示
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => navigate('/sites')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </button>
        </div>
        <MobileSiteDetail site={site} evaluation={evaluation} />
      </div>
    );
  }

  // デスクトップ表示
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sites')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{site.siteName}</h1>
            <p className="text-gray-600 mt-1">候補地詳細情報</p>
          </div>
        </div>
        <div className="flex gap-3">
          {!evaluation && (
            <Button
              variant="primary"
              icon={<Play className="w-5 h-5" />}
              onClick={handleEvaluate}
              loading={evaluateMutation.isPending}
            >
              評価実行
            </Button>
          )}
          <Button
            variant="secondary"
            icon={<Edit className="w-5 h-5" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            編集
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 className="w-5 h-5" />}
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          >
            削除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 基本情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 地図 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">位置情報</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer sites={[site]} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">サイト名</label>
                <p className="text-gray-900 mt-1">{site.siteName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ステータス</label>
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
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">住所</label>
                <p className="text-gray-900 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {site.address}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">緯度</label>
                <p className="text-gray-900 mt-1">{site.latitude}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">経度</label>
                <p className="text-gray-900 mt-1">{site.longitude}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">面積</label>
                <p className="text-gray-900 mt-1">{site.areaSqm.toLocaleString()} ㎡</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">土地利用</label>
                <p className="text-gray-900 mt-1">{site.landUse || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">作成日</label>
                <p className="text-gray-900 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(site.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">更新日</label>
                <p className="text-gray-900 mt-1">
                  {new Date(site.updatedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>

          {/* 評価結果 */}
          {evaluation ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                評価結果
              </h2>
              {/* 総合スコア */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">総合スコア</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {evaluation.overallScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
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
                <p className="text-sm text-gray-600 mt-1">
                  評価: {getScoreLabel(evaluation.overallScore)}
                </p>
              </div>
              {/* 詳細スコア */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {evaluation.gridConnectionScore !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">系統連系</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${evaluation.gridConnectionScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {evaluation.gridConnectionScore}
                      </span>
                    </div>
                  </div>
                )}
                {evaluation.roadAccessScore !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">道路アクセス</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${evaluation.roadAccessScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {evaluation.roadAccessScore}
                      </span>
                    </div>
                  </div>
                )}
                {evaluation.setbackScore !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">セットバック</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${evaluation.setbackScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {evaluation.setbackScore}
                      </span>
                    </div>
                  </div>
                )}
                {evaluation.poleProximityScore !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">電柱近接性</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${evaluation.poleProximityScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {evaluation.poleProximityScore}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {/* 推奨事項 */}
              {evaluation.recommendations && evaluation.recommendations.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    推奨事項
                  </h3>
                  <ul className="space-y-1">
                    {evaluation.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* 警告 */}
              {evaluation.warnings && evaluation.warnings.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    警告
                  </h3>
                  <ul className="space-y-1">
                    {evaluation.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">⚠</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  評価日: {new Date(evaluation.evaluatedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          ) : (
            <div className="card text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">評価未実施</h3>
              <p className="text-gray-600 mb-4">
                この候補地はまだ評価されていません
              </p>
              <Button
                variant="primary"
                icon={<Play className="w-5 h-5" />}
                onClick={handleEvaluate}
                loading={evaluateMutation.isPending}
              >
                評価を実行
              </Button>
            </div>
          )}
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* アクション */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
            <div className="space-y-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setIsEditModalOpen(true)}
                icon={<Edit className="w-4 h-4" />}
              >
                候補地を編集
              </Button>
              {!evaluation && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleEvaluate}
                  loading={evaluateMutation.isPending}
                  icon={<Play className="w-4 h-4" />}
                >
                  評価を実行
                </Button>
              )}
              <Button
                variant="danger"
                className="w-full"
                onClick={handleDelete}
                loading={deleteMutation.isPending}
                icon={<Trash2 className="w-4 h-4" />}
              >
                候補地を削除
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 編集モーダル */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="候補地を編集"
        size="lg"
      >
        <SiteForm
          site={site}
          onSuccess={() => {
            setIsEditModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['site', siteId] });
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
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
