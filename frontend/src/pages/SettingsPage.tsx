import React from 'react';
import { Settings } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-600 mt-1">システム設定とユーザー設定</p>
      </div>

      <div className="card">
        <div className="flex flex-col items-center justify-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">設定機能</h3>
          <p className="text-gray-600 text-center max-w-md">
            この機能は現在開発中です。システム設定やユーザー設定を管理できるようになります。
          </p>
        </div>
      </div>
    </div>
  );
};
