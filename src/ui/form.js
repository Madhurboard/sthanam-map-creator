import { state, getSelectedTheme, getSelectedArtisticTheme } from '../core/state.js';
import { artisticThemes } from '../core/artistic-themes.js';
import { themes } from '../core/themes.js';
import { setupTabs } from './tabs.js';
import { setupFontPickers } from './fontPicker.js';
import { setupModals } from './modals.js';
import { setupDraggableOverlay } from './draggable.js';

import { setupThemeControls } from './controls/theme-controls.js';
import { setupLayoutControls } from './controls/layout-controls.js';
import { setupTextControls } from './controls/text-controls.js';
import { setupTweakControls } from './controls/tweak-controls.js';

export { updatePreviewStyles } from './preview-updater.js';

export function setupControls() {
	setupThemeControls();
	setupLayoutControls();
	setupTextControls();
	setupTweakControls();
	
	setupModals();
	setupDraggableOverlay();
	setupTabs();
	setupFontPickers();

	const cityOverrideInput = document.getElementById('city-override-input');
	const countryOverrideInput = document.getElementById('country-override-input');
	const latInput = document.getElementById('lat-input');
	const lonInput = document.getElementById('lon-input');
	const zoomSlider = document.getElementById('zoom-slider');
	const zoomValue = document.getElementById('zoom-value');
	const modeTile = document.getElementById('mode-tile');
	const modeArtistic = document.getElementById('mode-artistic');
	const standardThemeConfig = document.getElementById('standard-theme-config');
	const artisticThemeConfig = document.getElementById('artistic-theme-config');
	const labelsControl = document.getElementById('labels-control');
	const artisticMainGrid = document.getElementById('artistic-main-grid');
	const artisticDesc = document.getElementById('artistic-desc');
	const labelsToggle = document.getElementById('show-labels-toggle');
	const overlayBgButtons = document.querySelectorAll('.overlay-bg-btn');
	const overlaySizeButtons = document.querySelectorAll('.overlay-size-btn');
	const customW = document.getElementById('custom-w');
	const customH = document.getElementById('custom-h');
	const markerToggle = document.getElementById('show-marker-toggle');
	const markerSettings = document.getElementById('marker-settings');
	const markerIconSelect = document.getElementById('marker-icon-select');
	const markerSizeSlider = document.getElementById('marker-size-slider');
	const markerSizeValue = document.getElementById('marker-size-value');
	const presetBtns = document.querySelectorAll('.preset-btn');
	const otherPresetsBtn = document.getElementById('other-presets-btn');
	const exportBtn = document.getElementById('export-btn');

	const matToggle = document.getElementById('mat-toggle');
	const matSettings = document.getElementById('mat-settings');
	const matWidthSlider = document.getElementById('mat-width-slider');
	const matWidthValue = document.getElementById('mat-width-value');
	const matBorderToggle = document.getElementById('mat-border-toggle');
	const matBorderSettings = document.getElementById('mat-border-settings');
	const matBorderWidthSlider = document.getElementById('mat-border-width-slider');
	const matBorderWidthValue = document.getElementById('mat-border-width-value');
	const matBorderOpacitySlider = document.getElementById('mat-border-opacity-slider');
	const matBorderOpacityValue = document.getElementById('mat-border-opacity-value');
	const overlayPositionGroup = document.getElementById('overlay-position-group');

	const paletteFor = (t) => {
		const candidates = [t.road_motorway, t.road_primary, t.road_secondary, t.road_tertiary, t.text, t.bg];
		return candidates.map(c => c || '#cccccc').slice(0, 4);
	};

	return (currentState) => {
		if (cityOverrideInput) cityOverrideInput.value = currentState.cityOverride || '';
		if (countryOverrideInput) countryOverrideInput.value = currentState.countryOverride || '';
		
		const syncFontPicker = (target, val) => {
			const picker = document.querySelector(`.font-picker-container[data-target="${target}"]`);
			if (!picker) return;
			const btn = picker.querySelector('.font-picker-btn');
			const hiddenInput = picker.querySelector('input[type="hidden"]');
			const targetLabel = btn.querySelector('span');
			const options = picker.querySelectorAll('.font-option');
			
			hiddenInput.value = val;
			let found = false;
			options.forEach(opt => {
				if (opt.dataset.value === val) {
					targetLabel.textContent = opt.textContent;
					btn.style.fontFamily = opt.style.fontFamily;
					found = true;
				}
			});
			if (!found) { // Fallback if font missing from list
				targetLabel.textContent = val.split(',')[0].replace(/['"]/g, '');
				btn.style.fontFamily = val;
			}
		};

		syncFontPicker('city-font', currentState.cityFont);
		syncFontPicker('country-font', currentState.countryFont);
		syncFontPicker('coords-font', currentState.coordsFont);

		const EYE_OPEN_SVG = `<svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
		const EYE_OFF_SVG = `<svg class="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`;

		const toggleCountryBtnSync = document.getElementById('toggle-country-btn');
		if (toggleCountryBtnSync) toggleCountryBtnSync.innerHTML = (currentState.showCountry !== false) ? EYE_OPEN_SVG : EYE_OFF_SVG;
		const toggleCoordsBtnSync = document.getElementById('toggle-coords-btn');
		if (toggleCoordsBtnSync) toggleCoordsBtnSync.innerHTML = (currentState.showCoords !== false) ? EYE_OPEN_SVG : EYE_OFF_SVG;

		const overlayPosBtnsSync = document.querySelectorAll('.overlay-pos-btn');
		const curX = currentState.overlayX !== undefined ? currentState.overlayX : 0.5;
		const curY = currentState.overlayY !== undefined ? currentState.overlayY : 0.85;

		if (overlayPositionGroup) {
			overlayPositionGroup.classList.toggle('hidden', (currentState.overlaySize || 'medium') === 'none');
		}
		const TOLERANCE = 0.02;
		overlayPosBtnsSync.forEach(btn => {
			const bx = parseFloat(btn.dataset.overlayX);
			const by = parseFloat(btn.dataset.overlayY);
			const isActive = Math.abs(curX - bx) < TOLERANCE && Math.abs(curY - by) < TOLERANCE;
			const dot = btn.querySelector('.pos-dot');
			if (isActive) {
				btn.classList.add('border-accent', 'bg-accent-light');
				btn.classList.remove('border-slate-100', 'bg-slate-50');
				if (dot) { dot.classList.add('bg-accent'); dot.classList.remove('bg-slate-300'); }
			} else {
				btn.classList.remove('border-accent', 'bg-accent-light');
				btn.classList.add('border-slate-100', 'bg-slate-50');
				if (dot) { dot.classList.remove('bg-accent'); dot.classList.add('bg-slate-300'); }
			}
		});

		if (latInput) latInput.value = currentState.lat.toFixed(6);
		if (lonInput) lonInput.value = currentState.lon.toFixed(6);
		if (zoomSlider) zoomSlider.value = currentState.zoom;
		if (zoomValue) zoomValue.textContent = currentState.zoom;

		if (currentState.renderMode === 'tile') {
			if (modeTile) modeTile.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-accent text-white shadow-sm';
			if (modeArtistic) modeArtistic.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-900';
			if (standardThemeConfig) standardThemeConfig.classList.remove('hidden');
			if (artisticThemeConfig) artisticThemeConfig.classList.add('hidden');
			if (labelsControl) labelsControl.classList.remove('hidden');
		} else {
			if (modeTile) modeTile.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-900';
			if (modeArtistic) modeArtistic.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-accent text-white shadow-sm';
			if (standardThemeConfig) standardThemeConfig.classList.add('hidden');
			if (artisticThemeConfig) artisticThemeConfig.classList.remove('hidden');
			if (labelsControl) labelsControl.classList.add('hidden');
		}

		const themePickerContainer = document.querySelector('.theme-picker-container[data-target="map-theme"]');
		if (themePickerContainer) {
			const hiddenInput = document.getElementById('theme-select');
			const label = themePickerContainer.querySelector('.selected-theme-name');
			const swatches = themePickerContainer.querySelectorAll('.selected-theme-swatches span');
			
			const currentThemeKey = currentState.theme;
			const t = themes[currentThemeKey];
			
			if (hiddenInput) hiddenInput.value = currentThemeKey;
			if (label && t) label.textContent = t.name || currentThemeKey;
			
			if (swatches.length >= 3 && t) {
				swatches[0].style.background = t.bg || '#ffffff';
				swatches[1].style.background = t.water || '#aadaff';
				swatches[2].style.background = t.road || '#cccccc';
			}
		}

		if (artisticMainGrid) {
			const mainKeys = new Set(['cyber_noir', 'golden_era', 'mangrove_maze']);
			const selectedKey = currentState.artisticTheme;
			artisticMainGrid.querySelectorAll('.art-card').forEach(btn => {
				const k = btn.dataset.key;
				let active = false;
				if (k === 'other') {
					active = !!(selectedKey && !mainKeys.has(selectedKey));
				} else {
					active = k === selectedKey;
				}
				btn.classList.toggle('border-accent', active);
				btn.classList.toggle('bg-accent-light', active);
				if (active) btn.classList.add('ring-accent'); else btn.classList.remove('ring-accent');

				if (k === 'other') {
					const spans = btn.querySelectorAll('span.w-6.h-6');
					if (selectedKey && artisticThemes[selectedKey] && !mainKeys.has(selectedKey)) {
						const p = paletteFor(artisticThemes[selectedKey]);
						spans.forEach((s, i) => { s.style.background = p[i] || '#cccccc'; });
					} else {
						spans.forEach((s) => { s.style.background = '#cccccc'; });
					}
				}
			});
		}

		const artisticTheme = getSelectedArtisticTheme();
		if (artisticDesc) artisticDesc.textContent = artisticTheme.description;

		if (labelsToggle) labelsToggle.checked = !!currentState.showLabels;
		if (overlayBgButtons && overlayBgButtons.length) {
			overlayBgButtons.forEach(b => {
				const style = b.dataset.bg;
				if (style === (currentState.overlayBgType || 'vignette')) {
					b.classList.add('bg-accent', 'text-white', 'ring-2', 'ring-accent/30');
					b.classList.remove('bg-white/10', 'text-white/80');
				} else {
					b.classList.remove('bg-accent', 'text-white', 'ring-2', 'ring-accent/30');
					b.classList.add('bg-white/10', 'text-white/80');
				}
			});
		}
		if (overlaySizeButtons && overlaySizeButtons.length) {
			overlaySizeButtons.forEach(b => {
				const s = b.dataset.size;
				if (s === (currentState.overlaySize || 'medium')) {
					b.classList.add('bg-accent', 'text-white', 'ring-2', 'ring-accent/30');
					b.classList.remove('bg-white/10', 'text-white/80');
				} else {
					b.classList.remove('bg-accent', 'text-white', 'ring-2', 'ring-accent/30');
					b.classList.add('bg-white/10', 'text-white/80');
				}
			});
		}

		if (customW) customW.value = currentState.width;
		if (customH) customH.value = currentState.height;

		if (markerToggle) markerToggle.checked = !!currentState.showMarker;
		if (markerSettings) {
			if (currentState.showMarker) markerSettings.classList.remove('hidden');
			else markerSettings.classList.add('hidden');
		}

		if (markerIconSelect) markerIconSelect.value = currentState.markerIcon || 'pin';
		const pinOpts = document.querySelectorAll('.pin-option');
		if (pinOpts.length) {
			const currentIcon = currentState.markerIcon || 'pin';
			pinOpts.forEach(p => {
				if (p.dataset.value === currentIcon) {
					p.classList.add('border-accent', 'bg-white/25', 'text-accent');
					p.classList.remove('border-white/15', 'bg-white/10', 'text-white/70');
				} else {
					p.classList.remove('border-accent', 'bg-white/25', 'text-accent');
					p.classList.add('border-white/15', 'bg-white/10', 'text-white/70');
				}
			});
		}
		if (markerSizeSlider) {
			const sizePx = Math.round((currentState.markerSize || 1) * 40);
			markerSizeSlider.value = sizePx;
			if (markerSizeValue) markerSizeValue.textContent = `${sizePx}px`;
		}

		if (matToggle) matToggle.checked = !!currentState.matEnabled;
		if (matSettings) {
			if (currentState.matEnabled) matSettings.classList.remove('hidden');
			else matSettings.classList.add('hidden');
		}
		if (matWidthSlider) matWidthSlider.value = currentState.matWidth || 40;
		if (matWidthValue) matWidthValue.textContent = `${currentState.matWidth || 40}px`;
		if (matBorderToggle) matBorderToggle.checked = !!currentState.matShowBorder;

		if (matBorderSettings) {
			if (currentState.matEnabled && currentState.matShowBorder) matBorderSettings.classList.remove('hidden');
			else matBorderSettings.classList.add('hidden');
		}
		if (matBorderWidthSlider) matBorderWidthSlider.value = currentState.matBorderWidth || 1;
		if (matBorderWidthValue) matBorderWidthValue.textContent = `${currentState.matBorderWidth || 1}px`;
		if (matBorderOpacitySlider) matBorderOpacitySlider.value = currentState.matBorderOpacity || 1;
		if (matBorderOpacityValue) matBorderOpacityValue.textContent = `${Math.round((currentState.matBorderOpacity || 1) * 100)}%`;

		let isMainPresetActive = false;
		if (presetBtns && presetBtns.length) {
			presetBtns.forEach(btn => {
				const w = parseInt(btn.dataset.width);
				const h = parseInt(btn.dataset.height);
				if (w === currentState.width && h === currentState.height) {
					btn.classList.add('bg-accent', 'text-white');
					btn.classList.remove('bg-slate-50');
					isMainPresetActive = true;
				} else {
					btn.classList.remove('bg-accent', 'text-white');
					btn.classList.add('bg-slate-50');
				}
			});
		}

		if (otherPresetsBtn) {
			if (!isMainPresetActive) {
				otherPresetsBtn.classList.add('bg-accent', 'text-white');
				otherPresetsBtn.classList.remove('bg-slate-50');
			} else {
				otherPresetsBtn.classList.remove('bg-accent', 'text-white');
				otherPresetsBtn.classList.add('bg-slate-50');
			}
		}

		if (exportBtn) {
			exportBtn.classList.remove('bg-slate-900');
			exportBtn.classList.add('bg-accent', 'text-white');
		}
	};
}
