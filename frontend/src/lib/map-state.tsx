'use client';

import { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { MapState } from '@/types';
import { migrateFontValue } from './fonts';

const STORAGE_KEY = 'sthanam:settings';

export const defaultState: MapState = {
	city: 'MUMBAI',
	cityOverride: '',
	country: 'INDIA',
	countryOverride: '',
	cityFont: 'var(--font-playfair), serif',
	countryFont: 'var(--font-outfit), sans-serif',
	coordsFont: 'var(--font-outfit), sans-serif',
	lat: 19.0760,
	lon: 72.8777,
	zoom: 12,
	theme: 'minimal',
	width: 1080,
	height: 1350,
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
	markerLat: 19.0760,
	markerLon: 72.8777,
	markerIcon: 'pin',
	markerSize: 1,
	overlayX: 0.5,
	overlayY: 0.85,
	showCountry: true,
	showCoords: true,
};

const SAVED_KEYS: (keyof MapState)[] = [
	'city', 'cityOverride', 'country', 'countryOverride',
	'cityFont', 'countryFont', 'coordsFont',
	'lat', 'lon', 'zoom', 'theme',
	'width', 'height', 'overlayBgType', 'overlaySize',
	'showLabels', 'renderMode', 'artisticTheme',
	'matEnabled', 'matWidth', 'matShowBorder', 'matBorderWidth', 'matBorderOpacity',
	'showMarker', 'markerLat', 'markerLon', 'markerIcon', 'markerSize',
	'overlayX', 'overlayY', 'showCountry', 'showCoords',
];

function loadSettings(): Partial<MapState> {
	if (typeof window === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (typeof parsed !== 'object' || parsed === null) return {};

		const toApply: Record<string, unknown> = {};
		for (const k of SAVED_KEYS) {
			if (k in parsed) toApply[k] = parsed[k];
		}

		// Fonts moved from literal family names to self-hosted CSS variables.
		toApply.cityFont = migrateFontValue(toApply.cityFont as string, defaultState.cityFont);
		toApply.countryFont = migrateFontValue(toApply.countryFont as string, defaultState.countryFont);
		toApply.coordsFont = migrateFontValue(toApply.coordsFont as string, defaultState.coordsFont);

		return toApply as Partial<MapState>;
	} catch (e) {
		console.warn('Failed to load settings from localStorage:', e);
		return {};
	}
}

function saveSettings(state: MapState) {
	if (typeof window === 'undefined') return;
	try {
		const out: Record<string, unknown> = {};
		for (const k of SAVED_KEYS) out[k] = state[k];
		localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
	} catch (e) {
		console.warn('Failed to save settings to localStorage:', e);
	}
}

type Action = { type: 'SET'; payload: Partial<MapState> } | { type: 'RESET' };

function reducer(state: MapState, action: Action): MapState {
	switch (action.type) {
		case 'SET':
			return { ...state, ...action.payload };
		case 'RESET':
			return { ...defaultState };
		default:
			return state;
	}
}

interface MapStateValue {
	state: MapState;
	dispatch: React.Dispatch<Action>;
	/** False until saved settings have been applied, so the map waits for real coordinates. */
	hydrated: boolean;
}

const MapStateContext = createContext<MapStateValue | null>(null);

export function MapStateProvider({ children }: { children: ReactNode }) {
	// Settings load after mount, not during render — reading localStorage while
	// rendering would desync the server HTML from the first client paint.
	const [state, dispatch] = useReducer(reducer, defaultState);
	const [hydrated, setHydrated] = useState(false);
	const hydratedRef = useRef(false);

	useEffect(() => {
		const saved = loadSettings();
		if (Object.keys(saved).length > 0) dispatch({ type: 'SET', payload: saved });
		hydratedRef.current = true;
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydratedRef.current) return;
		saveSettings(state);
	}, [state]);

	return (
		<MapStateContext.Provider value={{ state, dispatch, hydrated }}>
			{children}
		</MapStateContext.Provider>
	);
}

export function useMapState() {
	const ctx = useContext(MapStateContext);
	if (!ctx) throw new Error('useMapState must be used within MapStateProvider');
	return ctx;
}

export function useUpdateState() {
	const { dispatch } = useMapState();
	return useCallback((payload: Partial<MapState>) => {
		dispatch({ type: 'SET', payload });
	}, [dispatch]);
}

export function useResetState() {
	const { dispatch } = useMapState();
	return useCallback(() => {
		dispatch({ type: 'RESET' });
	}, [dispatch]);
}
