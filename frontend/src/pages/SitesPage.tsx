import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit, Upload } from 'lucide-react';
import { SiteService } from '@/services/site.service';
import { Site } from '@/types/site';
import { Button } from '@/components/common/Button';
import { Table } from '@/components/common/Table';
import { Modal } from '@/components/common/Modal';
import { SiteForm } from '@/components/sites/SiteForm';
import { SiteUploadForm } from '@/components/sites/SiteUploadForm';
import toast from 'react-hot-toast';

export const SitesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['sites', search],
    queryFn: () => SiteService.getSites({ search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (siteId: string) => SiteService.deleteSite(siteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast.success('候補地を削除しました');
    },
    onError: () => {
      toast.error('削除に失敗しました');
    },
  });

  const handleDelete = (site: Site) => {
    if (window.confirm(`「${site.siteName}」を削除しますか？`)) {
      deleteMutation.mutate(site.siteId);
    }
  };

  const handleEdit = (site: Site) => {
    setSelectedSite(site);
    setIsEditModalOpen(true);
  };

  const sites = data?.data?.sites || [];

  const columns = [
    {
      key: 'siteName',
      header: 'サイト名',
      width: '20%',
    },
    {
      key: 'address',
      header: '住所',
      width: '30%',
    },
    {
      key: 'areaSqm',
      header: '面積(㎡)',
      render: (site: Site) => site.areaSqm.toLocaleString(),
    },
    {
      key: 'status',
      header: 'ステータス',
      render: (site: Site) => (
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
      ),
    },
    {
      key: 'actions',
      header: '操作',
      render: (site: Site) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(site)}
            className="p-1 text-primary-600 hover:text-primary-700"
            title="編集"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(site)}
            className="p-1 text-danger-600 hover:text-danger-700"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">候補地管理</h1>
          <p className="text-gray-600 mt-1">BESS設置候補地の登録・管理</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<Upload className="w-5 h-5" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            CSVアップロード
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            新規登録
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              placeholder="サイト名または住所で検索..."
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        ) : (
          <Table
            data={sites}
            columns={columns}
            getRowId={(site) => site.siteId}
            emptyMessage="候補地が登録されていません"
          />
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="候補地を新規登録"
        size="lg"
      >
        <SiteForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['sites'] });
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSite(null);
        }}
        title="候補地を編集"
        size="lg"
      >
        {selectedSite && (
          <SiteForm
            site={selectedSite}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedSite(null);
              queryClient.invalidateQueries({ queryKey: ['sites'] });
            }}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedSite(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="CSVファイルをアップロード"
        size="lg"
      >
        <SiteUploadForm
          onSuccess={() => {
            setIsUploadModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['sites'] });
          }}
          onCancel={() => setIsUploadModalOpen(false)}
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
