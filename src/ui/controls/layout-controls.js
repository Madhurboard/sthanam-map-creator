import { state, updateState, defaultState } from '../../core/state.js';

export function setupLayoutControls() {
	const overlayBgButtons = document.querySelectorAll('.overlay-bg-btn');
	const overlaySizeButtons = document.querySelectorAll('.overlay-size-btn');
	const customW = document.getElementById('custom-w');
	const customH = document.getElementById('custom-h');
	const presetBtns = document.querySelectorAll('.preset-btn');

	const matToggle = document.getElementById('mat-toggle');
	const matWidthSlider = document.getElementById('mat-width-slider');
	const matBorderToggle = document.getElementById('mat-border-toggle');
	const matBorderWidthSlider = document.getElementById('mat-border-width-slider');
	const matBorderOpacitySlider = document.getElementById('mat-border-opacity-slider');

	if (matToggle) {
		matToggle.addEventListener('change', (e) => {
			updateState({ matEnabled: e.target.checked });
		});
	}

	if (matWidthSlider) {
		matWidthSlider.addEventListener('input', (e) => {
			updateState({ matWidth: parseInt(e.target.value) });
		});
	}

	if (matBorderToggle) {
		matBorderToggle.addEventListener('change', (e) => {
			updateState({ matShowBorder: e.target.checked });
		});
	}

	if (matBorderWidthSlider) {
		matBorderWidthSlider.addEventListener('input', (e) => {
			updateState({ matBorderWidth: parseInt(e.target.value) });
		});
	}

	if (matBorderOpacitySlider) {
		matBorderOpacitySlider.addEventListener('input', (e) => {
			updateState({ matBorderOpacity: parseFloat(e.target.value) });
		});
	}

	if (overlayBgButtons) {
		overlayBgButtons.forEach(btn => {
			btn.addEventListener('click', () => {
				updateState({ overlayBgType: btn.dataset.bg });
			});
		});
	}

	if (overlaySizeButtons) {
		overlaySizeButtons.forEach(btn => {
			btn.addEventListener('click', (e) => {
				const size = btn.dataset.size;
				updateState({ overlaySize: size });
			});
		});
	}

	presetBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const width = parseInt(btn.dataset.width);
			const height = parseInt(btn.dataset.height);
			updateState({ width, height });
		});
	});

	const MAX_RES = 50000;
	if (customW) {
		customW.addEventListener('change', (e) => {
			let val = parseInt(e.target.value) || state.width;
			if (val > MAX_RES) val = MAX_RES;
			updateState({ width: val });
		});
	}
	if (customH) {
		customH.addEventListener('change', (e) => {
			let val = parseInt(e.target.value) || state.height;
			if (val > MAX_RES) val = MAX_RES;
			updateState({ height: val });
		});
	}

	const resetSettingsBtn = document.getElementById('reset-settings-btn');
	const resetConfirmUI = document.getElementById('reset-confirm-ui');
	const resetConfirmYes = document.getElementById('reset-confirm-yes');
	const resetConfirmNo = document.getElementById('reset-confirm-no');

	if (resetSettingsBtn && resetConfirmUI) {
		resetSettingsBtn.addEventListener('click', () => {
			resetConfirmUI.classList.remove('hidden');
			resetSettingsBtn.classList.add('hidden');
		});
		resetConfirmYes?.addEventListener('click', () => {
			updateState(defaultState);
			resetConfirmUI.classList.add('hidden');
			resetSettingsBtn.classList.remove('hidden');
		});
		resetConfirmNo?.addEventListener('click', () => {
			resetConfirmUI.classList.add('hidden');
			resetSettingsBtn.classList.remove('hidden');
		});
	} else if (resetSettingsBtn) {
		resetSettingsBtn.addEventListener('click', () => {
			if (confirm('Reset all settings to defaults?')) updateState(defaultState);
		});
	}
}
