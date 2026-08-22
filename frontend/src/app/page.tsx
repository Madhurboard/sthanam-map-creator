'use client';

import { MapStateProvider } from '@/lib/map-state';
import MapCreator from '@/components/MapCreator';

export default function Home() {
	return (
		<MapStateProvider>
			<MapCreator />
		</MapStateProvider>
	);
}
