import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { issueDownloadToken } from '../lib/tokens.js';
import { TIERS } from '../lib/pricing.js';

const router = Router();

/** Lets the client render the price list without hardcoding it twice. */
router.get('/pricing', (_req, res) => {
	res.json({ currency: 'INR', tiers: Object.values(TIERS) });
});

const generateTokenSchema = z.object({
	orderId: z.string().uuid(),
});

router.post('/generate-token', async (req, res) => {
	try {
		const { orderId } = generateTokenSchema.parse(req.body);

		// Only a paid, verified order may be handed a download token.
		const { data: order, error } = await supabase
			.from('orders')
			.select('id, status')
			.eq('id', orderId)
			.single();

		if (error || !order) return res.status(404).json({ error: 'Order not found' });
		if (order.status !== 'completed') return res.status(403).json({ error: 'Order is not paid' });

		const issued = await issueDownloadToken(order.id);
		res.json(issued);
	} catch (error: any) {
		console.error('Token generation failed:', error);
		res.status(400).json({ error: error.message || 'Failed to generate token' });
	}
});

const validateTokenSchema = z.object({
	token: z.string().min(1),
});

router.post('/validate', async (req, res) => {
	try {
		const { token } = validateTokenSchema.parse(req.body);

		const { data, error } = await supabase
			.from('download_tokens')
			.select('*, orders(city, theme, width, height, multiplier, tier)')
			.eq('token', token)
			.single();

		if (error || !data) return res.status(404).json({ error: 'Invalid download token' });
		if (data.used) return res.status(400).json({ error: 'This download link has already been used' });
		if (new Date(data.expires_at) < new Date()) {
			return res.status(400).json({ error: 'This download link has expired' });
		}

		// Conditional update so two racing requests cannot both redeem the token.
		const { data: claimed, error: claimError } = await supabase
			.from('download_tokens')
			.update({ used: true })
			.eq('token', token)
			.eq('used', false)
			.select()
			.single();

		if (claimError || !claimed) {
			return res.status(400).json({ error: 'This download link has already been used' });
		}

		res.json({ valid: true, order: data.orders ?? null });
	} catch (error: any) {
		console.error('Token validation failed:', error);
		res.status(400).json({ error: error.message || 'Validation failed' });
	}
});

export { router as exportRoutes };
