import React from 'react';
import { Map } from 'lucide-react';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">地図表示</h1>
        <p className="text-gray-600 mt-1">候補地を地図上で確認</p>
      </div>

      <div className="card">
        <div className="flex flex-col items-center justify-center py-12">
          <Map className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">地図機能</h3>
          <p className="text-gray-600 text-center max-w-md">
            この機能は現在開発中です。候補地を地図上で表示・管理できるようになります。
          </p>
        </div>
      </div>
    </div>
  );
};
