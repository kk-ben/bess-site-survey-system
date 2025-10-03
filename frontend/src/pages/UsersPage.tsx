import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { UserService } from '@/services/user.service';
import { User } from '@/types/auth';
import { Button } from '@/components/common/Button';
import { Table } from '@/components/common/Table';
import { Modal } from '@/components/common/Modal';
import { UserForm } from '@/components/users/UserForm';
import toast from 'react-hot-toast';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, roleFilter],
    queryFn: () => UserService.getUsers({ search, role: roleFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => UserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('ユーザーを削除しました');
    },
    onError: () => {
      toast.error('削除に失敗しました');
    },
  });

  const handleDelete = (user: User) => {
    if (window.confirm(`「${user.name}」を削除しますか？`)) {
      deleteMutation.mutate(user.userId);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const users = data?.data?.users || [];

  const columns = [
    {
      key: 'name',
      header: '名前',
      width: '25%',
    },
    {
      key: 'email',
      header: 'メールアドレス',
      width: '30%',
    },
    {
      key: 'role',
      header: '権限',
      render: (user: User) => (
        <span
          className={`badge ${
            user.role === 'admin'
              ? 'badge-excellent'
              : user.role === 'manager'
              ? 'badge-good'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {getRoleLabel(user.role)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: '作成日',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString('ja-JP'),
    },
    {
      key: 'actions',
      header: '操作',
      render: (user: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(user)}
            className="p-1 text-primary-600 hover:text-primary-700"
            title="編集"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(user)}
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
          <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-gray-600 mt-1">システムユーザーの管理</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          新規作成
        </Button>
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
              placeholder="名前またはメールアドレスで検索..."
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">すべての権限</option>
            <option value="admin">管理者</option>
            <option value="manager">マネージャー</option>
            <option value="viewer">閲覧者</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        ) : (
          <Table
            data={users}
            columns={columns}
            getRowId={(user) => user.userId}
            emptyMessage="ユーザーが登録されていません"
          />
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="ユーザーを新規作成"
        size="lg"
      >
        <UserForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="ユーザーを編集"
        size="lg"
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
              queryClient.invalidateQueries({ queryKey: ['users'] });
            }}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: '管理者',
    manager: 'マネージャー',
    viewer: '閲覧者',
  };
  return labels[role] || role;
}
