/**
 * fontPicker.js — Custom font picker dropdowns
 * Extracted from form.js. Call setupFontPickers() once during init.
 * Depends on: updateState from state.js (passed in)
 */
import { updateState } from '../core/state.js';

export function setupFontPickers() {
	const fontPickers = document.querySelectorAll('.font-picker-container');

	fontPickers.forEach(picker => {
		const btn = picker.querySelector('.font-picker-btn');
		const dropdown = picker.querySelector('.font-picker-dropdown');
		const hiddenInput = picker.querySelector('input[type="hidden"]');
		const targetLabel = btn?.querySelector('span');
		const targetType = picker.dataset.target; // city-font, country-font, coords-font

		if (!btn || !dropdown) return;

		// Toggle dropdown open/close
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			const isExpanded = btn.getAttribute('aria-expanded') === 'true';

			// Close all other dropdowns first
			document.querySelectorAll('.font-picker-dropdown').forEach(d => {
				if (d !== dropdown) {
					d.classList.add('hidden');
					d.previousElementSibling?.setAttribute('aria-expanded', 'false');
				}
			});

			dropdown.classList.toggle('hidden', isExpanded);
			btn.setAttribute('aria-expanded', String(!isExpanded));
		});

		// Handle option selection
		const options = dropdown.querySelectorAll('.font-option');
		let highlightIdx = -1;

		function applyHighlight(idx) {
			options.forEach((o, i) => {
				if (i === idx) {
					o.classList.add('bg-white/15', 'ring-1', 'ring-inset', 'ring-white/30');
					o.scrollIntoView({ block: 'nearest' });
				} else {
					o.classList.remove('bg-white/15', 'ring-1', 'ring-inset', 'ring-white/30');
				}
			});
		}

		options.forEach(option => {
			option.addEventListener('click', (e) => {
				e.stopPropagation();
				const val = option.dataset.value;
				const text = option.textContent;
				const fontFamily = option.style.fontFamily;

				if (hiddenInput) hiddenInput.value = val;
				if (targetLabel) targetLabel.textContent = text;
				btn.style.fontFamily = fontFamily;

				// Update state
				if (targetType === 'city-font') updateState({ cityFont: val });
				else if (targetType === 'country-font') updateState({ countryFont: val });
				else if (targetType === 'coords-font') updateState({ coordsFont: val });

				dropdown.classList.add('hidden');
				btn.setAttribute('aria-expanded', 'false');
				highlightIdx = -1;
			});
		});

		// Keyboard navigation: ArrowDown/Up/Enter/Escape
		btn.addEventListener('keydown', (e) => {
			const isOpen = btn.getAttribute('aria-expanded') === 'true';

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (!isOpen) {
					dropdown.classList.remove('hidden');
					btn.setAttribute('aria-expanded', 'true');
				}
				highlightIdx = Math.min(highlightIdx + 1, options.length - 1);
				applyHighlight(highlightIdx);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				highlightIdx = Math.max(highlightIdx - 1, 0);
				applyHighlight(highlightIdx);
			} else if (e.key === 'Enter' && isOpen) {
				e.preventDefault();
				const target = highlightIdx >= 0 ? options[highlightIdx] : options[0];
				if (target) target.click();
			} else if (e.key === 'Escape') {
				dropdown.classList.add('hidden');
				btn.setAttribute('aria-expanded', 'false');
				highlightIdx = -1;
			}
		});
	});

	// Close all dropdowns when clicking outside any picker
	document.addEventListener('click', (e) => {
		if (!e.target.closest('.font-picker-container')) {
			document.querySelectorAll('.font-picker-dropdown').forEach(d => {
				d.classList.add('hidden');
				d.previousElementSibling?.setAttribute('aria-expanded', 'false');
			});
		}
	});
}

/**
 * Sync a font picker's displayed value to match a state value.
 * Call this from the main syncUI callback.
 */
export function syncFontPicker(target, val) {
	const picker = document.querySelector(`.font-picker-container[data-target="${target}"]`);
	if (!picker) return;
	const btn = picker.querySelector('.font-picker-btn');
	const hiddenInput = picker.querySelector('input[type="hidden"]');
	const targetLabel = btn?.querySelector('span');
	const options = picker.querySelectorAll('.font-option');

	if (hiddenInput) hiddenInput.value = val;
	let found = false;
	options.forEach(opt => {
		if (opt.dataset.value === val) {
			if (targetLabel) targetLabel.textContent = opt.textContent;
			if (btn) btn.style.fontFamily = opt.style.fontFamily;
			found = true;
		}
	});
	if (!found && btn && targetLabel) {
		targetLabel.textContent = val.split(',')[0].replace(/['"]/g, '');
		btn.style.fontFamily = val;
	}
}
