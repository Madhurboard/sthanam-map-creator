import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';
// Vendor stylesheets first: MapLibre's `.maplibregl-map { position: relative }`
// ties with Tailwind's `.absolute` on specificity, so load order decides.
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';

export const metadata: Metadata = {
	title: 'Sthanam — Create Beautiful Map Art',
	description: 'Turn any location into a stunning map poster. Search a city, pick a style, set your typography in Latin or Devanagari, then download print-quality art.',
	openGraph: {
		title: 'Sthanam — Create Beautiful Map Art',
		description: 'Turn any location into a stunning map poster, in English or हिन्दी.',
		type: 'website',
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${fontVariables} font-sans`}>
				{children}
			</body>
		</html>
	);
}
