'use client';

import { useEffect, useRef, useState } from 'react';
import { LATIN_FONTS, DEVANAGARI_FONTS, findFont, type FontOption } from '@/lib/fonts';

interface FontPickerProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	/** Sample text rendered in each option — the user's own title, when there is one. */
	sampleText?: string;
}

const GROUPS: { title: string; hint: string; fonts: FontOption[] }[] = [
	{ title: 'Latin', hint: 'A–Z', fonts: LATIN_FONTS },
	{ title: 'देवनागरी · Devanagari', hint: 'हिन्दी', fonts: DEVANAGARI_FONTS },
];

export default function FontPicker({ label, value, onChange, sampleText }: FontPickerProps) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const selected = findFont(value);

	useEffect(() => {
		if (!open) return;
		const onDocClick = (e: MouseEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('mousedown', onDocClick);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDocClick);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	return (
		<div ref={rootRef} className="relative">
			<span className="label-sm">{label}</span>
			<button
				type="button"
				onClick={() => setOpen(o => !o)}
				aria-expanded={open}
				className="w-full flex items-center justify-between gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/15"
			>
				<span className="truncate text-sm text-white" style={{ fontFamily: value }}>
					{selected?.label || 'Custom'}
				</span>
				<svg className={`w-4 h-4 flex-shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{open && (
				<div className="absolute z-50 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-1.5">
					{GROUPS.map(group => (
						<div key={group.title}>
							<div className="flex items-center justify-between px-2.5 pt-2 pb-1">
								<span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{group.title}</span>
								<span className="text-[10px] text-white/25">{group.hint}</span>
							</div>
							{group.fonts.map(font => (
								<button
									key={font.value}
									type="button"
									onClick={() => { onChange(font.value); setOpen(false); }}
									className={`w-full flex items-baseline justify-between gap-3 px-2.5 py-2 rounded-xl text-left transition-colors ${
										value === font.value ? 'bg-accent text-white' : 'hover:bg-white/10 text-white/85'
									}`}
								>
									<span className="text-xs truncate">{font.label}</span>
									<span
										className="text-base whitespace-nowrap opacity-80"
										style={{ fontFamily: font.value }}
									>
										{font.script === 'devanagari' ? font.sample : (sampleText?.slice(0, 10) || font.sample)}
									</span>
								</button>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
