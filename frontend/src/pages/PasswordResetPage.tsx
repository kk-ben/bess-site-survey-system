import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<'request' | 'reset'>(token ? 'reset' : 'request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requestMutation = useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
    onSuccess: () => {
      toast.success('パスワードリセットのメールを送信しました');
      setStep('request');
    },
    onError: (error: any) => {
      toast.error(error.message || 'リクエストに失敗しました');
    },
  });

  const resetMutation = useMutation({
    mutationFn: (password: string) => authService.updatePassword(password),
    onSuccess: () => {
      toast.success('パスワードをリセットしました');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'リセットに失敗しました');
    },
  });

  const validateRequestForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'パスワードは必須です';
    } else if (password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRequestForm()) {
      return;
    }

    requestMutation.mutate(email);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateResetForm()) {
      return;
    }

    resetMutation.mutate(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 'request' ? 'パスワードリセット' : '新しいパスワード設定'}
            </h1>
            <p className="text-gray-600 mt-2">
              {step === 'request'
                ? 'メールアドレスを入力してください'
                : '新しいパスワードを入力してください'}
            </p>
          </div>

          {step === 'request' ? (
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="label">メールアドレス</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your@email.com"
                  disabled={requestMutation.isPending}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={requestMutation.isPending}
              >
                リセットメールを送信
              </Button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                ログイン画面に戻る
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="label">新しいパスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="8文字以上"
                  disabled={resetMutation.isPending}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="label">パスワード確認</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="パスワードを再入力"
                  disabled={resetMutation.isPending}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={resetMutation.isPending}
              >
                パスワードをリセット
              </Button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                ログイン画面に戻る
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
