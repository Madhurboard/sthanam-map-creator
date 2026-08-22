'use client';

import { useEffect, type RefObject } from 'react';
import { clamp } from '@/lib/utils';

const EDGE = 8;

/**
 * Lets the poster text block be dragged anywhere on the poster, storing the
 * result as normalised 0–1 coordinates so it survives poster resizes.
 */
export function useDraggableOverlay(
	overlayRef: RefObject<HTMLElement | null>,
	containerRef: RefObject<HTMLElement | null>,
	onMove: (x: number, y: number) => void,
	enabled = true,
) {
	useEffect(() => {
		const overlay = overlayRef.current;
		const container = containerRef.current;
		if (!overlay || !container || !enabled) return;

		let dragging = false;
		let pointerId: number | null = null;

		const commit = (clientX: number, clientY: number) => {
			const rect = container.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0) return;

			const overlayRect = overlay.getBoundingClientRect();
			const halfW = overlayRect.width / 2;
			const halfH = overlayRect.height / 2;

			const rawX = (clientX - rect.left) / rect.width;
			const rawY = (clientY - rect.top) / rect.height;

			const minX = (halfW + EDGE) / rect.width;
			const minY = (halfH + EDGE) / rect.height;

			onMove(
				clamp(rawX, minX, 1 - minX),
				clamp(rawY, minY, 1 - minY),
			);
		};

		const onPointerDown = (e: PointerEvent) => {
			// Let clicks on interactive children through.
			if ((e.target as HTMLElement).closest('input, button, textarea')) return;
			dragging = true;
			pointerId = e.pointerId;
			overlay.setPointerCapture(e.pointerId);
			e.preventDefault();
		};

		const onPointerMove = (e: PointerEvent) => {
			if (!dragging || e.pointerId !== pointerId) return;
			commit(e.clientX, e.clientY);
		};

		const onPointerUp = (e: PointerEvent) => {
			if (e.pointerId !== pointerId) return;
			dragging = false;
			pointerId = null;
			try { overlay.releasePointerCapture(e.pointerId); } catch { /* already released */ }
		};

		overlay.addEventListener('pointerdown', onPointerDown);
		overlay.addEventListener('pointermove', onPointerMove);
		overlay.addEventListener('pointerup', onPointerUp);
		overlay.addEventListener('pointercancel', onPointerUp);

		return () => {
			overlay.removeEventListener('pointerdown', onPointerDown);
			overlay.removeEventListener('pointermove', onPointerMove);
			overlay.removeEventListener('pointerup', onPointerUp);
			overlay.removeEventListener('pointercancel', onPointerUp);
		};
	}, [overlayRef, containerRef, onMove, enabled]);
}
