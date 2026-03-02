/**
 * draggable.js — Draggable poster overlay label
 * Extracted from form.js. Call setupDraggableOverlay() once during init.
 */
import { state, updateState } from '../core/state.js';

export function setupDraggableOverlay() {
	const draggableOverlay = document.getElementById('poster-overlay');
	const posterContainer = document.getElementById('poster-container');

	if (!draggableOverlay || !posterContainer) return;

	let isDragging = false;
	let dragStartClientX = 0;
	let dragStartClientY = 0;
	let dragStartOverlayX = 0.5;
	let dragStartOverlayY = 0.85;

	const startDrag = (clientX, clientY) => {
		if (state.overlaySize === 'none') return;
		isDragging = true;
		dragStartClientX = clientX;
		dragStartClientY = clientY;
		dragStartOverlayX = state.overlayX !== undefined ? state.overlayX : 0.5;
		dragStartOverlayY = state.overlayY !== undefined ? state.overlayY : 0.85;
		draggableOverlay.style.cursor = 'grabbing';
		document.body.style.userSelect = 'none';
	};

	const doDrag = (clientX, clientY) => {
		if (!isDragging) return;
		const rect = posterContainer.getBoundingClientRect();
		const dx = (clientX - dragStartClientX) / rect.width;
		const dy = (clientY - dragStartClientY) / rect.height;

		const EDGE = 8;
		const cW = posterContainer.offsetWidth;
		const cH = posterContainer.offsetHeight;
		const oW = draggableOverlay.offsetWidth;
		const oH = draggableOverlay.offsetHeight;
		const minX = cW > 0 && oW > 0 ? (oW / 2 + EDGE) / cW : 0.05;
		const maxX = cW > 0 && oW > 0 ? 1 - (oW / 2 + EDGE) / cW : 0.95;
		const minY = cH > 0 && oH > 0 ? (oH / 2 + EDGE) / cH : 0.05;
		const maxY = cH > 0 && oH > 0 ? 1 - (oH / 2 + EDGE) / cH : 0.95;

		const newX = Math.max(minX, Math.min(maxX, dragStartOverlayX + dx));
		const newY = Math.max(minY, Math.min(maxY, dragStartOverlayY + dy));
		updateState({ overlayX: newX, overlayY: newY });
	};

	const endDrag = () => {
		if (!isDragging) return;
		isDragging = false;
		draggableOverlay.style.cursor = '';
		document.body.style.userSelect = '';
	};

	// Mouse events
	draggableOverlay.addEventListener('mousedown', (e) => {
		startDrag(e.clientX, e.clientY);
		e.preventDefault();
	});
	document.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
	document.addEventListener('mouseup', endDrag);

	// Touch events
	draggableOverlay.addEventListener('touchstart', (e) => {
		if (e.touches.length === 1) {
			startDrag(e.touches[0].clientX, e.touches[0].clientY);
			e.preventDefault();
		}
	}, { passive: false });
	document.addEventListener('touchmove', (e) => {
		if (isDragging && e.touches.length === 1) {
			doDrag(e.touches[0].clientX, e.touches[0].clientY);
			e.preventDefault();
		}
	}, { passive: false });
	document.addEventListener('touchend', endDrag);
}
