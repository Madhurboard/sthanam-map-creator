'use client';

import dynamic from 'next/dynamic';
import Sidebar from './Sidebar';

// Leaflet and MapLibre both touch `window` at import time.
const Poster = dynamic(() => import('./Poster'), {
	ssr: false,
	loading: () => (
		<div className="flex-1 flex items-center justify-center">
			<div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
		</div>
	),
});

export default function MapCreator() {
	return (
		<div className="relative h-[100dvh] w-full overflow-hidden">
			<div className="fixed inset-0 z-[-100] animated-gradient-bg pointer-events-none" />

			<div className="flex h-full flex-col md:flex-row">
				<div className="flex-1 min-h-0 flex flex-col">
					<header className="flex items-center justify-between px-5 md:px-8 pt-5 pb-1 flex-shrink-0">
						<div className="flex items-baseline gap-2">
							<h1 className="text-lg font-bold tracking-tight text-white">Sthanam</h1>
							<span className="text-sm text-white/40" lang="sa">स्थानम्</span>
						</div>
						<span className="hidden sm:block text-[10px] uppercase tracking-widest text-white/30">
							Map art for any place
						</span>
					</header>
					<Poster />
				</div>

				<div className="h-[52dvh] md:h-auto flex-shrink-0 flex">
					<Sidebar />
				</div>
			</div>
		</div>
	);
}
