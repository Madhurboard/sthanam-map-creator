import { state, updateState } from '../../core/state.js';
import { updateMapPosition, updateMarkerStyles } from '../../map/map-init.js';

export function setupTweakControls() {
	const zoomSlider = document.getElementById('zoom-slider');
	const labelsToggle = document.getElementById('show-labels-toggle');
	
	const markerToggle = document.getElementById('show-marker-toggle');
	const markerSettings = document.getElementById('marker-settings');
	const markerIconSelect = document.getElementById('marker-icon-select');
	const markerSizeSlider = document.getElementById('marker-size-slider');
	const markerSizeValue = document.getElementById('marker-size-value');
	const pinOptions = document.querySelectorAll('.pin-option');

	const overlayPosBtns = document.querySelectorAll('.overlay-pos-btn');
	const resetOverlayPosBtn = document.getElementById('reset-overlay-pos-btn');

	if (zoomSlider) {
		zoomSlider.addEventListener('input', (e) => {
			const zoom = parseInt(e.target.value);
			updateState({ zoom });
			updateMapPosition(undefined, undefined, zoom);
		});
	}

	if (labelsToggle) {
		labelsToggle.addEventListener('change', (e) => {
			updateState({ showLabels: e.target.checked });
		});
	}

	if (markerToggle) {
		markerToggle.addEventListener('change', (e) => {
			const show = e.target.checked;
			updateState({ showMarker: show });
			updateMarkerStyles(state);
			if (markerSettings) markerSettings.classList.toggle('hidden', !show);
		});
	}

	if (markerIconSelect && pinOptions.length > 0) {
		pinOptions.forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				const val = btn.dataset.value;
				markerIconSelect.value = val;
				
				pinOptions.forEach(p => {
					if (p.dataset.value === val) {
						p.classList.add('border-accent', 'bg-accent-light', 'text-accent');
						p.classList.remove('border-slate-200', 'bg-white', 'text-slate-500');
					} else {
						p.classList.remove('border-accent', 'bg-accent-light', 'text-accent');
						p.classList.add('border-slate-200', 'bg-white', 'text-slate-500');
					}
				});

				updateState({ markerIcon: val });
				updateMarkerStyles(state);
			});
		});
	}

	if (markerSizeSlider) {
		markerSizeSlider.addEventListener('input', (e) => {
			const size = parseInt(e.target.value);
			updateState({ markerSize: size / 40.0 });
			updateMarkerStyles(state);
			if (markerSizeValue) markerSizeValue.textContent = `${size}px`;
		});
	}

	if (overlayPosBtns) {
		overlayPosBtns.forEach(btn => {
			btn.addEventListener('click', () => {
				const x = parseFloat(btn.dataset.overlayX);
				const y = parseFloat(btn.dataset.overlayY);
				updateState({ overlayX: x, overlayY: y });
			});
		});
	}

	if (resetOverlayPosBtn) {
		resetOverlayPosBtn.addEventListener('click', () => {
			updateState({ overlayX: 0.5, overlayY: 0.85 });
		});
	}
}
