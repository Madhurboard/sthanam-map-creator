import type { MapState, ArtisticTheme, StandardTheme } from '@/types';
import type { Tier } from './pricing';
import { getMapInstance, getArtisticMapInstance, invalidateMapSize, waitForTilesLoad } from './map-engine';
import { MARKER_ICONS_EXPORT, MARKER_BASE_SIZE } from './marker-icons';
import { hexToRgba, project } from './utils';
import { resolveOutputSize } from './pricing';

/*
 * Ported from the vanilla src/core/export.js.
 *
 * html2canvas cannot rasterise a WebGL canvas or lazily-loaded raster tiles on
 * its own, so the map is composited by hand into an offscreen canvas first and
 * then re-parented into html2canvas's cloned document, where the poster's text
 * and frame are drawn on top.
 */

/** Browsers refuse to allocate canvases beyond roughly this edge/area. */
const MAX_CANVAS_EDGE = 16384;
const MAX_CANVAS_AREA = 268_000_000;
/** WebGL drawing buffers are far more constrained than 2D canvases. */
const MAX_GL_EDGE = 8192;

export interface ExportOptions {
	state: MapState;
	tier: Tier;
	theme: StandardTheme | ArtisticTheme;
	filename: string;
	onProgress?: (message: string) => void;
}

/**
 * Shrinks a requested size until the browser will actually allocate it,
 * preserving aspect ratio. Returns the size plus whether it had to clamp.
 */
export function clampToCanvasLimits(width: number, height: number): { width: number; height: number; clamped: boolean } {
	let w = width;
	let h = height;
	let clamped = false;

	const longest = Math.max(w, h);
	if (longest > MAX_CANVAS_EDGE) {
		const ratio = MAX_CANVAS_EDGE / longest;
		w = Math.floor(w * ratio);
		h = Math.floor(h * ratio);
		clamped = true;
	}

	if (w * h > MAX_CANVAS_AREA) {
		const ratio = Math.sqrt(MAX_CANVAS_AREA / (w * h));
		w = Math.floor(w * ratio);
		h = Math.floor(h * ratio);
		clamped = true;
	}

	return { width: Math.max(1, w), height: Math.max(1, h), clamped };
}

async function drawMarkerToCtx(ctx: CanvasRenderingContext2D, state: MapState, x: number, y: number, color: string, scale: number) {
	const iconType = state.markerIcon || 'pin';
	const size = Math.round(MARKER_BASE_SIZE * (state.markerSize || 1) * scale);
	const svgString = MARKER_ICONS_EXPORT[iconType] || MARKER_ICONS_EXPORT.pin;
	const svg = svgString
		.replace(/currentColor/g, color)
		.replace('width="100"', `width="${size}"`)
		.replace('height="100"', `height="${size}"`);

	return new Promise<void>((resolve) => {
		const img = new Image();
		// btoa() is latin1-only; go through UTF-8 bytes so themed colours survive.
		const encoded = window.btoa(unescape(encodeURIComponent(svg)));

		img.onload = () => {
			const anchorX = size / 2;
			const anchorY = iconType === 'pin' ? size : size / 2;
			ctx.drawImage(img, x - anchorX, y - anchorY, size, size);
			resolve();
		};
		img.onerror = () => resolve();
		img.src = `data:image/svg+xml;base64,${encoded}`;
	});
}

/**
 * Resolves once every tile image in the container has finished decoding,
 * or after `timeout` — whichever comes first. Listeners are additive so
 * Leaflet's own load handling is left intact.
 */
function waitForPendingTileImages(container: HTMLElement, timeout: number): Promise<void> {
	const pending = (Array.from(container.querySelectorAll('img.leaflet-tile')) as HTMLImageElement[])
		.filter(img => !img.complete || img.naturalWidth === 0);

	if (pending.length === 0) return Promise.resolve();

	return new Promise<void>((resolve) => {
		let remaining = pending.length;
		let settled = false;

		const finish = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve();
		};

		const onSettle = () => {
			remaining -= 1;
			if (remaining <= 0) finish();
		};

		for (const img of pending) {
			img.addEventListener('load', onSettle, { once: true });
			img.addEventListener('error', onSettle, { once: true });
		}

		const timer = setTimeout(finish, timeout);
	});
}

function paintVignette(ctx: CanvasRenderingContext2D, color: string, width: number, height: number) {
	const colorSolid = hexToRgba(color, 1);
	const colorTrans = hexToRgba(color, 0);
	const gradient = ctx.createLinearGradient(0, 0, 0, height);
	gradient.addColorStop(0, colorSolid);
	gradient.addColorStop(0.03, colorSolid);
	gradient.addColorStop(0.2, colorTrans);
	gradient.addColorStop(0.8, colorTrans);
	gradient.addColorStop(0.97, colorSolid);
	gradient.addColorStop(1, colorSolid);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);
}

