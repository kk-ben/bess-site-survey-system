import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useMapStore } from '@/stores/mapStore';
import { LayerControl } from './LayerControl';
import { CapacityLegend } from './CapacityLegend';
import { DetailPanel } from './DetailPanel';

interface MapContainerProps {
  sites?: any[];
  gridAssets?: any[];
  amenities?: any[];
  poles?: any[];
  onSiteClick?: (site: any) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  sites = [],
  gridAssets = [],
  amenities = [],
  poles = [],
  onSiteClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any>(null);

  const { center, zoom, layers, setMap } = useMapStore();

  // Google Maps初期化
  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader
      .load()
      .then(() => {
        if (mapRef.current && !mapInstanceRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: center.lat, lng: center.lng },
            zoom: zoom,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
          });

          mapInstanceRef.current = map;
          setMap(map);
          setIsLoaded(true);
        }
      })
      .catch((error) => {
        console.error('Google Maps読み込みエラー:', error);
      });
  }, []);

  // 候補地マーカー表示
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !layers.sites) return;

    // 既存マーカーをクリア
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 新しいマーカーを作成
    sites.forEach((site) => {
      const marker = new google.maps.Marker({
        position: { lat: site.latitude, lng: site.longitude },
        map: mapInstanceRef.current,
        title: site.siteName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getMarkerColor(site.status),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        setSelectedSite(site);
        if (onSiteClick) {
          onSiteClick(site);
        }
      });

      markersRef.current.push(marker);
    });
  }, [isLoaded, sites, layers.sites, onSiteClick]);

  // 電力設備レイヤー表示
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !layers.gridAssets) return;

    // TODO: 電力設備マーカー実装
  }, [isLoaded, gridAssets, layers.gridAssets]);

  // 近隣施設バッファレイヤー表示
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !layers.amenityBuffers) return;

    // TODO: 近隣施設バッファ実装
  }, [isLoaded, amenities, layers.amenityBuffers]);

  // 電柱クラスタレイヤー表示
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !layers.poles) return;

    // TODO: 電柱クラスタ実装
  }, [isLoaded, poles, layers.poles]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {isLoaded && (
        <>
          <LayerControl />
          {layers.capacityAreas && <CapacityLegend />}
          {selectedSite && (
            <DetailPanel
              site={selectedSite}
              onClose={() => setSelectedSite(null)}
            />
          )}
        </>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">地図を読み込み中...</p>
          </div>
        </div>
      )}
    </div>
  );
};

function getMarkerColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#9CA3AF', // gray
    evaluated: '#3B82F6', // blue
    approved: '#10B981', // green
    rejected: '#EF4444', // red
  };
  return colors[status] || colors.pending;
}
