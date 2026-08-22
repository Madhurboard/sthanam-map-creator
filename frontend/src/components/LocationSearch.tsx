'use client';

import { useEffect, useRef, useState } from 'react';
import { searchLocation } from '@/lib/geocoder';
import type { SearchResult } from '@/types';

const DEBOUNCE_MS = 400;

interface LocationSearchProps {
	onSelect: (result: SearchResult) => void;
}

export default function LocationSearch({ onSelect }: LocationSearchProps) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const [highlighted, setHighlighted] = useState(-1);

	const abortRef = useRef<AbortController | null>(null);
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (query.trim().length < 2) {
			setResults([]);
			setOpen(false);
			return;
		}

		const timer = setTimeout(async () => {
			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			setLoading(true);
			const found = await searchLocation(query.trim(), { signal: controller.signal, limit: 8 });
			if (controller.signal.aborted) return;

			setResults(found);
			setHighlighted(found.length > 0 ? 0 : -1);
			setOpen(found.length > 0);
			setLoading(false);
		}, DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [query]);

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, []);

	const choose = (result: SearchResult) => {
		onSelect(result);
		setQuery('');
		setResults([]);
		setOpen(false);
		setHighlighted(-1);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!open || results.length === 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setHighlighted(i => (i + 1) % results.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setHighlighted(i => (i - 1 + results.length) % results.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (highlighted >= 0) choose(results[highlighted]);
		} else if (e.key === 'Escape') {
			setOpen(false);
		}
	};

	return (
		<div ref={rootRef} className="relative">
			<span className="label-sm">Search Location</span>
			<div className="relative">
				<svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
				</svg>
				<input
					type="text"
					value={query}
					onChange={e => setQuery(e.target.value)}
					onKeyDown={onKeyDown}
					onFocus={() => results.length > 0 && setOpen(true)}
					placeholder="Search any city, town or address…"
					className="input-field pl-10"
					autoComplete="off"
				/>
				{loading && (
					<div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
				)}
			</div>

			{open && (
				<ul className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-1.5">
					{results.map((result, i) => (
						<li key={`${result.lat}-${result.lon}-${i}`}>
							<button
								type="button"
								onMouseEnter={() => setHighlighted(i)}
								onClick={() => choose(result)}
								className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
									highlighted === i ? 'bg-accent text-white' : 'hover:bg-white/10 text-white/85'
								}`}
							>
								<div className="text-xs font-semibold truncate">{result.shortName}</div>
								<div className="text-[10px] opacity-60 truncate">{result.name}</div>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
