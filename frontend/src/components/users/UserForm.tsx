import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserService, CreateUserData, UpdateUserData } from '@/services/user.service';
import { User } from '@/types/auth';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ('viewer' as const),
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => UserService.createUser(data),
    onSuccess: () => {
      toast.success('ユーザーを作成しました');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'ユーザー作成に失敗しました');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserData) => UserService.updateUser(user!.userId, data),
    onSuccess: () => {
      toast.success('ユーザーを更新しました');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'ユーザー更新に失敗しました');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!user) {
      // 新規作成時はパスワード必須
      if (!formData.password) {
        newErrors.password = 'パスワードは必須です';
      } else if (formData.password.length < 8) {
        newErrors.password = 'パスワードは8文字以上で入力してください';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'パスワードが一致しません';
      }
    } else {
      // 更新時はパスワードが入力されている場合のみ検証
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'パスワードは8文字以上で入力してください';
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'パスワードが一致しません';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (user) {
      // 更新
      const updateData: UpdateUserData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      updateMutation.mutate(updateData);
    } else {
      // 新規作成
      const createData: CreateUserData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
      };

      createMutation.mutate(createData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">名前</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`input ${errors.name ? 'border-red-500' : ''}`}
          disabled={isLoading}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="label">メールアドレス</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`input ${errors.email ? 'border-red-500' : ''}`}
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="label">権限</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          className="input"
          disabled={isLoading}
        >
          <option value="viewer">閲覧者</option>
          <option value="manager">マネージャー</option>
          <option value="admin">管理者</option>
        </select>
      </div>

      <div>
        <label className="label">
          パスワード{user ? '（変更する場合のみ入力）' : ''}
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={`input ${errors.password ? 'border-red-500' : ''}`}
          disabled={isLoading}
          placeholder={user ? '変更しない場合は空欄' : ''}
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="label">パスワード確認</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1" loading={isLoading}>
          {user ? '更新' : '作成'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
      </div>
    </form>
  );
};
