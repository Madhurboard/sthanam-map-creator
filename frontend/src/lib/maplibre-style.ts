import type { ArtisticTheme } from '@/types';

/**
 * Builds a MapLibre GL style object from an artistic theme's colour palette.
 * Vector tiles come from OpenFreeMap (free, no API key).
 */
export function generateMapLibreStyle(theme: ArtisticTheme): Record<string, unknown> {
	return {
		version: 8,
		name: theme.name,
		sources: {
			openfreemap: {
				type: 'vector',
				url: 'https://tiles.openfreemap.org/planet',
			},
		},
		layers: [
			{
				id: 'background',
				type: 'background',
				paint: { 'background-color': theme.bg },
			},
			{
				id: 'water',
				source: 'openfreemap',
				'source-layer': 'water',
				type: 'fill',
				paint: { 'fill-color': theme.water },
			},
			{
				id: 'park',
				source: 'openfreemap',
				'source-layer': 'park',
				type: 'fill',
				paint: { 'fill-color': theme.parks },
			},
			{
				id: 'road-default',
				source: 'openfreemap',
				'source-layer': 'transportation',
				type: 'line',
				filter: ['!', ['match', ['get', 'class'], ['motorway', 'primary', 'secondary', 'tertiary', 'residential'], true, false]],
				paint: { 'line-color': theme.road_default, 'line-width': 0.5 },
			},
			{
				id: 'road-residential',
				source: 'openfreemap',
				'source-layer': 'transportation',
				type: 'line',
				filter: ['==', ['get', 'class'], 'residential'],
				paint: { 'line-color': theme.road_residential, 'line-width': 0.5 },
			},
			{
				id: 'road-tertiary',
				source: 'openfreemap',
				'source-layer': 'transportation',
				type: 'line',
				filter: ['==', ['get', 'class'], 'tertiary'],
				paint: { 'line-color': theme.road_tertiary, 'line-width': 0.8 },
			},
			{
				id: 'road-secondary',
				source: 'openfreemap',
				'source-layer': 'transportation',
				type: 'line',
				filter: ['==', ['get', 'class'], 'secondary'],
				paint: { 'line-color': theme.road_secondary, 'line-width': 1.0 },
			},
			{
				id: 'road-primary',
				source: 'openfreemap',
				'source-layer': 'transportation',
				type: 'line',
				filter: ['==', ['get', 'class'], 'primary'],
				paint: { 'line-color': theme.road_primary, 'line-width': 1.5 },
			},
			{
				id: 'road-motorway',
				source: 'openfreemap',
				'source-layer': 'transportation',
				type: 'line',
				filter: ['==', ['get', 'class'], 'motorway'],
				paint: { 'line-color': theme.road_motorway, 'line-width': 2.0 },
			},
		],
	};
}

/** Paint properties that can be swapped in-place without a full setStyle() reload. */
export const STYLE_PAINT_MAP: Array<[string, string, keyof ArtisticTheme]> = [
	['background', 'background-color', 'bg'],
	['water', 'fill-color', 'water'],
	['park', 'fill-color', 'parks'],
	['road-default', 'line-color', 'road_default'],
	['road-residential', 'line-color', 'road_residential'],
	['road-tertiary', 'line-color', 'road_tertiary'],
	['road-secondary', 'line-color', 'road_secondary'],
	['road-primary', 'line-color', 'road_primary'],
	['road-motorway', 'line-color', 'road_motorway'],
];