/**
 * Composites the live map into an offscreen canvas at the physical export
 * resolution, independent of how large the on-screen preview happens to be.
 */
async function captureMapSnapshot(
	state: MapState,
	theme: StandardTheme | ArtisticTheme,
	snapWidth: number,
	snapHeight: number,
	scale: number,
): Promise<HTMLCanvasElement | null> {
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, snapWidth);
	canvas.height = Math.max(1, snapHeight);
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	const isArtistic = state.renderMode === 'artistic';
	const bgColor = theme.bg || theme.background || '#ffffff';

	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	if (isArtistic) {
		const artisticMap = getArtisticMapInstance();
		const artisticContainer = document.getElementById('artistic-map');
		if (!artisticMap || !artisticContainer) return canvas;

		const originalWidth = artisticContainer.style.width;
		const originalHeight = artisticContainer.style.height;
		const originalInset = artisticContainer.style.inset;

		try {
			// The GL drawing buffer is capped well below the 2D canvas limit, so
			// render at the largest safe size and let drawImage scale it up.
			const glLongest = Math.max(snapWidth, snapHeight);
			const glScale = glLongest > MAX_GL_EDGE ? MAX_GL_EDGE / glLongest : 1;
			const glW = Math.max(1, Math.round(snapWidth * glScale));
			const glH = Math.max(1, Math.round(snapHeight * glScale));

			artisticContainer.style.inset = 'auto';
			artisticContainer.style.width = `${glW}px`;
			artisticContainer.style.height = `${glH}px`;
			artisticMap.resize();

			await new Promise<void>((resolve) => {
				const timer = setTimeout(resolve, 4000);
				artisticMap.once('idle', () => {
					clearTimeout(timer);
					resolve();
				});
			});

			ctx.drawImage(artisticMap.getCanvas(), 0, 0, canvas.width, canvas.height);

			if (state.showMarker) {
				const zoom = artisticMap.getZoom();
				const center = artisticMap.getCenter();
				const worldScale = Math.pow(2, zoom) * 512 * (canvas.width / glW);
				const centerPoint = project(center.lat, center.lng, worldScale);
				const markerPoint = project(state.markerLat, state.markerLon, worldScale);

				const x = (canvas.width / 2) + (markerPoint.x - centerPoint.x);
				const y = (canvas.height / 2) + (markerPoint.y - centerPoint.y);
				const color = (theme as ArtisticTheme).road_primary || theme.text || '#0f172a';

				await drawMarkerToCtx(ctx, state, x, y, color, scale);
			}
		} catch (e) {
			console.error('Failed to capture artistic map:', e);
		} finally {
			artisticContainer.style.width = originalWidth;
			artisticContainer.style.height = originalHeight;
			artisticContainer.style.inset = originalInset;
			try { artisticMap.resize(); } catch { /* container is being torn down */ }
		}
	} else {
		const mapPreviewContainer = document.getElementById('map-preview');
		if (!mapPreviewContainer) return canvas;

		try {
			// Leaflet streams tiles in lazily. Compositing before they land
			// leaves blank wedges at the edges of the exported poster.
			await waitForTilesLoad(8000);
			await waitForPendingTileImages(mapPreviewContainer, 6000);

			const containerRect = mapPreviewContainer.getBoundingClientRect();
			if (containerRect.width <= 0) return canvas;

			// Bounding rects are already in the poster-scaler's transformed space,
			// so this ratio maps preview pixels onto export pixels directly.
			const scaleFactor = canvas.width / containerRect.width;
			const tiles = Array.from(mapPreviewContainer.querySelectorAll('img.leaflet-tile')) as HTMLImageElement[];

			for (const tile of tiles) {
				if (!tile.complete || tile.naturalWidth === 0) continue;
				const tileRect = tile.getBoundingClientRect();
				ctx.drawImage(
					tile,
					(tileRect.left - containerRect.left) * scaleFactor,
					(tileRect.top - containerRect.top) * scaleFactor,
					tileRect.width * scaleFactor,
					tileRect.height * scaleFactor,
				);
			}

			if (state.showMarker) {
				const map = getMapInstance();
				if (map) {
					const zoom = map.getZoom();
					const center = map.getCenter();
					const worldScale = Math.pow(2, zoom) * 256 * scaleFactor;
					const centerPoint = project(center.lat, center.lng, worldScale);
					const markerPoint = project(state.markerLat, state.markerLon, worldScale);

					const x = (canvas.width / 2) + (markerPoint.x - centerPoint.x);
					const y = (canvas.height / 2) + (markerPoint.y - centerPoint.y);
					const color = (theme as StandardTheme).textColor || theme.text || '#0f172a';

					await drawMarkerToCtx(ctx, state, x, y, color, scale);
				}
			}
		} catch (e) {
			console.error('Failed to capture tile map:', e);
		}
	}

	if (state.overlayBgType === 'vignette') {
		paintVignette(ctx, theme.background || theme.bg || '#ffffff', canvas.width, canvas.height);
	}

	return canvas;
}

