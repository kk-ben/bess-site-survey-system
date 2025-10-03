import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { useUiStore } from '@/stores/uiStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* デスクトップサイドバー */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* モバイルナビゲーション */}
      <MobileNavigation />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <Header />
        <main className="p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>
    </div>
  );
};
