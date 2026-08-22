'use client';

import { useCallback, useState } from 'react';
import { useMapState } from '@/lib/map-state';
import { themes } from '@/lib/themes';
import { artisticThemes } from '@/lib/artistic-themes';
import { renderPoster, downloadCanvas, buildFilename, clampToCanvasLimits } from '@/lib/export';
import { createOrder, verifyPayment, redeemToken } from '@/lib/api';
import { CURRENCY, getTier, resolveOutputSize, type Tier, type TierId } from '@/lib/pricing';
import type { StandardTheme, ArtisticTheme } from '@/types';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

interface RazorpayResponse {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
}

declare global {
	interface Window {
		Razorpay?: new (options: Record<string, unknown>) => { open: () => void; close: () => void };
	}
}

function loadRazorpayScript(): Promise<boolean> {
	if (typeof window === 'undefined') return Promise.resolve(false);
	if (window.Razorpay) return Promise.resolve(true);

	return new Promise((resolve) => {
		const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
		if (existing) {
			existing.addEventListener('load', () => resolve(true));
			existing.addEventListener('error', () => resolve(false));
			return;
		}

		const script = document.createElement('script');
		script.src = RAZORPAY_SCRIPT;
		script.async = true;
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

/** Opens Razorpay Checkout and resolves with the signed response, or null if dismissed. */
function openCheckout(options: {
	key: string;
	amount: number;
	currency: string;
	orderId: string;
	description: string;
	email?: string;
}): Promise<RazorpayResponse | null> {
	return new Promise((resolve, reject) => {
		if (!window.Razorpay) {
			reject(new Error('Payment window could not be opened'));
			return;
		}

		let settled = false;
		const rzp = new window.Razorpay({
			key: options.key,
			amount: options.amount,
			currency: options.currency,
			order_id: options.orderId,
			name: 'Sthanam',
			description: options.description,
			prefill: options.email ? { email: options.email } : undefined,
			theme: { color: '#3b82f6' },
			handler: (response: RazorpayResponse) => {
				settled = true;
				resolve(response);
			},
			modal: {
				ondismiss: () => {
					if (!settled) resolve(null);
				},
			},
		});

		rzp.open();
	});
}

export type ExportStatus = 'idle' | 'working' | 'awaiting-payment' | 'error' | 'done';

export function useExport() {
	const { state } = useMapState();
	const [status, setStatus] = useState<ExportStatus>('idle');
	const [message, setMessage] = useState('');
	const [error, setError] = useState<string | null>(null);

	const activeTheme = (state.renderMode === 'artistic'
		? (artisticThemes[state.artisticTheme as keyof typeof artisticThemes] || artisticThemes.arctic_frost)
		: (themes[state.theme as keyof typeof themes] || themes.minimal)) as StandardTheme | ArtisticTheme;

	const render = useCallback(async (tier: Tier) => {
		setMessage('Preparing…');
		const canvas = await renderPoster({
			state,
			tier,
			theme: activeTheme,
			filename: buildFilename(state, tier),
			onProgress: setMessage,
		});
		setMessage('Saving…');
		await downloadCanvas(canvas, buildFilename(state, tier));
	}, [state, activeTheme]);

	const exportPoster = useCallback(async (tierId: TierId, email?: string) => {
		const tier = getTier(tierId);
		setError(null);

		// Local development escape hatch: renders paid tiers without a live
		// Razorpay account so the export pipeline can be exercised end to end.
		// Double-gated so it can never be switched on in a production build.
		const skipPayment =
			process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_SKIP_PAYMENT === '1';

		try {
			if (tier.price === 0 || skipPayment) {
				setStatus('working');
				await render(tier);
				setStatus('done');
				return;
			}

			setStatus('awaiting-payment');
			setMessage('Opening secure checkout…');

			const scriptReady = await loadRazorpayScript();
			if (!scriptReady) throw new Error('Could not reach the payment provider. Check your connection and try again.');

			const order = await createOrder({
				amount: tier.price,
				currency: CURRENCY,
				email,
				tier: tier.id,
				metadata: {
					city: state.cityOverride || state.city,
					theme: state.renderMode === 'artistic' ? state.artisticTheme : state.theme,
					width: state.width,
					height: state.height,
					multiplier: tier.multiplier,
				},
			});

			const payment = await openCheckout({
				key: order.key,
				amount: order.amount,
				currency: order.currency,
				orderId: order.orderId,
				description: `${tier.label} poster — ${state.cityOverride || state.city}`,
				email,
			});

			if (!payment) {
				setStatus('idle');
				setMessage('');
				return;
			}

			setStatus('working');
			setMessage('Confirming payment…');
			const verified = await verifyPayment(payment);
			if (!verified.success) throw new Error('We could not confirm that payment. You have not been charged twice — contact support with your payment id.');

			// Burn the single-use token, then produce the file.
			await redeemToken(verified.token);
			await render(tier);
			setStatus('done');
		} catch (e) {
			console.error('Export failed:', e);
			setError(e instanceof Error ? e.message : 'Something went wrong while creating your poster.');
			setStatus('error');
		}
	}, [render, state]);

	const reset = useCallback(() => {
		setStatus('idle');
		setMessage('');
		setError(null);
	}, []);

	/** What the user will actually receive for a given tier, after every cap. */
	const previewSize = useCallback((tierId: TierId) => {
		const tier = getTier(tierId);
		const requested = resolveOutputSize(tier, state.width, state.height);
		return clampToCanvasLimits(requested.width, requested.height);
	}, [state.width, state.height]);

	return { status, message, error, exportPoster, reset, previewSize, busy: status === 'working' || status === 'awaiting-payment' };
}
