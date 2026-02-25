import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PosterState {
    city: string;
    cityOverride: string;
    country: string;
    countryOverride: string;
    cityFont: string;
    countryFont: string;
    coordsFont: string;
    lat: number;
    lon: number;
    zoom: number;
    theme: string;
    width: number;
    height: number;
    isExporting: boolean;
    overlayBgType: 'vignette' | 'solid';
    overlaySize: 'small' | 'medium' | 'large' | 'none';
    showLabels: boolean;
    renderMode: 'tile' | 'artistic';
    artisticTheme: string;
    matEnabled: boolean;
    matWidth: number;
    matShowBorder: boolean;
    matBorderWidth: number;
    matBorderOpacity: number;
    showMarker: boolean;
    markerLat: number;
    markerLon: number;
    markerIcon: string;
    markerSize: number;
    overlayX: number;
    overlayY: number;
    showCountry: boolean;
    showCoords: boolean;
}

export interface PosterActions {
    updateState: (partial: Partial<PosterState>) => void;
    resetState: () => void;
}

export const defaultState: PosterState = {
    city: "MUMBAI",
    cityOverride: "",
    country: "INDIA",
    countryOverride: "",
    cityFont: "'Playfair Display', serif",
    countryFont: "'Outfit', sans-serif",
    coordsFont: "'Outfit', sans-serif",
    lat: 19.0760,
    lon: 72.8777,
    zoom: 12,
    theme: "minimal",
    width: 1080,
    height: 1080,
    isExporting: false,
    overlayBgType: 'vignette',
    overlaySize: 'medium',
    showLabels: true,
    renderMode: 'tile',
    artisticTheme: 'arctic_frost',
    matEnabled: false,
    matWidth: 40,
    matShowBorder: true,
    matBorderWidth: 1,
    matBorderOpacity: 1,
    showMarker: false,
    markerLat: -6.2088,
    markerLon: 106.8456,
    markerIcon: 'pin',
    markerSize: 1,
    overlayX: 0.5,
    overlayY: 0.85,
    showCountry: true,
    showCoords: true,
};

export const usePosterStore = create<PosterState & PosterActions>()(
    persist(
        (set) => ({
            ...defaultState,
            updateState: (partial) => set((state) => ({ ...state, ...partial })),
            resetState: () => set(defaultState),
        }),
        {
            name: 'sthanam-poster-settings',
        }
    )
);
