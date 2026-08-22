import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { razorpay } from '../lib/razorpay.js';
import { supabase } from '../lib/supabase.js';
import { getTier } from '../lib/pricing.js';
import { issueDownloadToken } from '../lib/tokens.js';

const router = Router();

const createOrderSchema = z.object({
	tier: z.string(),
	currency: z.string().default('INR'),
	receipt: z.string().optional(),
	email: z.string().email().optional(),
	metadata: z.object({
		city: z.string(),
		theme: z.string(),
		width: z.number(),
		height: z.number(),
		multiplier: z.number(),
	}).optional(),
});

router.post('/create-order', async (req, res) => {
	try {
		const body = createOrderSchema.parse(req.body);

		// Price comes from the server-side tier table, never from the request.
		const tier = getTier(body.tier);
		if (!tier) return res.status(400).json({ error: 'Unknown product tier' });

		const amountPaise = tier.price * 100;

		const order = await razorpay.orders.create({
			amount: amountPaise,
			currency: body.currency,
			receipt: body.receipt || `sthanam_${Date.now()}`,
			notes: {
				tier: tier.id,
				city: body.metadata?.city ?? '',
				theme: body.metadata?.theme ?? '',
				dimensions: body.metadata ? `${body.metadata.width}x${body.metadata.height}` : '',
				multiplier: String(tier.multiplier),
			},
		});

		// Record the intent now so the webhook and /verify have a row to update.
		const { error } = await supabase
			.from('orders')
			.insert({
				razorpay_order_id: order.id,
				status: 'pending',
				amount: amountPaise,
				currency: body.currency,
				email: body.email ?? null,
				tier: tier.id,
				city: body.metadata?.city ?? null,
				theme: body.metadata?.theme ?? null,
				width: body.metadata?.width ?? null,
				height: body.metadata?.height ?? null,
				multiplier: tier.multiplier,
			});

		if (error) console.error('Could not persist pending order:', error.message);

		res.json({
			orderId: order.id,
			amount: order.amount,
			currency: order.currency,
			key: process.env.RAZORPAY_KEY_ID,
		});
	} catch (error: any) {
		console.error('Create order failed:', error);
		res.status(400).json({ error: error.message || 'Failed to create order' });
	}
});

const verifyPaymentSchema = z.object({
	razorpay_order_id: z.string(),
	razorpay_payment_id: z.string(),
	razorpay_signature: z.string(),
});

router.post('/verify', async (req, res) => {
	try {
		const body = verifyPaymentSchema.parse(req.body);

		const generatedSignature = crypto
			.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
			.update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
			.digest('hex');

		const expected = Buffer.from(generatedSignature);
		const received = Buffer.from(body.razorpay_signature);
		const signatureValid =
			expected.length === received.length && crypto.timingSafeEqual(expected, received);

		if (!signatureValid) {
			return res.status(400).json({ error: 'Invalid payment signature' });
		}

		// Upsert so a missing pending row (or a webhook that landed first) still settles.
		const { data: order, error } = await supabase
			.from('orders')
			.upsert(
				{
					razorpay_order_id: body.razorpay_order_id,
					razorpay_payment_id: body.razorpay_payment_id,
					status: 'completed',
					verified_at: new Date().toISOString(),
				},
				{ onConflict: 'razorpay_order_id' },
			)
			.select()
			.single();

		if (error || !order) {
			throw new Error(error?.message || 'Could not record the completed order');
		}

		const { token, expiresAt } = await issueDownloadToken(order.id);

		res.json({
			success: true,
			paymentId: body.razorpay_payment_id,
			orderId: body.razorpay_order_id,
			token,
			expiresAt,
		});
	} catch (error: any) {
		console.error('Payment verification failed:', error);
		res.status(400).json({ error: error.message || 'Verification failed' });
	}
});

router.post('/webhook', async (req, res) => {
	const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

	if (webhookSecret) {
		const signature = req.headers['x-razorpay-signature'] as string | undefined;
		// req.body is the raw Buffer here (see the express.raw mount in index.ts).
		const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
		const generatedSignature = crypto
			.createHmac('sha256', webhookSecret)
			.update(rawBody)
			.digest('hex');

		const expected = Buffer.from(generatedSignature);
		const received = Buffer.from(signature || '');
		if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
			return res.status(400).json({ error: 'Invalid webhook signature' });
		}
	}

	let payload: any;
	try {
		payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString('utf8')) : req.body;
	} catch {
		return res.status(400).json({ error: 'Malformed webhook payload' });
	}

	if (payload?.event === 'payment.captured') {
		const payment = payload.payload.payment.entity;

		await supabase
			.from('orders')
			.update({
				status: 'completed',
				razorpay_payment_id: payment.id,
				amount: payment.amount,
				email: payment.email,
				verified_at: new Date().toISOString(),
			})
			.eq('razorpay_order_id', payment.order_id);
	}

	res.json({ status: 'ok' });
});

export { router as paymentRoutes };
