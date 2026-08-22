'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useMapState, useUpdateState } from '@/lib/map-state';
import { themes } from '@/lib/themes';
import { artisticThemes } from '@/lib/artistic-themes';
import { formatCoords } from '@/lib/geocoder';
import { containsDevanagari } from '@/lib/fonts';
import { hexToRgba } from '@/lib/utils';
import { useDraggableOverlay } from '@/hooks/useDraggableOverlay';
import {
	initEngine,
	destroyEngine,
	setStateUpdater,
	updateMapPosition,
	updateMapTheme,
	updateArtisticStyle,
	updateMarkerStyles,
	invalidateMapSize,
} from '@/lib/map-engine';
import type { StandardTheme, ArtisticTheme } from '@/types';

/** Type scale per overlay size, expressed against a 1080px-wide poster. */
const OVERLAY_SIZES = {
	small: { pad: 24, city: 40, country: 14, coords: 12 },
	medium: { pad: 48, city: 64, country: 20, coords: 16 },
	large: { pad: 80, city: 96, country: 24, coords: 20 },
} as const;

/** Long place names have to give back some size or they overflow the poster. */
function lengthFactor(text: string): number {
	const len = text.length;
	if (len <= 8) return 1;
	if (len <= 12) return 0.78;
	if (len <= 18) return 0.56;
	if (len <= 26) return 0.42;
	return 0.32;
}

