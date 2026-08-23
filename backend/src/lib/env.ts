/**
 * Environment loading and boot-time validation.
 *
 * Without this, a missing variable surfaces as a confusing runtime failure deep
 * in a request handler — `supabaseUrl is required`, or a Razorpay 401 that looks
 * like a credential problem on Razorpay's side. On a hosted platform that turns
 * into a crash loop with no useful log line. Fail here instead, naming the
 * variable that is actually missing.
 */

import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolved from this file rather than cwd, so the backend picks up its own env
// whether it is started from the repo root or from backend/.
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// .env.local first — dotenv never overwrites an already-set key, so values
// there win over .env, and both lose to real host environment variables.
dotenv.config({ path: resolve(packageRoot, '.env.local') });
dotenv.config({ path: resolve(packageRoot, '.env') });

const REQUIRED = [
	'SUPABASE_URL',
	'SUPABASE_SERVICE_KEY',
	'RAZORPAY_KEY_ID',
	'RAZORPAY_KEY_SECRET',
] as const;

/** Set once the placeholders are replaced with real credentials. */
const PLACEHOLDER_MARKERS = ['your_', 'paste_', 'placeholder', 'changeme', '_here'];

function validateEnv(): void {
	const missing = REQUIRED.filter(key => !process.env[key]?.trim());

	if (missing.length > 0) {
		console.error(
			`\nMissing required environment variable${missing.length > 1 ? 's' : ''}:\n` +
			missing.map(k => `  - ${k}`).join('\n') +
			'\n\nSet them in backend/.env.local for local work, or in the host\'s\n' +
			'environment settings when deployed. See backend/.env.example.\n',
		);
		process.exit(1);
	}

	const placeholders = REQUIRED.filter(key => {
		const value = process.env[key]!.toLowerCase();
		return PLACEHOLDER_MARKERS.some(marker => value.includes(marker));
	});

	if (placeholders.length > 0) {
		// Not fatal: the app still boots so the poster editor and free tier can be
		// exercised without a Razorpay or Supabase account.
		console.warn(
			`\nUsing placeholder credentials for: ${placeholders.join(', ')}\n` +
			'Payments and order persistence will fail. The free tier still works.\n',
		);
	}

	if (process.env.NODE_ENV === 'production' && !process.env.RAZORPAY_WEBHOOK_SECRET) {
		console.warn(
			'RAZORPAY_WEBHOOK_SECRET is unset — the webhook will accept unsigned requests.\n' +
			'Set it before taking real payments.',
		);
	}
}

// Runs on import rather than being called from index.ts: ES module imports are
// evaluated before any statement in the importing file, so the Supabase and
// Razorpay clients would already have been constructed by the time a call in
// index.ts could run. index.ts imports this module before the route modules.
validateEnv();

