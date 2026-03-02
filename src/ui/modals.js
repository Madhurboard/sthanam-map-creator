/**
 * modals.js — Credits and Presets modal management
 * Extracted from form.js. Call setupModals() once during init.
 */
import { state, updateState } from '../core/state.js';
import { outputPresets } from '../core/output-presets.js';

export function setupModals() {
	// ── Credits Modal ─────────────────────────────────────────────────────────
	const logoBtn = document.getElementById('logo-btn');
	const mobileLogoBtn = document.getElementById('mobile-logo-btn');
	const creditsModal = document.getElementById('credits-modal');
	const closeCredits = document.getElementById('close-credits');
	const creditsOverlay = document.getElementById('credits-overlay');

	const openCredits = () => {
		if (creditsModal) creditsModal.classList.add('show');
	};

	if (logoBtn) logoBtn.addEventListener('click', openCredits);
	if (mobileLogoBtn) mobileLogoBtn.addEventListener('click', openCredits);

	[closeCredits, creditsOverlay].forEach(el => {
		if (el) {
			el.addEventListener('click', () => {
				if (creditsModal) creditsModal.classList.remove('show');
			});
		}
	});

	// ── Presets Modal ─────────────────────────────────────────────────────────
	const otherPresetsBtn = document.getElementById('other-presets-btn');
	const presetsModal = document.getElementById('presets-modal');
	const closeModal = document.getElementById('close-modal');
	const closeModalBtn = document.getElementById('close-modal-btn');
	const modalContent = document.getElementById('modal-content');
	const modalOverlay = document.getElementById('modal-overlay');

	if (otherPresetsBtn) {
		otherPresetsBtn.addEventListener('click', () => {
			if (presetsModal) presetsModal.classList.add('show');
			populatePresetsModal();
		});
	}

	[closeModal, closeModalBtn, modalOverlay].forEach(el => {
		if (el) {
			el.addEventListener('click', () => {
				if (presetsModal) presetsModal.classList.remove('show');
			});
		}
	});

	function populatePresetsModal() {
		if (!modalContent) return;
		modalContent.innerHTML = Object.entries(outputPresets).map(([key, presets]) => `
      <div class="space-y-4">
        <div class="flex items-center space-x-3">
          <div class="w-1 h-5 bg-accent rounded-full"></div>
          <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">${key.replace('_', ' ')}</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${presets.map(p => {
			const isActive = state.width === p.width && state.height === p.height;
			return `
              <button class="modal-preset-btn group flex flex-col items-start p-4 border ${isActive ? 'border-accent bg-accent-light' : 'border-slate-100 bg-slate-50/50'} rounded-2xl hover:border-accent hover:bg-white hover:shadow-xl transition-all text-left"
                      data-width="${p.width}" data-height="${p.height}">
                <span class="text-[11px] font-bold ${isActive ? 'text-accent' : 'text-slate-800'} group-hover:text-accent transition-colors">${p.name}</span>
                <span class="text-[9px] ${isActive ? 'text-accent/60' : 'text-slate-500'} font-bold mt-1 uppercase tracking-tight">${p.width} × ${p.height} px</span>
              </button>
            `;
		}).join('')}
        </div>
      </div>
    `).join('');

		modalContent.querySelectorAll('.modal-preset-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const width = parseInt(btn.dataset.width);
				const height = parseInt(btn.dataset.height);
				updateState({ width, height });
				if (presetsModal) presetsModal.classList.remove('show');
			});
		});
	}
}
