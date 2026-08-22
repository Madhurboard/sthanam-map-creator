export interface MapState {
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
	overlayBgType: 'none' | 'vignette';
	overlaySize: 'none' | 'small' | 'medium' | 'large';
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

/** Raster tile theme — colours here are only used for poster chrome, not the map itself. */
export interface StandardTheme {
	name: string;
	description: string;
	tileUrl: string;
	tileUrlNoLabels: string;
	bg: string;
	background: string;
	water: string;
	road: string;
	textColor: string;
	accent: string;
	overlayBg: string;
	text?: string;
}

/** Vector theme — every colour drives a MapLibre paint property. */
export interface ArtisticTheme {
	name: string;
	description: string;
	bg: string;
	text: string;
	water: string;
	parks: string;
	road_motorway: string;
	road_primary: string;
	road_secondary: string;
	road_tertiary: string;
	road_residential: string;
	road_default: string;
	background?: string;
	textColor?: string;
	overlayBg?: string;
}

export interface SearchResult {
	name: string;
	lat: number;
	lon: number;
	shortName: string;
	country: string;
}

export interface OutputPreset {
	name: string;
	width: number;
	height: number;
}
