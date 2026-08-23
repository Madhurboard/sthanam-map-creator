export type TierId = 'free' | 'standard' | 'large' | 'print';

export interface Tier {
	id: TierId;
	label: string;
	/** Multiplier applied to the poster's configured width/height. */
	multiplier: number;
	/** Price in whole rupees. Zero means no checkout. */
	price: number;
	blurb: string;
	watermark: boolean;
	/** Longest-edge cap in pixels; null means uncapped. */
	maxEdge: number | null;
}

export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

export const TIERS: Tier[] = [
	{
		id: 'free',
		label: 'Preview',
		multiplier: 1,
		price: 0,
		blurb: 'Watermarked, great for sharing',
		watermark: true,
		maxEdge: 1200,
	},
	{
		id: 'standard',
		label: 'Standard',
		multiplier: 1,
		price: 10,
		blurb: 'Full size, no watermark',
		watermark: false,
		maxEdge: null,
	},
	{
		id: 'large',
		label: 'Large',
		multiplier: 2,
		price: 15,
		blurb: '2× resolution for big prints',
		watermark: false,
		maxEdge: null,
	},
	{
		id: 'print',
		label: 'Print',
		multiplier: 4,
		price: 20,
		blurb: '4× — framing quality up to A1',
		watermark: false,
		maxEdge: null,
	},
];

export function getTier(id: TierId): Tier {
	return TIERS.find(t => t.id === id) || TIERS[0];
}

export function formatPrice(price: number): string {
	return price === 0 ? 'Free' : `${CURRENCY_SYMBOL}${price}`;
}

/**
 * Resolves the pixel dimensions a tier actually produces, applying its
 * multiplier and then its longest-edge cap (free tier only).
 */
export function resolveOutputSize(tier: Tier, width: number, height: number): { width: number; height: number } {
	let w = Math.round(width * tier.multiplier);
	let h = Math.round(height * tier.multiplier);

	if (tier.maxEdge) {
		const longest = Math.max(w, h);
		if (longest > tier.maxEdge) {
			const ratio = tier.maxEdge / longest;
			w = Math.round(w * ratio);
			h = Math.round(h * ratio);
		}
	}

	return { width: Math.max(1, w), height: Math.max(1, h) };
}