export default function Poster() {
	const { state, hydrated } = useMapState();
	const updateState = useUpdateState();

	const wrapperRef = useRef<HTMLDivElement>(null);
	const scalerRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const tileRef = useRef<HTMLDivElement>(null);
	const artisticRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);

	const [previewScale, setPreviewScale] = useState(1);
	const initialisedRef = useRef(false);

	const theme = (themes[state.theme as keyof typeof themes] || themes.minimal) as StandardTheme;
	const artisticTheme = (artisticThemes[state.artisticTheme as keyof typeof artisticThemes] || artisticThemes.arctic_frost) as ArtisticTheme;
	const isArtistic = state.renderMode === 'artistic';
	const activeTheme: StandardTheme | ArtisticTheme = isArtistic ? artisticTheme : theme;

	const bgColor = activeTheme.bg || activeTheme.background || '#ffffff';
	const textColor = activeTheme.text || (activeTheme as StandardTheme).textColor || '#000000';

	const matWidth = state.matEnabled ? (state.matWidth || 0) : 0;

	// Keep the engine's state updater pointing at the live dispatch.
	useEffect(() => {
		setStateUpdater(updateState);
	}, [updateState]);

	// Boot both map engines once the saved position is known.
	useEffect(() => {
		if (!hydrated || initialisedRef.current) return;
		if (!tileRef.current || !artisticRef.current) return;

		initialisedRef.current = true;
		initEngine({
			tileContainer: tileRef.current,
			artisticContainer: artisticRef.current,
			center: [state.lat, state.lon],
			zoom: state.zoom,
			tileUrl: state.showLabels ? theme.tileUrl : theme.tileUrlNoLabels,
			markerLat: state.markerLat,
			markerLon: state.markerLon,
		}).then(() => {
			updateArtisticStyle(artisticTheme);
			updateMarkerStyles(state, activeTheme);
			invalidateMapSize();
		}).catch(err => console.error('Map engine failed to start:', err));

		return () => {
			destroyEngine();
			initialisedRef.current = false;
		};
		// Intentionally boots once; later changes flow through the effects below.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hydrated]);

	// Raster tile URL follows theme + label visibility.
	useEffect(() => {
		updateMapTheme(state.showLabels ? theme.tileUrl : theme.tileUrlNoLabels);
	}, [theme, state.showLabels]);

	useEffect(() => {
		if (isArtistic) updateArtisticStyle(artisticTheme);
	}, [isArtistic, artisticTheme]);

	useEffect(() => {
		updateMarkerStyles(state, activeTheme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.showMarker, state.markerIcon, state.markerSize, state.markerLat, state.markerLon, state.renderMode, activeTheme]);

	// Zoom slider and search results drive the map; map drags drive state.
	useEffect(() => {
		updateMapPosition(state.lat, state.lon, state.zoom, { animate: false });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.lat, state.lon, state.zoom]);

	// Switching modes or resizing the poster leaves the hidden map mis-measured.
	useEffect(() => {
		const timers = [
			setTimeout(invalidateMapSize, 60),
			setTimeout(() => {
				invalidateMapSize();
				updateMapPosition(state.lat, state.lon, state.zoom, { animate: false });
			}, 400),
		];
		return () => timers.forEach(clearTimeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.width, state.height, state.matEnabled, state.matWidth, state.renderMode]);

	// Fit the full-resolution poster into whatever space the viewport allows.
	useLayoutEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const fit = () => {
			const isMobile = window.innerWidth < 768;
			const padding = isMobile ? 32 : 96;
			const availableW = wrapper.clientWidth - padding;
			const availableH = wrapper.clientHeight - padding;
			if (availableW <= 0 || availableH <= 0) return;
			setPreviewScale(Math.min(availableW / state.width, availableH / state.height, 1));
		};

		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(wrapper);
		window.addEventListener('resize', fit);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', fit);
		};
	}, [state.width, state.height]);

	const handleOverlayMove = useCallback((x: number, y: number) => {
		updateState({ overlayX: x, overlayY: y });
	}, [updateState]);

	useDraggableOverlay(overlayRef, containerRef, handleOverlayMove, state.overlaySize !== 'none');

	const cityText = (state.cityOverride || state.city || '').trim();
	const countryText = (state.countryOverride || state.country || '').trim();
	const coordsText = formatCoords(state.lat, state.lon);

	const sizes = useMemo(() => {
		const key = (state.overlaySize === 'none' ? 'medium' : state.overlaySize) as keyof typeof OVERLAY_SIZES;
		const preset = OVERLAY_SIZES[key] || OVERLAY_SIZES.medium;
		const baseScale = state.width / 1080;
		const city = preset.city * baseScale * lengthFactor(cityText);
		return {
			pad: preset.pad * baseScale,
			city,
			country: preset.country * baseScale,
			coords: preset.coords * baseScale,
			gap: 8 * baseScale,
			// Tied to the type size rather than a flat value: html2canvas measures
			// tall display faces slightly shorter than the browser does, and a
			// fixed margin lets the divider ride up into the title on export.
			cityMargin: Math.max(16 * baseScale, city * 0.42),
			dividerMargin: Math.max(12 * baseScale, city * 0.26),
			dividerWidth: 128 * baseScale,
		};
	}, [state.overlaySize, state.width, cityText]);

	const vignetteBackground = state.overlayBgType === 'vignette'
		? `linear-gradient(to bottom, ${hexToRgba(bgColor, 1)} 0%, ${hexToRgba(bgColor, 1)} 3%, ${hexToRgba(bgColor, 0)} 20%, ${hexToRgba(bgColor, 0)} 80%, ${hexToRgba(bgColor, 1)} 97%, ${hexToRgba(bgColor, 1)} 100%)`
		: 'none';

	const showCountry = state.showCountry !== false && countryText.length > 0;
	const showCoords = state.showCoords !== false;

	// `position` is set inline because the vendor map stylesheets also target
	// these elements and would otherwise collapse them to zero height.
	const mapInset = {
		position: 'absolute' as const,
		top: matWidth,
		left: matWidth,
		right: matWidth,
		bottom: matWidth,
	};

	// Devanagari clusters carry matras above and below the consonant; tracking
	// them apart the way display Latin wants breaks the word into fragments.
	const cityTracking = containsDevanagari(cityText) ? '0.04em' : '0.25em';
	const countryTracking = containsDevanagari(countryText) ? '0.12em' : '0.4em';

	return (
		<div ref={wrapperRef} className="flex-1 relative flex items-center justify-center overflow-hidden">
			<div
				id="poster-scaler"
				ref={scalerRef}
				className="origin-center transition-transform duration-300 ease-out"
				style={{ transform: `scale(${previewScale})` }}
			>
				<div
					id="poster-container"
					ref={containerRef}
					className="relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/10"
					style={{
						width: `${state.width}px`,
						height: `${state.height}px`,
						backgroundColor: bgColor,
					}}
				>
					<div
						id="map-preview"
						ref={tileRef}
						className="absolute z-0"
						style={{ ...mapInset, visibility: isArtistic ? 'hidden' : 'visible', pointerEvents: isArtistic ? 'none' : 'auto' }}
					/>
					<div
						id="artistic-map"
						ref={artisticRef}
						className="absolute z-[1]"
						style={{ ...mapInset, visibility: isArtistic ? 'visible' : 'hidden', pointerEvents: isArtistic ? 'auto' : 'none' }}
					/>

					<div
						id="mat-border"
						className="absolute pointer-events-none z-[6]"
						style={{
							...mapInset,
							display: state.matEnabled && state.matShowBorder ? 'block' : 'none',
							border: `${state.matBorderWidth || 1}px solid ${textColor}`,
							opacity: state.matBorderOpacity ?? 1,
						}}
					/>

					<div
						id="vignette-overlay"
						className="absolute z-[5] pointer-events-none"
						style={{
							...mapInset,
							display: state.overlayBgType === 'vignette' ? 'block' : 'none',
							background: vignetteBackground,
						}}
					/>

					<div
						id="poster-overlay"
						ref={overlayRef}
						className="absolute z-10 flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing select-none touch-none"
						style={{
							display: state.overlaySize === 'none' ? 'none' : 'flex',
							left: `${state.overlayX * 100}%`,
							top: `${state.overlayY * 100}%`,
							transform: 'translate(-50%, -50%)',
							maxWidth: '90%',
							padding: `${sizes.pad}px`,
						}}
					>
						<h2
							id="display-city"
							className="font-bold uppercase break-words w-full"
							style={{
								color: textColor,
								fontFamily: state.cityFont,
								fontSize: `${sizes.city}px`,
								// Explicit so the preview and the export agree.
								lineHeight: 1.2,
								letterSpacing: cityTracking,
								paddingLeft: cityTracking,
								marginBottom: `${sizes.cityMargin}px`,
							}}
						>
							{cityText}
						</h2>

						<div
							id="poster-divider"
							style={{
								height: '1px',
								width: `${sizes.dividerWidth}px`,
								backgroundColor: textColor,
								opacity: 0.35,
								marginBottom: `${sizes.dividerMargin}px`,
								display: showCountry || showCoords ? 'block' : 'none',
							}}
						/>

						<div className="flex flex-col items-center" style={{ rowGap: `${sizes.gap}px` }}>
							<p
								id="display-country"
								className="font-bold uppercase leading-normal"
								style={{
									color: textColor,
									fontFamily: state.countryFont,
									fontSize: `${sizes.country}px`,
									letterSpacing: countryTracking,
									paddingLeft: countryTracking,
									display: showCountry ? 'block' : 'none',
								}}
							>
								{countryText}
							</p>
							<p
								id="display-coords"
								className="font-medium leading-normal"
								style={{
									color: textColor,
									fontFamily: state.coordsFont,
									fontSize: `${sizes.coords}px`,
									letterSpacing: '0.4em',
									paddingLeft: '0.4em',
									opacity: 0.75,
									display: showCoords ? 'block' : 'none',
								}}
							>
								{coordsText}
							</p>
						</div>
					</div>

					<div
						id="poster-attribution"
						className="absolute z-20 pointer-events-none uppercase tracking-widest"
						style={{
							color: textColor,
							opacity: 0.35,
							right: `${matWidth + 12}px`,
							bottom: `${matWidth + 12}px`,
							fontSize: `${Math.max(8, 8 * (state.width / 1080))}px`,
						}}
					>
						© OpenStreetMap Contributors
					</div>
				</div>
			</div>
		</div>
	);
}
