/**
 * Shared marker icon SVG definitions.
 * Used by both the map preview (map-init.js) and the PNG export (export.js).
 */

/** Preview marker icons (used in Leaflet/MapLibre overlays) */
export const MARKER_ICONS = {
	pin: `
		<svg class="marker-pin" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
		</svg>
	`,
	circle: `
		<svg class="marker-pin" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" />
		</svg>
	`,
	heart: `
		<svg class="marker-pin" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
		</svg>
	`,
	star: `
		<svg class="marker-pin" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
		</svg>
	`,
	none: `
		<svg class="marker-pin" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="2" />
		</svg>
	`,
	dot: `
		<svg class="marker-pin" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="8"/>
		</svg>
	`,
	custom: `
		<svg class="marker-pin" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
			<circle cx="12" cy="10" r="3"/>
		</svg>
	`
};

/** Export marker icons (sized for high-res canvas rendering) */
export const MARKER_ICONS_EXPORT = {
	pin: `<svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
			<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
		</svg>`,
	circle: `<svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" />
		</svg>`,
	heart: `<svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
			<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
		</svg>`,
	star: `<svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
			<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
		</svg>`,
	none: `<svg width="100" height="100" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
			<circle cx="12" cy="12" r="2" />
		</svg>`
};
