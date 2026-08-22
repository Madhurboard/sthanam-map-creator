export function hexToRgba(color: string | undefined, alpha = 1): string {
	if (!color || typeof color !== 'string') return `rgba(255, 255, 255, ${alpha})`;

	if (color.startsWith('rgb')) {
		const matches = color.match(/\d+(\.\d+)?/g);
		if (matches && matches.length >= 3) {
			return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${alpha})`;
		}
	}

	let h = color.replace('#', '');
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];

	if (!/^[0-9A-Fa-f]{6}$/.test(h)) return `rgba(255, 255, 255, ${alpha})`;

	const r = parseInt(h.substring(0, 2), 16);
	const g = parseInt(h.substring(2, 4), 16);
	const b = parseInt(h.substring(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Web Mercator projection — shared by the live preview and the export compositor. */
export function project(lat: number, lon: number, scale: number): { x: number; y: number } {
	const siny = Math.sin(lat * Math.PI / 180);
	const y = 0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI);
	return {
		x: (lon + 180) / 360 * scale,
		y: y * scale,
	};
}

export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}
