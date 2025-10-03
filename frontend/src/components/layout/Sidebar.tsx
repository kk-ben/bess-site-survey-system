import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Filter,
  Map,
  Upload,
  Users,
  Settings,
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  requiredRole?: 'admin' | 'manager';
}

const navItems: NavItem[] = [
  {
    to: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: 'ダッシュボード',
  },
  {
    to: '/sites',
    icon: <MapPin className="w-5 h-5" />,
    label: '候補地管理',
  },
  {
    to: '/screening',
    icon: <Filter className="w-5 h-5" />,
    label: 'スクリーニング',
  },
  {
    to: '/map',
    icon: <Map className="w-5 h-5" />,
    label: '地図表示',
  },
  {
    to: '/import',
    icon: <Upload className="w-5 h-5" />,
    label: 'データ取込',
    requiredRole: 'manager',
  },
  {
    to: '/users',
    icon: <Users className="w-5 h-5" />,
    label: 'ユーザー管理',
    requiredRole: 'admin',
  },
  {
    to: '/settings',
    icon: <Settings className="w-5 h-5" />,
    label: '設定',
  },
];

export const Sidebar: React.FC = () => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const user = useAuthStore((state) => state.user);

  const canAccessItem = (item: NavItem) => {
    if (!item.requiredRole) return true;
    if (!user) return false;

    const roleHierarchy = { admin: 3, manager: 2, viewer: 1 };
    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[item.requiredRole];

    return userLevel >= requiredLevel;
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">BESS調査システム</h1>
        <p className="text-sm text-gray-600 mt-1">用地評価・選定</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.filter(canAccessItem).map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>© 2025 BESS Survey System</p>
        <p className="mt-1">Version 1.0.0</p>
      </div>
    </aside>
  );
};
