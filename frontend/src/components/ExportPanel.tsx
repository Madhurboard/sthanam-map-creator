'use client';

import { useState } from 'react';
import { useExport } from '@/hooks/useExport';
import { TIERS, formatPrice, type TierId } from '@/lib/pricing';

export default function ExportPanel() {
	const { status, message, error, exportPoster, reset, previewSize, busy } = useExport();
	const [selected, setSelected] = useState<TierId>('free');
	const [email, setEmail] = useState('');

	const tier = TIERS.find(t => t.id === selected)!;
	const size = previewSize(selected);
	const paid = tier.price > 0;

	return (
		<div className="space-y-5">
			<div>
				<span className="label-sm">Choose Your Download</span>
				<div className="space-y-2">
					{TIERS.map(t => {
						const active = selected === t.id;
						const out = previewSize(t.id);
						return (
							<button
								key={t.id}
								onClick={() => setSelected(t.id)}
								className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
									active
										? 'bg-accent-light border-accent ring-2 ring-accent/30'
										: 'bg-white/10 border-white/15 hover:bg-white/20'
								}`}
							>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-sm font-bold text-white">{t.label}</span>
										{t.id === 'large' && (
											<span className="text-[9px] font-bold uppercase tracking-wider bg-white/15 text-white/80 px-1.5 py-0.5 rounded-full">Popular</span>
										)}
									</div>
									<div className="text-[10px] text-white/55 truncate">{t.blurb}</div>
									<div className="text-[10px] font-mono text-white/40 mt-0.5">{out.width} × {out.height}px</div>
								</div>
								<span className={`text-sm font-bold flex-shrink-0 ${active ? 'text-accent' : 'text-white/80'}`}>
									{formatPrice(t.price)}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{size.clamped && (
				<p className="text-[10px] text-amber-300/90 px-1 leading-relaxed">
					Your poster is larger than the browser can render in one pass, so the file
					will be produced at {size.width} × {size.height}px.
				</p>
			)}

			{paid && (
				<div>
					<span className="label-sm">Email for Receipt</span>
					<input
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder="you@example.com"
						className="input-field"
						autoComplete="email"
					/>
				</div>
			)}

			<button
				onClick={() => exportPoster(selected, email || undefined)}
				disabled={busy}
				className="w-full bg-accent hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
			>
				{busy ? (
					<>
						<span className="flex items-center gap-1">
							{[0, 0.1, 0.2].map(delay => (
								<span key={delay} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
							))}
						</span>
						<span>{message || 'Working…'}</span>
					</>
				) : (
					<>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						<span>{paid ? `Pay ${formatPrice(tier.price)} & Download` : 'Download Preview'}</span>
					</>
				)}
			</button>

			{status === 'done' && (
				<p className="text-[11px] text-emerald-300 text-center">
					Saved. Check your downloads folder.
				</p>
			)}

			{status === 'error' && error && (
				<div className="p-3 rounded-2xl bg-red-500/15 border border-red-400/30">
					<p className="text-[11px] text-red-200 leading-relaxed">{error}</p>
					<button onClick={reset} className="mt-2 text-[10px] font-bold uppercase tracking-wider text-red-200/70 hover:text-red-200">
						Dismiss
					</button>
				</div>
			)}

			<p className="text-[10px] text-white/35 leading-relaxed px-1">
				Map data © OpenStreetMap contributors. Paid downloads are yours to print and
				display, including as a gift — resale of the file itself is not permitted.
			</p>
		</div>
	);
}
