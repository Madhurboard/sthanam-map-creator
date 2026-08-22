'use client';

import { useEffect } from 'react';
import { outputPresets, PRESET_CATEGORY_LABELS } from '@/lib/output-presets';

interface PresetsModalProps {
	open: boolean;
	onClose: () => void;
	width: number;
	height: number;
	onSelect: (width: number, height: number) => void;
}

export default function PresetsModal({ open, onClose, width, height, onSelect }: PresetsModalProps) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

			<div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl border border-white/15 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-6">
				<div className="flex items-start justify-between mb-5">
					<div>
						<h3 className="text-lg font-bold text-white">All Sizes</h3>
						<p className="text-xs text-white/50 mt-0.5">Print sizes are pre-calculated at 300 DPI.</p>
					</div>
					<button onClick={onClose} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="space-y-5">
					{Object.entries(outputPresets).map(([category, presets]) => (
						<div key={category}>
							<span className="label-sm">{PRESET_CATEGORY_LABELS[category] || category}</span>
							<div className="grid grid-cols-2 gap-2 mt-1.5">
								{presets.map(preset => {
									const active = preset.width === width && preset.height === height;
									return (
										<button
											key={preset.name}
											onClick={() => { onSelect(preset.width, preset.height); onClose(); }}
											className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
												active
													? 'bg-accent text-white border-accent ring-2 ring-accent/30'
													: 'bg-white/10 border-white/15 text-white hover:bg-white/20'
											}`}
										>
											<div className="text-[11px] font-semibold truncate">{preset.name}</div>
											<div className="text-[9px] opacity-60">{preset.width} × {preset.height}</div>
										</button>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
