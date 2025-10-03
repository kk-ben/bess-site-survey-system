import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { AuthService } from '@/services/auth.service';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      logout();
      toast.success('ログアウトしました');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="w-6 h-6 text-gray-600" />
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50">
          <User className="w-5 h-5 text-gray-600" />
          <div className="text-sm">
            <div className="font-medium text-gray-900">{user?.name}</div>
            <div className="text-gray-500">{user?.role}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          title="ログアウト"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
