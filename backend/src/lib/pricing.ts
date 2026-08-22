/**
 * Authoritative price list. The client sends a tier id, never an amount —
 * anything price-shaped that arrives from the browser is ignored.
 * Keep in sync with frontend/src/lib/pricing.ts.
 */

export type TierId = 'standard' | 'large' | 'print';

export interface Tier {
	id: TierId;
	label: string;
	/** Price in whole rupees. */
	price: number;
	multiplier: number;
}

export const TIERS: Record<TierId, Tier> = {
	standard: { id: 'standard', label: 'Standard', price: 99, multiplier: 1 },
	large: { id: 'large', label: 'Large', price: 149, multiplier: 2 },
	print: { id: 'print', label: 'Print', price: 249, multiplier: 4 },
};

export function getTier(id: string): Tier | null {
	return (TIERS as Record<string, Tier>)[id] ?? null;
}
