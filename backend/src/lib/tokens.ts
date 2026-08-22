import crypto from 'crypto';
import { supabase } from './supabase.js';

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export interface IssuedToken {
	token: string;
	expiresAt: string;
}

/** Issues a single-use, 24-hour download token against a completed order. */
export async function issueDownloadToken(orderId: string): Promise<IssuedToken> {
	const token = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

	const { error } = await supabase
		.from('download_tokens')
		.insert({
			order_id: orderId,
			token,
			expires_at: expiresAt,
			used: false,
		});

	if (error) throw new Error(`Could not issue download token: ${error.message}`);

	return { token, expiresAt };
}