/** Reads the resolved font stack off the live element so CSS variables survive cloning. */
function resolvedFont(id: string, fallback: string): string {
	const el = document.getElementById(id);
	if (!el) return fallback;
	const family = window.getComputedStyle(el).fontFamily;
	return family || fallback;
}

function drawWatermark(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const { width, height } = canvas;
	const diagonal = Math.sqrt(width * width + height * height);
	const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.055));

	ctx.save();
	ctx.translate(width / 2, height / 2);
	ctx.rotate(-Math.PI / 6);
	ctx.font = `700 ${fontSize}px sans-serif`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// Dense enough to be impractical to crop out, sparse enough that the buyer
	// can still judge the poster they are deciding whether to pay for.
	const stepX = fontSize * 13;
	const stepY = fontSize * 7;
	const cols = Math.ceil(diagonal / stepX) + 1;
	const rows = Math.ceil(diagonal / stepY) + 1;

	for (let row = -rows; row <= rows; row++) {
		for (let col = -cols; col <= cols; col++) {
			const offset = row % 2 === 0 ? 0 : stepX / 2;
			// Painted twice so it stays legible on both light and dark themes.
			ctx.fillStyle = 'rgba(255, 255, 255, 0.30)';
			ctx.fillText('STHANAM  PREVIEW', col * stepX + offset, row * stepY);
			ctx.fillStyle = 'rgba(0, 0, 0, 0.13)';
			ctx.fillText('STHANAM  PREVIEW', col * stepX + offset + 2, row * stepY + 2);
		}
	}
	ctx.restore();
}

/**
 * Renders the poster to a canvas at the tier's resolution.
 * Does not download — callers decide what to do with the result.
 */
