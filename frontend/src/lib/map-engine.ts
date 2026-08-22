import type { Map as LeafletMap, TileLayer, Marker as LeafletMarker } from 'leaflet';
import type { Map as MapLibreMap, Marker as MapLibreMarker, StyleSpecification } from 'maplibre-gl';
import type { MapState, ArtisticTheme, StandardTheme } from '@/types';
import { MARKER_ICONS, MARKER_BASE_SIZE } from './marker-icons';
import { generateMapLibreStyle, STYLE_PAINT_MAP } from './maplibre-style';

/*
 * Dual map engine, ported from the vanilla src/map/map-init.js.
 *
 * Leaflet renders the raster "standard" themes, MapLibre GL renders the vector
 * "artistic" themes, and both are kept on the same centre/zoom so switching
 * modes is seamless. MapLibre sits one zoom level below Leaflet because its
 * tiles are 512px against Leaflet's 256px.
 */

const ARTISTIC_ZOOM_OFFSET = 1;

type LeafletModule = typeof import('leaflet');
type MapLibreModule = typeof import('maplibre-gl');

let L: LeafletModule | null = null;
let maplibregl: MapLibreModule | null = null;

let map: LeafletMap | null = null;
let tileLayer: TileLayer | null = null;
let marker: LeafletMarker | null = null;
let artisticMap: MapLibreMap | null = null;
let artisticMarker: MapLibreMarker | null = null;

let currentArtisticThemeName: string | null = null;
let isSyncing = false;
let styleChangeInProgress = false;
let pendingArtisticStyle: Record<string, unknown> | null = null;
let pendingArtisticThemeName: string | null = null;

type StateUpdater = (partial: Partial<MapState>) => void;
let onStateChange: StateUpdater = () => { };

export function setStateUpdater(fn: StateUpdater) {
	onStateChange = fn;
}

export interface InitOptions {
	tileContainer: HTMLElement;
	artisticContainer: HTMLElement;
	center: [number, number];
	zoom: number;
	tileUrl: string;
	markerLat: number;
	markerLon: number;
}

/**
 * Bumped by every init and teardown. An init that finds the counter has moved
 * on while it was awaiting its dynamic imports abandons its work — without
 * this, StrictMode's mount/unmount/mount would build two maps in one container.
 */
let generation = 0;

export function initEngine(opts: InitOptions): Promise<void> {
	return buildEngine(opts, ++generation);
}

async function buildEngine(opts: InitOptions, myGeneration: number): Promise<void> {
	const [leafletMod, maplibreMod] = await Promise.all([
		import('leaflet'),
		import('maplibre-gl'),
	]);

	if (myGeneration !== generation || map) return;

	// Both ship CommonJS builds, so the useful namespace may hang off `default`.
	L = ((leafletMod as unknown as { default?: LeafletModule }).default ?? leafletMod) as LeafletModule;
	maplibregl = ((maplibreMod as unknown as { default?: MapLibreModule }).default ?? maplibreMod) as MapLibreModule;

	map = L.map(opts.tileContainer, {
		zoomControl: false,
		attributionControl: false,
		scrollWheelZoom: 'center',
		touchZoom: 'center',
	}).setView(opts.center, opts.zoom);

	tileLayer = L.tileLayer(opts.tileUrl, {
		maxZoom: 19,
		crossOrigin: true,
	}).addTo(map);

	const customIcon = L.divIcon({
		className: 'custom-marker',
		html: MARKER_ICONS.pin,
		iconSize: [MARKER_BASE_SIZE, MARKER_BASE_SIZE],
		iconAnchor: [MARKER_BASE_SIZE / 2, MARKER_BASE_SIZE],
	});

	marker = L.marker([opts.markerLat, opts.markerLon], {
		icon: customIcon,
		draggable: true,
		autoPan: true,
	});

	marker.on('dragend', () => {
		if (!marker) return;
		const pos = marker.getLatLng();
		onStateChange({ markerLat: pos.lat, markerLon: pos.lng });
		if (artisticMarker) artisticMarker.setLngLat([pos.lng, pos.lat]);
	});

	map.on('moveend', () => {
		if (isSyncing || !map) return;
		isSyncing = true;

		const center = map.getCenter();
		const zoom = map.getZoom();
		onStateChange({ lat: center.lat, lon: center.lng, zoom });

		if (artisticMap) {
			artisticMap.jumpTo({
				center: [center.lng, center.lat],
				zoom: zoom - ARTISTIC_ZOOM_OFFSET,
			});
		}

		isSyncing = false;
	});

	initArtisticMap(opts.artisticContainer, [opts.center[1], opts.center[0]], opts.zoom - ARTISTIC_ZOOM_OFFSET, [opts.markerLon, opts.markerLat]);
}

