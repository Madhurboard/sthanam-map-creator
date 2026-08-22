import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.tile.openstreetmap.org',
			},
			{
				protocol: 'https',
				hostname: '**.basemaps.cartocdn.com',
			},
			{
				protocol: 'https',
				hostname: 'server.arcgisonline.com',
			},
		],
	},
	// The client calls the backend at its absolute NEXT_PUBLIC_API_URL, so this
	// proxy is only a development convenience. Shipping it to Vercel would point
	// /api/* at a localhost that does not exist there.
	async rewrites() {
		if (process.env.NODE_ENV === 'production') return [];
		return [
			{
				source: '/api/:path*',
				destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
