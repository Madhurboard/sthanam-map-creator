import './style.css';
import { subscribe, state, getSelectedTheme } from './src/core/state.js';
import { initMap, updateMapTheme, invalidateMapSize, waitForTilesLoad, waitForArtisticIdle, updateMarkerVisibility, updateMarkerPosition } from './src/map/map-init.js';
import { setupControls, updatePreviewStyles } from './src/ui/form.js';
import { exportToPNG } from './src/core/export.js';

const initialTheme = getSelectedTheme();
initMap('map-preview', [state.lat, state.lon], state.zoom, initialTheme.tileUrl);

const syncUI = setupControls();

const exportBtn = document.getElementById('export-btn');
const posterContainer = document.getElementById('poster-container');



let _exportCheckInProgress = false;
const originalExportInner = exportBtn ? exportBtn.innerHTML : '';
let exportLoadingMode = null;

subscribe((currentState) => {
	if (currentState.renderMode === 'tile') {
		const theme = getSelectedTheme();
		const tileUrl = currentState.showLabels ? theme.tileUrl : theme.tileUrlNoLabels;
		updateMapTheme(tileUrl);
	}

	updatePreviewStyles(currentState);

	updateMarkerVisibility(currentState.showMarker);
	updateMarkerPosition(currentState.markerLat, currentState.markerLon);

	syncUI(currentState);
	ensurePreviewReady();
});

function setExportButtonLoading(loading, mode = 'loading') {
	if (!exportBtn) return;
	if (loading && mode === 'loading' && exportLoadingMode === 'processing') return;

	if (loading) exportLoadingMode = mode; else exportLoadingMode = null;

	exportBtn.disabled = !!loading;
	exportBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
	exportBtn.classList.toggle('opacity-60', !!loading);
	exportBtn.classList.toggle('cursor-not-allowed', !!loading);
	if (loading) {
		exportBtn.innerHTML = `
			<div class="flex items-center justify-center space-x-3">
				<div class="flex items-center space-x-1">
					<div class="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style="animation-delay: 0s"></div>
					<div class="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
					<div class="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
				</div>
				<span>${mode === 'processing' ? 'Processing...' : 'Loading...'}</span>
			</div>
		`;
	} else {
		exportBtn.innerHTML = originalExportInner;
	}
}

async function ensurePreviewReady() {
	if (_exportCheckInProgress) return;
	if (exportLoadingMode === 'processing') return;
	_exportCheckInProgress = true;
	try {
		setExportButtonLoading(true, 'loading');
		if (state.renderMode === 'artistic') {
			await waitForArtisticIdle(3000);
		} else {
			await waitForTilesLoad(5000);
		}
	} finally {
		setExportButtonLoading(false);
		_exportCheckInProgress = false;
	}
}

// Export resolution selector
const exportResBtns = document.querySelectorAll('.export-res-btn');
let exportMultiplier = 1;

exportResBtns.forEach(btn => {
	btn.addEventListener('click', () => {
		exportMultiplier = parseInt(btn.dataset.multiplier) || 1;
		exportResBtns.forEach(b => {
			if (b === btn) {
				b.classList.add('bg-accent', 'text-white', 'ring-2', 'ring-accent/30');
				b.classList.remove('bg-white/10', 'text-white/80');
			} else {
				b.classList.remove('bg-accent', 'text-white', 'ring-2', 'ring-accent/30');
				b.classList.add('bg-white/10', 'text-white/80');
			}
		});
	});
});

exportBtn.addEventListener('click', async () => {
	const filename = `Sthanam-${state.city.replace(/\s+/g, '-')}-${Date.now()}.png`;
	setExportButtonLoading(true, 'processing');
	try {
		await exportToPNG(posterContainer, filename, exportMultiplier > 1 ? exportMultiplier : null);
	} finally {
		setExportButtonLoading(false);
	}
});

ensurePreviewReady();

window.addEventListener('resize', () => {
	updatePreviewStyles(state);
});

setTimeout(invalidateMapSize, 800);
