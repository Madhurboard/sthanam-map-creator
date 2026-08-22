import type { OutputPreset } from '@/types';

export const outputPresets: Record<string, OutputPreset[]> = {
	social_media: [
		{ name: 'Instagram Square', width: 1080, height: 1080 },
		{ name: 'Instagram Portrait', width: 1080, height: 1350 },
		{ name: 'Instagram Story / TikTok', width: 1080, height: 1920 },
		{ name: 'Twitter/FB Post', width: 1200, height: 630 },
		{ name: 'Twitter header', width: 1500, height: 500 },
		{ name: 'YouTube Thumbnail', width: 1280, height: 720 },
	],
	wallpaper: [
		{ name: 'Desktop Full HD', width: 1920, height: 1080 },
		{ name: 'Desktop 4K', width: 3840, height: 2160 },
		{ name: 'Ultrawide', width: 3440, height: 1440 },
		{ name: 'iPhone 15/14/13', width: 1170, height: 2532 },
		{ name: 'Samsung S22/S23', width: 1080, height: 2340 },
	],
	paper_size: [
		{ name: 'A4 Paper', width: 2480, height: 3508 },
		{ name: 'A3 Paper', width: 3508, height: 4961 },
		{ name: 'A2 Paper', width: 4961, height: 7016 },
		{ name: 'A1 Paper', width: 7016, height: 9933 },
		{ name: 'Letter', width: 2550, height: 3300 },
		{ name: 'Poster (18x24")', width: 5400, height: 7200 },
		{ name: 'Poster (24x36")', width: 7200, height: 10800 },
	],
};

export const PRESET_CATEGORY_LABELS: Record<string, string> = {
	social_media: 'Social Media',
	wallpaper: 'Wallpaper',
	paper_size: 'Print / Paper',
};

/** Quick presets surfaced directly in the Size tab (the rest live in the presets modal). */
export const quickPresets: OutputPreset[] = [
	{ name: 'Square', width: 1080, height: 1080 },
	{ name: 'Portrait', width: 1080, height: 1350 },
	{ name: 'Story', width: 1080, height: 1920 },
	{ name: 'Landscape', width: 1920, height: 1080 },
];

export const MAX_RES = 50000;
export const MIN_RES = 100;

/** Paper presets imply real printing intent — used to price the print tier. */
export function isPrintSize(width: number, height: number): boolean {
	return outputPresets.paper_size.some(p => p.width === width && p.height === height);
}
