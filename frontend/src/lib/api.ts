const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CreateOrderPayload {
	amount: number;
	currency?: string;
	email?: string;
	tier: string;
	metadata: {
		city: string;
		theme: string;
		width: number;
		height: number;
		multiplier: number;
	};
}

export interface CreateOrderResponse {
	orderId: string;
	amount: number;
	currency: string;
	key: string;
}

export interface VerifyPayload {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
}

export interface VerifyResponse {
	success: boolean;
	paymentId: string;
	orderId: string;
	/** Download token issued by the server once payment is verified. */
	token: string;
	expiresAt: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

	const data = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new Error((data as { error?: string }).error || `Request to ${path} failed (${res.status})`);
	}
	return data as T;
}

export function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
	return post<CreateOrderResponse>('/api/payment/create-order', payload);
}

export function verifyPayment(payload: VerifyPayload): Promise<VerifyResponse> {
	return post<VerifyResponse>('/api/payment/verify', payload);
}

/** Consumes a single-use download token immediately before the file is produced. */
export function redeemToken(token: string): Promise<{ valid: boolean; order: Record<string, unknown> }> {
	return post('/api/export/validate', { token });
}

export async function isBackendReachable(): Promise<boolean> {
	try {
		const res = await fetch(`${API_BASE}/api/health`, { cache: 'no-store' });
		return res.ok;
	} catch {
		return false;
	}
}