export async function renderPoster(opts: ExportOptions): Promise<HTMLCanvasElement> {
	const { state, tier, theme, onProgress } = opts;

	const element = document.getElementById('poster-container');
	if (!element) throw new Error('Poster container is not mounted');

	const requested = resolveOutputSize(tier, state.width, state.height);
	const { width: targetWidth, height: targetHeight } = clampToCanvasLimits(requested.width, requested.height);

	const baseWidth = element.offsetWidth || state.width;
	const baseHeight = element.offsetHeight || state.height;
	const scale = baseWidth > 0 ? targetWidth / baseWidth : 1;

	const matLogical = state.matEnabled ? (state.matWidth || 0) : 0;
	const snapWidth = Math.max(1, Math.round((baseWidth - 2 * matLogical) * scale));
	const snapHeight = Math.max(1, Math.round((baseHeight - 2 * matLogical) * scale));

	onProgress?.('Rendering map…');
	const snapshotCanvas = await captureMapSnapshot(state, theme, snapWidth, snapHeight, scale);

	onProgress?.('Setting type…');
	if (document.fonts?.ready) {
		try { await document.fonts.ready; } catch { /* font loading is best-effort */ }
	}

	const textColor = theme.text || (theme as StandardTheme).textColor || '#000000';
	const bgColor = theme.bg || theme.background || '#ffffff';

	const cityFont = resolvedFont('display-city', state.cityFont);
	const countryFont = resolvedFont('display-country', state.countryFont);
	const coordsFont = resolvedFont('display-coords', state.coordsFont);

	const html2canvas = (await import('html2canvas')).default;

	const canvas = await html2canvas(element, {
		useCORS: true,
		scale,
		logging: false,
		backgroundColor: bgColor,
		width: Math.round(baseWidth),
		height: Math.round(baseHeight),
		windowWidth: Math.round(baseWidth),
		windowHeight: Math.round(baseHeight),
		imageTimeout: 0,
		ignoreElements: (el) =>
			el.id === 'map-preview' ||
			el.id === 'artistic-map' ||
			el.classList.contains('leaflet-control-container'),
		onclone: (clonedDoc) => {
			const clonedContainer = clonedDoc.getElementById('poster-container');
			const clonedScaler = clonedDoc.getElementById('poster-scaler');

			clonedDoc.body.style.width = `${Math.round(baseWidth)}px`;
			clonedDoc.body.style.height = `${Math.round(baseHeight)}px`;
			clonedDoc.body.style.margin = '0';
			clonedDoc.body.style.overflow = 'visible';
			clonedDoc.body.style.background = 'transparent';

			if (clonedScaler) {
				clonedScaler.style.transform = 'none';
				clonedScaler.style.width = `${Math.round(baseWidth)}px`;
				clonedScaler.style.height = `${Math.round(baseHeight)}px`;
				clonedScaler.style.margin = '0';
				clonedScaler.style.padding = '0';
			}

			if (clonedContainer) {
				clonedContainer.style.transform = 'none';
				clonedContainer.style.width = `${Math.round(baseWidth)}px`;
				clonedContainer.style.height = `${Math.round(baseHeight)}px`;
				clonedContainer.style.position = 'relative';
				clonedContainer.style.margin = '0';
				clonedContainer.style.boxShadow = 'none';
				clonedContainer.style.borderRadius = '0';
				clonedContainer.style.overflow = 'hidden';
				clonedContainer.style.backgroundColor = bgColor;

				// The live map layers are replaced by the composited snapshot.
				for (const id of ['map-preview', 'artistic-map', 'vignette-overlay']) {
					const el = clonedDoc.getElementById(id);
					if (el) el.style.display = 'none';
				}

				if (snapshotCanvas) {
					snapshotCanvas.style.position = 'absolute';
					snapshotCanvas.style.top = `${matLogical}px`;
					snapshotCanvas.style.left = `${matLogical}px`;
					snapshotCanvas.style.width = `${baseWidth - 2 * matLogical}px`;
					snapshotCanvas.style.height = `${baseHeight - 2 * matLogical}px`;
					snapshotCanvas.style.objectFit = 'cover';
					snapshotCanvas.style.zIndex = '0';
					snapshotCanvas.style.display = 'block';
					clonedContainer.prepend(snapshotCanvas);
				}

				const clonedBorder = clonedDoc.getElementById('mat-border');
				if (clonedBorder) {
					if (state.matEnabled && state.matShowBorder) {
						clonedBorder.style.display = 'block';
						clonedBorder.style.top = `${matLogical}px`;
						clonedBorder.style.left = `${matLogical}px`;
						clonedBorder.style.right = `${matLogical}px`;
						clonedBorder.style.bottom = `${matLogical}px`;
						clonedBorder.style.border = `${state.matBorderWidth || 1}px solid ${textColor}`;
						clonedBorder.style.opacity = String(state.matBorderOpacity ?? 1);
						clonedBorder.style.zIndex = '6';
					} else {
						clonedBorder.style.display = 'none';
					}
				}
			}

			const overlay = clonedDoc.getElementById('poster-overlay');
			if (overlay) {
				overlay.style.cursor = 'default';
				overlay.style.zIndex = '10';
			}

			const applyText = (id: string, font: string, visible: boolean) => {
				const el = clonedDoc.getElementById(id);
				if (!el) return;
				el.style.transform = 'none';
				el.style.color = textColor;
				el.style.fontFamily = font;
				if (!visible) el.style.display = 'none';
			};

			applyText('display-city', cityFont, true);
			applyText('display-country', countryFont, state.showCountry !== false);
			applyText('display-coords', coordsFont, state.showCoords !== false);

			const divider = clonedDoc.getElementById('poster-divider');
			if (divider) {
				divider.style.transform = 'none';
				divider.style.backgroundColor = textColor;
				if (state.showCountry === false && state.showCoords === false) {
					divider.style.display = 'none';
				}
			}

			const attr = clonedDoc.getElementById('poster-attribution');
			if (attr) {
				attr.style.color = textColor;
				attr.style.right = `${matLogical + 12}px`;
				attr.style.bottom = `${matLogical + 12}px`;
				attr.style.opacity = '0.35';
			}
		},
	});

	if (tier.watermark) {
		onProgress?.('Adding preview watermark…');
		drawWatermark(canvas);
	}

	// The artistic container was resized mid-capture; put the preview back.
	invalidateMapSize();

	return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality = 1): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the poster image'))),
			type,
			quality,
		);
	});
}

export async function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
	const blob = await canvasToBlob(canvas);
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.download = filename;
	link.href = url;
	document.body.appendChild(link);
	link.click();
	link.remove();
	// Give the browser a beat to start the download before revoking.
	setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function buildFilename(state: MapState, tier: Tier): string {
	// \p{M} keeps Devanagari matras attached — without it मुंबई becomes मबई.
	const city = (state.cityOverride || state.city || 'poster')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^\p{L}\p{M}\p{N}-]/gu, '');
	return `Sthanam-${city || 'poster'}-${tier.id}-${Date.now()}.png`;
}
