import { state, updateState, getSelectedTheme, getSelectedArtisticTheme } from '../../core/state.js';
import { artisticThemes } from '../../core/artistic-themes.js';
import { themes } from '../../core/themes.js';
import { updateArtisticStyle, updateMapTheme, invalidateMapSize } from '../../map/map-init.js';

export function setupThemeControls() {
	const modeTile = document.getElementById('mode-tile');
	const modeArtistic = document.getElementById('mode-artistic');
	const standardThemeGrid = document.getElementById('standard-theme-grid');
	const artisticMainGrid = document.getElementById('artistic-main-grid');

	const paletteFor = (t) => {
		const candidates = [t.road_motorway, t.road_primary, t.road_secondary, t.road_tertiary, t.text, t.bg];
		return candidates.map(c => c || '#cccccc').slice(0, 4);
	};

	if (artisticMainGrid) {
		const makeCard = (key, theme) => {
			const p = paletteFor(theme);
			const label = theme && theme.name ? theme.name : key;
			return `
				<button type="button" data-key="${key}" class="art-card group p-3 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm flex flex-col items-center text-center hover:bg-white/20 hover:border-white/30 transition-all">
					<div class="flex items-center justify-center -space-x-2">
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${p[0]}"></span>
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${p[1]}"></span>
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${p[2]}"></span>
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${p[3]}"></span>
					</div>
					<div class="mt-3 text-[11px] font-semibold text-white">${label}</div>
				</button>
			`;
		};

		const keys = Object.keys(artisticThemes).sort((a, b) => 
			(artisticThemes[a].name || a).localeCompare((artisticThemes[b].name || b))
		);

		artisticMainGrid.innerHTML = keys.map(k => makeCard(k, artisticThemes[k])).join('');

		const cards = artisticMainGrid.querySelectorAll('.art-card');
		cards.forEach(btn => {
			btn.addEventListener('click', () => {
				cards.forEach(c => {
					c.classList.remove('border-accent', 'bg-white/25', 'ring-2', 'ring-white/30');
					c.classList.add('border-white/15', 'bg-white/10');
				});
				btn.classList.add('border-accent', 'bg-white/25', 'ring-2', 'ring-white/30');
				btn.classList.remove('border-white/15', 'bg-white/10');

				const k = btn.dataset.key;
				updateState({ artisticTheme: k });
				if (state.renderMode === 'artistic') {
					const theme = getSelectedArtisticTheme();
					updateArtisticStyle(theme);
				}
			});
		});
		
		const initialTheme = state.artisticTheme || 'monochrome_pro';
		const initialBtn = artisticMainGrid.querySelector(`[data-key="${initialTheme}"]`);
		if (initialBtn) {
			initialBtn.classList.add('border-accent', 'bg-accent-light', 'ring-2', 'ring-accent', 'ring-offset-2');
			initialBtn.classList.remove('border-slate-100', 'bg-slate-50');
		}
	}

	let _themeChangeTimer = null;
	function applyThemeChange(value) {
		updateState({ theme: value });
		if (state.renderMode === 'tile') {
			const t = getSelectedTheme();
			if (t && t.tileUrl) updateMapTheme(t.tileUrl);
			invalidateMapSize();
		}
	}

	if (standardThemeGrid) {
		const makeCard = (key, theme) => {
			const p1 = theme.bg || '#ffffff';
			const p2 = theme.water || '#aadaff';
			const p3 = theme.road || '#cccccc';
			const label = theme && theme.name ? theme.name : key;
			return `
				<button type="button" data-key="${key}" class="std-card group p-3 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col items-center text-center hover:shadow-xl transition-all">
					<div class="flex items-center justify-center -space-x-1">
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${p1}"></span>
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${p2}"></span>
						<span class="w-6 h-6 rounded-full ring-1 ring-white" style="background:${p3}"></span>
					</div>
					<div class="mt-3 text-[11px] font-semibold text-slate-900">${label}</div>
				</button>
			`;
		};

		const keys = Object.keys(themes).sort((a, b) => 
			(themes[a].name || a).localeCompare((themes[b].name || b))
		);

		standardThemeGrid.innerHTML = keys.map(k => makeCard(k, themes[k])).join('');

		const cards = standardThemeGrid.querySelectorAll('.std-card');
		cards.forEach(btn => {
			btn.addEventListener('click', () => {
				cards.forEach(c => {
					c.classList.remove('border-accent', 'bg-accent-light', 'ring-2', 'ring-accent', 'ring-offset-2');
					c.classList.add('border-slate-100', 'bg-slate-50');
				});
				btn.classList.add('border-accent', 'bg-accent-light', 'ring-2', 'ring-accent', 'ring-offset-2');
				btn.classList.remove('border-slate-100', 'bg-slate-50');

				const k = btn.dataset.key;
				clearTimeout(_themeChangeTimer);
				_themeChangeTimer = setTimeout(() => applyThemeChange(k), 120);
			});
		});
		
		const initialTheme = state.theme || 'light_all';
		const initialBtn = standardThemeGrid.querySelector(`[data-key="${initialTheme}"]`);
		if (initialBtn) {
			initialBtn.classList.add('border-accent', 'bg-accent-light', 'ring-2', 'ring-accent', 'ring-offset-2');
			initialBtn.classList.remove('border-slate-100', 'bg-slate-50');
		}
	}

	if (modeTile) modeTile.addEventListener('click', () => updateState({ renderMode: 'tile' }));
	if (modeArtistic) modeArtistic.addEventListener('click', () => updateState({ renderMode: 'artistic' }));
}
