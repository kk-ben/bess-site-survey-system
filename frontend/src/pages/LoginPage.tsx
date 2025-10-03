import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.login({ email, password });
      login(response.data.user, response.data.token);
      toast.success('ログインしました');
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.error?.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            BESS用地調査システム
          </h1>
          <p className="text-gray-600">ログインしてください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">メールアドレス</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="user@example.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="label">パスワード</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            icon={<LogIn className="w-5 h-5" />}
          >
            ログイン
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/password-reset')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              パスワードをお忘れですか？
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>デモ用アカウント</p>
          <p className="mt-1">
            Email: admin@example.com / Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};