function initArtisticMap(container: HTMLElement, center: [number, number], zoom: number, markerPos: [number, number]) {
	if (!maplibregl) return;

	artisticMap = new maplibregl.Map({
		container,
		style: { version: 8, sources: {}, layers: [] },
		center,
		zoom,
		interactive: true,
		attributionControl: false,
		// Without this the WebGL buffer is cleared after each paint and the
		// export reads back an empty canvas. MapLibre 5 moved it under
		// canvasContextAttributes; it was a top-level option in v4.
		canvasContextAttributes: { preserveDrawingBuffer: true },
	});

	artisticMap.scrollZoom.setWheelZoomRate(1);
	artisticMap.scrollZoom.setZoomRate(1 / 600);

	artisticMap.on('style.load', () => {
		if (pendingArtisticStyle && artisticMap) {
			const next = pendingArtisticStyle;
			const nextName = pendingArtisticThemeName;
			pendingArtisticStyle = null;
			pendingArtisticThemeName = null;
			currentArtisticThemeName = nextName;
			artisticMap.setStyle(next as unknown as StyleSpecification);
		} else {
			styleChangeInProgress = false;
		}
	});

	artisticMap.on('moveend', () => {
		if (isSyncing || !artisticMap) return;
		isSyncing = true;

		const center = artisticMap.getCenter();
		const zoom = artisticMap.getZoom();

		onStateChange({
			lat: center.lat,
			lon: center.lng,
			zoom: zoom + ARTISTIC_ZOOM_OFFSET,
		});

		if (map) {
			map.setView([center.lat, center.lng], zoom + ARTISTIC_ZOOM_OFFSET, { animate: false });
		}

		isSyncing = false;
	});

	const el = document.createElement('div');
	el.className = 'custom-marker';
	el.innerHTML = MARKER_ICONS.pin;
	artisticMarker = new maplibregl.Marker({ element: el, draggable: true }).setLngLat(markerPos);

	artisticMarker.on('dragend', () => {
		if (!artisticMarker) return;
		const pos = artisticMarker.getLngLat();
		onStateChange({ markerLat: pos.lat, markerLon: pos.lng });
		if (marker) marker.setLatLng([pos.lat, pos.lng]);
	});
}

export function destroyEngine() {
	// Invalidates any init still waiting on its dynamic imports.
	generation++;
	try { map?.remove(); } catch { /* already torn down */ }
	try { artisticMap?.remove(); } catch { /* already torn down */ }
	map = null;
	artisticMap = null;
	tileLayer = null;
	marker = null;
	artisticMarker = null;
	currentArtisticThemeName = null;
	styleChangeInProgress = false;
	pendingArtisticStyle = null;
	pendingArtisticThemeName = null;
}

export function updateMapPosition(lat: number, lon: number, zoom: number, options: { animate?: boolean } = { animate: true }) {
	if (isSyncing) return;
	isSyncing = true;
	try {
		if (map) map.setView([lat, lon], zoom, options);
		if (artisticMap) artisticMap.jumpTo({ center: [lon, lat], zoom: zoom - ARTISTIC_ZOOM_OFFSET });
	} finally {
		isSyncing = false;
	}
}

export function updateMapTheme(tileUrl: string) {
	if (tileLayer) tileLayer.setUrl(tileUrl);
}

