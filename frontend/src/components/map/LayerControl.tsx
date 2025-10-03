import React from 'react';
import { Layers, MapPin, Zap, Building, Navigation } from 'lucide-react';
import { useMapStore } from '@/stores/mapStore';

export const LayerControl: React.FC = () => {
  const { layers, toggleLayer } = useMapStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const layerOptions = [
    {
      key: 'sites' as const,
      label: '候補地',
      icon: <MapPin className="w-4 h-4" />,
      color: 'text-blue-600',
    },
    {
      key: 'gridAssets' as const,
      label: '電力設備',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-yellow-600',
    },
    {
      key: 'capacityAreas' as const,
      label: '空き容量エリア',
      icon: <Layers className="w-4 h-4" />,
      color: 'text-green-600',
    },
    {
      key: 'amenityBuffers' as const,
      label: '近隣施設バッファ',
      icon: <Building className="w-4 h-4" />,
      color: 'text-purple-600',
    },
    {
      key: 'poles' as const,
      label: '電柱',
      icon: <Navigation className="w-4 h-4" />,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-white rounded-lg shadow-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Layers className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-700">レイヤー</span>
        </button>

        {isOpen && (
          <div className="border-t border-gray-200 p-2">
            {layerOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={layers[option.key]}
                  onChange={() => toggleLayer(option.key)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={option.color}>{option.icon}</span>
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
