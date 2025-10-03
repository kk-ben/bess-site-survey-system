import { create } from 'zustand';

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  selectedSiteId: string | null;
  visibleLayers: {
    sites: boolean;
    gridAssets: boolean;
    capacityAreas: boolean;
    amenityBuffers: boolean;
    poles: boolean;
  };
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  setSelectedSiteId: (siteId: string | null) => void;
  toggleLayer: (layer: keyof MapState['visibleLayers']) => void;
  setLayerVisibility: (layer: keyof MapState['visibleLayers'], visible: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: { lat: 35.6812, lng: 139.7671 }, // Tokyo default
  zoom: 10,
  selectedSiteId: null,
  visibleLayers: {
    sites: true,
    gridAssets: true,
    capacityAreas: false,
    amenityBuffers: false,
    poles: false,
  },
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedSiteId: (siteId) => set({ selectedSiteId: siteId }),
  toggleLayer: (layer) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layer]: !state.visibleLayers[layer],
      },
    })),
  setLayerVisibility: (layer, visible) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layer]: visible,
      },
    })),
}));
