// Must precede the route imports: it loads .env.local/.env and validates
// credentials before the Supabase and Razorpay clients are constructed further
// down the import graph.
import './lib/env.js';
import express from 'express';
import cors from 'cors';
import { paymentRoutes } from './routes/payment.js';
import { exportRoutes } from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
	.split(',')
	.map(o => o.trim())
	.filter(Boolean);

app.use(cors({
	origin: allowedOrigins,
	credentials: true,
}));

// The Razorpay webhook signature covers the exact bytes sent, so this route
// must see the raw body — it is mounted before the JSON parser on purpose.
app.use('/api/payment/webhook', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/payment', paymentRoutes);
app.use('/api/export', exportRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error('Unhandled error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
	console.log(`Sthanam backend listening on http://localhost:${PORT}`);
	console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

export default app;
