import { state, updateState } from '../../core/state.js';
import { updateMapPosition } from '../../map/map-init.js';
import { searchLocation } from '../../map/geocoder.js';

export function setupTextControls() {
	const searchInput = document.getElementById('search-input');
	const searchResults = document.getElementById('search-results');
	const searchLoading = document.getElementById('search-loading');
	const latInput = document.getElementById('lat-input');
	const lonInput = document.getElementById('lon-input');
	const cityOverrideInput = document.getElementById('city-override-input');
	const countryOverrideInput = document.getElementById('country-override-input');
	const cityFontSelect = document.getElementById('city-font-select');
	const countryFontSelect = document.getElementById('country-font-select');
	const coordsFontSelect = document.getElementById('coords-font-select');
	const toggleCountryBtn = document.getElementById('toggle-country-btn');
	const toggleCoordsBtn = document.getElementById('toggle-coords-btn');

	let searchTimeout;
	let currentSearchController = null;
	let searchRequestId = 0;

	if (searchInput) {
		searchInput.addEventListener('input', (e) => {
			clearTimeout(searchTimeout);
			const query = e.target.value;
			if (!query || query.length < 2) {
				if (searchResults) searchResults.classList.add('hidden');
				if (currentSearchController) {
					try { currentSearchController.abort(); } catch (err) { }
					currentSearchController = null;
				}
				return;
			}

			searchTimeout = setTimeout(async () => {
				if (currentSearchController) {
					try { currentSearchController.abort(); } catch (err) { }
				}
				const controller = new AbortController();
				currentSearchController = controller;
				const thisRequestId = ++searchRequestId;

				if (searchLoading) searchLoading.classList.remove('hidden');

				let results = [];
				try {
					results = await searchLocation(query, { limit: 15, signal: controller.signal });
				} catch (err) {
					results = [];
				}

				if (thisRequestId !== searchRequestId) return;

				if (searchLoading) searchLoading.classList.add('hidden');

				if (results && results.length > 0) {
					searchResults.innerHTML = results.map(r => `
			<div class="px-4 py-2.5 cursor-pointer text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors duration-150 border-b border-white/5 last:border-0" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.shortName}" data-country="${r.country || ''}">
				<span class="block font-medium">${r.name}</span>
			</div>
			`).join('');
					searchResults.classList.remove('hidden');
				} else {
					searchResults.classList.add('hidden');
				}

				if (currentSearchController === controller) currentSearchController = null;
			}, 400);
		});
	}

	let lastSelectionAt = 0;
	function selectResultElement(item) {
		const lat = parseFloat(item.dataset.lat);
		const lon = parseFloat(item.dataset.lon);
		const name = item.dataset.name;
		const country = item.dataset.country;

		updateState({
			city: (name || '').toUpperCase(),
			country: (country || '').toUpperCase(),
			lat,
			lon,
			markerLat: lat,
			markerLon: lon
		});

		updateMapPosition(lat, lon);

		searchInput.value = name;
		searchResults.classList.add('hidden');
		lastSelectionAt = Date.now();

		if (window.innerWidth < 768) {
			const sidebar = document.getElementById('main-sidebar');
			if (sidebar) {
				sidebar.classList.remove('max-md:opacity-100', 'max-md:translate-y-0', 'max-md:pointer-events-auto');
				sidebar.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
				document.body.classList.remove('mobile-tab-active');
			}
		}
	}

	if (searchResults) {
		searchResults.addEventListener('pointerdown', (e) => {
			const item = e.target.closest('[data-lat]');
			if (item) {
				selectResultElement(item);
				e.preventDefault();
			}
		});

		searchResults.addEventListener('click', (e) => {
			if (Date.now() - lastSelectionAt < 500) return;
			const item = e.target.closest('[data-lat]');
			if (item) selectResultElement(item);
		});
	}

	let searchHighlightIdx = -1;

	function getSearchItems() {
		return Array.from(searchResults.querySelectorAll('[data-lat]'));
	}

	function applySearchHighlight(items, idx) {
		items.forEach((el, i) => {
			if (i === idx) {
				el.classList.add('bg-white/15', 'ring-1', 'ring-white/30');
			} else {
				el.classList.remove('bg-white/15', 'ring-1', 'ring-white/30');
			}
		});
	}

	if (searchInput) {
		searchInput.addEventListener('keydown', (e) => {
			if (searchResults.classList.contains('hidden')) return;
			const items = getSearchItems();
			if (!items.length) return;

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				searchHighlightIdx = Math.min(searchHighlightIdx + 1, items.length - 1);
				applySearchHighlight(items, searchHighlightIdx);
				items[searchHighlightIdx]?.scrollIntoView({ block: 'nearest' });
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				searchHighlightIdx = Math.max(searchHighlightIdx - 1, 0);
				applySearchHighlight(items, searchHighlightIdx);
				items[searchHighlightIdx]?.scrollIntoView({ block: 'nearest' });
			} else if (e.key === 'Enter') {
				e.preventDefault();
				const target = searchHighlightIdx >= 0 ? items[searchHighlightIdx] : items[0];
				if (target) selectResultElement(target);
				searchHighlightIdx = -1;
			} else if (e.key === 'Escape') {
				searchResults.classList.add('hidden');
				searchHighlightIdx = -1;
			}
		});
	}

	if (searchResults) {
		searchResults.addEventListener('animationend', () => { searchHighlightIdx = -1; }, { capture: true });
	}

	function sanitizeCoordInput(v) {
		if (!v) return v;
		v = String(v).replace(/,/g, '.');
		v = v.replace(/[^0-9.\-]/g, '');
		const hasMinus = v.indexOf('-') !== -1;
		v = v.replace(/\-/g, '');
		if (hasMinus) v = '-' + v;
		const firstDot = v.indexOf('.');
		if (firstDot !== -1) {
			v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
		}
		return v;
	}

	if (latInput) {
		latInput.addEventListener('change', (e) => {
			const lat = parseFloat(e.target.value);
			updateState({ lat, markerLat: lat });
			updateMapPosition(lat, state.lon);
		});
		latInput.addEventListener('input', (e) => {
			const cleaned = sanitizeCoordInput(e.target.value);
			if (cleaned !== e.target.value) e.target.value = cleaned;
		});
	}

	if (lonInput) {
		lonInput.addEventListener('change', (e) => {
			const lon = parseFloat(e.target.value);
			updateState({ lon, markerLon: lon });
			updateMapPosition(state.lat, lon);
		});
		lonInput.addEventListener('input', (e) => {
			const cleaned = sanitizeCoordInput(e.target.value);
			if (cleaned !== e.target.value) e.target.value = cleaned;
		});
	}

	if (cityOverrideInput) {
		cityOverrideInput.value = state.cityOverride || '';
		cityOverrideInput.addEventListener('input', (e) => {
			const v = e.target.value;
			updateState({ cityOverride: v ? v.toUpperCase() : '' });
		});
	}

	if (countryOverrideInput) {
		countryOverrideInput.value = state.countryOverride || '';
		countryOverrideInput.addEventListener('input', (e) => {
			const v = e.target.value;
			updateState({ countryOverride: v ? v.toUpperCase() : '' });
		});
	}

	if (toggleCountryBtn) {
		toggleCountryBtn.addEventListener('click', () => {
			updateState({ showCountry: !state.showCountry });
		});
	}

	if (toggleCoordsBtn) {
		toggleCoordsBtn.addEventListener('click', () => {
			updateState({ showCoords: !state.showCoords });
		});
	}

	if (cityFontSelect) {
		cityFontSelect.addEventListener('change', (e) => {
			updateState({ cityFont: e.target.value });
		});
	}

	if (countryFontSelect) {
		countryFontSelect.addEventListener('change', (e) => {
			updateState({ countryFont: e.target.value });
		});
	}

	if (coordsFontSelect) {
		coordsFontSelect.addEventListener('change', (e) => {
			updateState({ coordsFont: e.target.value });
		});
	}
}