export function updateArtisticStyle(theme: ArtisticTheme) {
	if (!artisticMap) return;
	if (currentArtisticThemeName === theme.name) return;

	currentArtisticThemeName = theme.name;

	const style = artisticMap.getStyle();
	const hasSource = style && style.sources && 'openfreemap' in style.sources;

	if (!hasSource) {
		const nextStyle = generateMapLibreStyle(theme);
		if (styleChangeInProgress) {
			pendingArtisticStyle = nextStyle;
			pendingArtisticThemeName = theme.name;
			return;
		}

		styleChangeInProgress = true;
		try {
			artisticMap.setStyle(nextStyle as unknown as StyleSpecification);
		} catch {
			pendingArtisticStyle = nextStyle;
			pendingArtisticThemeName = theme.name;
		}
		return;
	}

	// Same vector source already loaded — recolour in place, far cheaper than a reload.
	try {
		for (const [layerId, prop, themeKey] of STYLE_PAINT_MAP) {
			artisticMap.setPaintProperty(layerId, prop, theme[themeKey] as string);
		}
	} catch {
		artisticMap.setStyle(generateMapLibreStyle(theme) as unknown as StyleSpecification);
	}
}

export function updateMarkerStyles(state: MapState, theme: StandardTheme | ArtisticTheme) {
	if (!L || !maplibregl) return;

	const iconType = state.markerIcon || 'pin';
	const size = Math.round(MARKER_BASE_SIZE * (state.markerSize || 1));
	const isArtistic = state.renderMode === 'artistic';
	const color = isArtistic
		? ((theme as ArtisticTheme).road_primary || theme.text || '#0f172a')
		: ((theme as StandardTheme).textColor || theme.text || '#0f172a');

	const html = (MARKER_ICONS[iconType] || MARKER_ICONS.pin)
		.replace('class="marker-pin"', `style="width: ${size}px; height: ${size}px; color: ${color};"`);

	const anchorY = iconType === 'pin' ? size : size / 2;

	if (marker && map) {
		if (state.showMarker) {
			marker.setIcon(L.divIcon({
				className: 'custom-marker',
				html,
				iconSize: [size, size],
				iconAnchor: [size / 2, anchorY],
			}));
			marker.setLatLng([state.markerLat, state.markerLon]);
			if (!map.hasLayer(marker)) marker.addTo(map);
		} else if (map.hasLayer(marker)) {
			map.removeLayer(marker);
		}
	}

	if (artisticMap) {
		if (artisticMarker) artisticMarker.remove();

		if (state.showMarker) {
			const el = document.createElement('div');
			el.className = 'custom-marker';
			el.innerHTML = html;
			el.style.width = `${size}px`;
			el.style.height = `${size}px`;

			artisticMarker = new maplibregl.Marker({
				element: el,
				draggable: true,
				anchor: iconType === 'pin' ? 'bottom' : 'center',
			})
				.setLngLat([state.markerLon, state.markerLat])
				.addTo(artisticMap);

			artisticMarker.on('dragend', () => {
				if (!artisticMarker) return;
				const pos = artisticMarker.getLngLat();
				onStateChange({ markerLat: pos.lat, markerLon: pos.lng });
				if (marker) marker.setLatLng([pos.lat, pos.lng]);
			});
		}
	}
}

export function invalidateMapSize() {
	try { map?.invalidateSize({ animate: false }); } catch { /* not mounted yet */ }
	try { artisticMap?.resize(); } catch { /* not mounted yet */ }
}

export function waitForTilesLoad(timeout = 5000): Promise<void> {
	return new Promise((resolve) => {
		if (!map || !tileLayer) return resolve();

		let resolved = false;
		const finish = () => {
			if (resolved) return;
			resolved = true;
			clearTimeout(timer);
			resolve();
		};

		tileLayer.once('load', finish);
		const timer = setTimeout(finish, timeout);
	});
}

export function waitForArtisticIdle(timeout = 2000): Promise<void> {
	return new Promise((resolve) => {
		if (!artisticMap) return resolve();

		let resolved = false;
		const finish = () => {
			if (resolved) return;
			resolved = true;
			clearTimeout(timer);
			resolve();
		};

		try {
			artisticMap.once('idle', finish);
		} catch {
			return resolve();
		}
		const timer = setTimeout(finish, timeout);
	});
}

export function getMapInstance() {
	return map;
}

export function getArtisticMapInstance() {
	return artisticMap;
}

export { ARTISTIC_ZOOM_OFFSET };
