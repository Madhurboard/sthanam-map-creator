'use client';

import { useState } from 'react';
import { useMapState, useUpdateState, useResetState } from '@/lib/map-state';
import { themes } from '@/lib/themes';
import { artisticThemes } from '@/lib/artistic-themes';
import { sanitizeCoordInput } from '@/lib/geocoder';
import { quickPresets, MAX_RES, MIN_RES } from '@/lib/output-presets';
import { MARKER_ICONS, MARKER_ICON_KEYS } from '@/lib/marker-icons';
import { containsDevanagari } from '@/lib/fonts';
import { clamp } from '@/lib/utils';
import LocationSearch from './LocationSearch';
import FontPicker from './FontPicker';
import PresetsModal from './PresetsModal';
import ExportPanel from './ExportPanel';
import type { SearchResult } from '@/types';

type Tab = 'place' | 'style' | 'type' | 'size' | 'export';

const TABS: { id: Tab; label: string }[] = [
	{ id: 'place', label: 'Place' },
	{ id: 'style', label: 'Style' },
	{ id: 'type', label: 'Type' },
	{ id: 'size', label: 'Size' },
	{ id: 'export', label: 'Export' },
];

export default function Sidebar() {
	const [activeTab, setActiveTab] = useState<Tab>('place');

	return (
		<aside className="w-full md:w-[400px] md:flex-shrink-0 liquid-glass flex flex-col md:rounded-[2rem] md:m-6 overflow-hidden">
			<div className="px-5 md:px-7 pt-5 pb-2 border-b border-white/10">
				<nav className="flex items-center justify-between" aria-label="Editor sections">
					{TABS.map(tab => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`pb-3 px-1.5 border-b-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
								activeTab === tab.id
									? 'border-accent text-accent'
									: 'border-transparent text-white/60 hover:text-white'
							}`}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			<div className="flex-1 overflow-y-auto px-5 md:px-7 py-5 space-y-6 no-scrollbar">
				{activeTab === 'place' && <PlaceTab />}
				{activeTab === 'style' && <StyleTab />}
				{activeTab === 'type' && <TypeTab />}
				{activeTab === 'size' && <SizeTab />}
				{activeTab === 'export' && <ExportPanel />}
			</div>
		</aside>
	);
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
	return (
		<div className="flex items-center justify-between">
			<span className="label-sm mb-0">{label}</span>
			<label className="relative inline-flex items-center cursor-pointer">
				<input
					type="checkbox"
					aria-label={label}
					checked={checked}
					onChange={e => onChange(e.target.checked)}
					className="sr-only peer"
				/>
				<div className="toggle-pill" />
			</label>
		</div>
	);
}

function Slider({ label, value, display, min, max, step, onChange }: {
	label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
	return (
		<div>
			<div className="flex justify-between items-center mb-2">
				<span className="label-sm mb-0">{label}</span>
				<span className="text-xs font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full">{display}</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={e => onChange(parseFloat(e.target.value))}
				className="w-full h-1.5 bg-black/25 rounded-lg appearance-none cursor-pointer accent-accent"
			/>
		</div>
	);
}

function PlaceTab() {
	const { state } = useMapState();
	const updateState = useUpdateState();
	const [latDraft, setLatDraft] = useState<string | null>(null);
	const [lonDraft, setLonDraft] = useState<string | null>(null);

	const handleSelect = (result: SearchResult) => {
		updateState({
			city: result.shortName.toUpperCase(),
			country: (result.country || '').toUpperCase(),
			cityOverride: '',
			countryOverride: '',
			lat: result.lat,
			lon: result.lon,
			markerLat: result.lat,
			markerLon: result.lon,
		});
	};

	const commitCoord = (key: 'lat' | 'lon', draft: string | null, limit: number) => {
		if (draft === null) return;
		const parsed = parseFloat(draft);
		if (!Number.isNaN(parsed)) {
			const value = clamp(parsed, -limit, limit);
			updateState(key === 'lat' ? { lat: value, markerLat: value } : { lon: value, markerLon: value });
		}
		if (key === 'lat') setLatDraft(null); else setLonDraft(null);
	};

	return (
		<div className="space-y-5">
			<LocationSearch onSelect={handleSelect} />

			<div className="grid grid-cols-2 gap-3">
				<div>
					<span className="label-sm">Latitude</span>
					<input
						type="text"
						inputMode="decimal"
						className="input-field text-center font-mono text-xs"
						value={latDraft ?? state.lat.toFixed(4)}
						onChange={e => setLatDraft(sanitizeCoordInput(e.target.value))}
						onBlur={() => commitCoord('lat', latDraft, 90)}
						onKeyDown={e => e.key === 'Enter' && commitCoord('lat', latDraft, 90)}
					/>
				</div>
				<div>
					<span className="label-sm">Longitude</span>
					<input
						type="text"
						inputMode="decimal"
						className="input-field text-center font-mono text-xs"
						value={lonDraft ?? state.lon.toFixed(4)}
						onChange={e => setLonDraft(sanitizeCoordInput(e.target.value))}
						onBlur={() => commitCoord('lon', lonDraft, 180)}
						onKeyDown={e => e.key === 'Enter' && commitCoord('lon', lonDraft, 180)}
					/>
				</div>
			</div>

			<Slider
				label="Zoom"
				value={state.zoom}
				display={String(Math.round(state.zoom))}
				min={2}
				max={18}
				step={1}
				onChange={v => updateState({ zoom: v })}
			/>

			<div className="h-px bg-white/10" />

			<div>
				<span className="label-sm">Poster Title</span>
				<input
					type="text"
					placeholder={state.city}
					className="input-field"
					value={state.cityOverride}
					onChange={e => updateState({ cityOverride: e.target.value.toUpperCase() })}
				/>
				{containsDevanagari(state.cityOverride) && (
					<p className="text-[10px] text-accent mt-1.5 px-1">
						Devanagari detected — pick a Devanagari font in the Type tab.
					</p>
				)}
			</div>

			<div>
				<span className="label-sm">Subtitle / Region</span>
				<input
					type="text"
					placeholder={state.country}
					className="input-field"
					value={state.countryOverride}
					onChange={e => updateState({ countryOverride: e.target.value.toUpperCase() })}
				/>
			</div>

			<div className="space-y-3 pt-1">
				<Toggle label="Show Subtitle" checked={state.showCountry} onChange={v => updateState({ showCountry: v })} />
				<Toggle label="Show Coordinates" checked={state.showCoords} onChange={v => updateState({ showCoords: v })} />
			</div>
		</div>
	);
}

function StyleTab() {
	const { state } = useMapState();
	const updateState = useUpdateState();

	return (
		<div className="space-y-5">
			<div className="bg-black/25 p-1 rounded-xl flex">
				{(['tile', 'artistic'] as const).map(mode => (
					<button
						key={mode}
						onClick={() => updateState({ renderMode: mode })}
						className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
							state.renderMode === mode ? 'bg-accent text-white' : 'text-white/70 hover:text-white'
						}`}
					>
						{mode === 'tile' ? 'Standard' : 'Artistic'}
					</button>
				))}
			</div>

			{state.renderMode === 'tile' ? (
				<>
					<div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
						{Object.entries(themes).map(([key, theme]) => (
							<button
								key={key}
								onClick={() => updateState({ theme: key })}
								className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
									state.theme === key
										? 'border-accent bg-accent-light ring-2 ring-accent/30'
										: 'border-white/15 bg-white/10 hover:bg-white/20'
								}`}
							>
								<div className="flex items-center -space-x-1">
									<span className="w-6 h-6 rounded-full ring-1 ring-white/60" style={{ background: theme.bg }} />
									<span className="w-6 h-6 rounded-full ring-1 ring-white/60" style={{ background: theme.water }} />
									<span className="w-6 h-6 rounded-full ring-1 ring-white/60" style={{ background: theme.road }} />
								</div>
								<span className="mt-3 text-[11px] font-semibold text-white">{theme.name}</span>
							</button>
						))}
					</div>
					<Toggle label="Show Map Labels" checked={state.showLabels} onChange={v => updateState({ showLabels: v })} />
				</>
			) : (
				<>
					<div className="grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
						{Object.entries(artisticThemes).map(([key, theme]) => (
							<button
								key={key}
								onClick={() => updateState({ artisticTheme: key })}
								className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
									state.artisticTheme === key
										? 'border-accent bg-accent-light ring-2 ring-accent/30'
										: 'border-white/15 bg-white/10 hover:bg-white/20'
								}`}
							>
								<div className="flex items-center -space-x-2">
									{[theme.road_motorway, theme.road_primary, theme.road_secondary, theme.road_tertiary].map((c, i) => (
										<span key={i} className="w-6 h-6 rounded-full ring-1 ring-white/60" style={{ background: c }} />
									))}
								</div>
								<span className="mt-3 text-[11px] font-semibold text-white">{theme.name}</span>
							</button>
						))}
					</div>
					<p className="text-[10px] text-white/50 italic px-1">
						{artisticThemes[state.artisticTheme as keyof typeof artisticThemes]?.description}
					</p>
				</>
			)}

			<div className="h-px bg-white/10" />

			<Toggle label="Show Marker" checked={state.showMarker} onChange={v => updateState({ showMarker: v })} />

			{state.showMarker && (
				<div className="space-y-4 p-4 bg-black/25 rounded-2xl border border-white/10">
					<div>
						<span className="label-sm">Marker Shape</span>
						<div className="grid grid-cols-6 gap-2">
							{MARKER_ICON_KEYS.map(key => (
								<button
									key={key}
									onClick={() => updateState({ markerIcon: key })}
									aria-label={key}
									className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${
										state.markerIcon === key
											? 'bg-accent border-accent text-white'
											: 'bg-white/10 border-white/15 text-white/70 hover:bg-white/20'
									}`}
								>
									<span
										className="w-4 h-4 block [&_svg]:w-full [&_svg]:h-full"
										dangerouslySetInnerHTML={{ __html: MARKER_ICONS[key] }}
									/>
								</button>
							))}
						</div>
					</div>
					<Slider
						label="Marker Size"
						value={state.markerSize}
						display={`${state.markerSize.toFixed(1)}×`}
						min={0.5}
						max={3}
						step={0.1}
						onChange={v => updateState({ markerSize: v })}
					/>
					<p className="text-[10px] text-white/45 px-1">Drag the marker on the poster to move it.</p>
				</div>
			)}
		</div>
	);
}

const POSITION_GRID: { x: number; y: number }[] = [
	{ x: 0.2, y: 0.15 }, { x: 0.5, y: 0.15 }, { x: 0.8, y: 0.15 },
	{ x: 0.2, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.5 },
	{ x: 0.2, y: 0.85 }, { x: 0.5, y: 0.85 }, { x: 0.8, y: 0.85 },
];

function TypeTab() {
	const { state } = useMapState();
	const updateState = useUpdateState();
	const title = state.cityOverride || state.city;

	return (
		<div className="space-y-5">
			<FontPicker label="Title Font" value={state.cityFont} onChange={v => updateState({ cityFont: v })} sampleText={title} />
			<FontPicker label="Subtitle Font" value={state.countryFont} onChange={v => updateState({ countryFont: v })} />
			<FontPicker label="Coordinates Font" value={state.coordsFont} onChange={v => updateState({ coordsFont: v })} />

			<div className="h-px bg-white/10" />

			<div>
				<span className="label-sm">Text Size</span>
				<div className="grid grid-cols-4 gap-2">
					{(['none', 'small', 'medium', 'large'] as const).map(size => (
						<button
							key={size}
							onClick={() => updateState({ overlaySize: size })}
							className={`py-2 text-[11px] font-semibold rounded-xl border capitalize transition-all ${
								state.overlaySize === size
									? 'bg-accent text-white border-accent'
									: 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20'
							}`}
						>
							{size === 'none' ? 'Off' : size}
						</button>
					))}
				</div>
			</div>

			<div>
				<span className="label-sm">Fade Behind Text</span>
				<div className="grid grid-cols-2 gap-2">
					{([['vignette', 'Vignette'], ['none', 'None']] as const).map(([value, label]) => (
						<button
							key={value}
							onClick={() => updateState({ overlayBgType: value })}
							className={`py-2 text-[11px] font-semibold rounded-xl border transition-all ${
								state.overlayBgType === value
									? 'bg-accent text-white border-accent'
									: 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20'
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			<div>
				<span className="label-sm">Text Position</span>
				<div className="grid grid-cols-3 gap-2 w-32">
					{POSITION_GRID.map(pos => {
						const active = Math.abs(state.overlayX - pos.x) < 0.02 && Math.abs(state.overlayY - pos.y) < 0.02;
						return (
							<button
								key={`${pos.x}-${pos.y}`}
								onClick={() => updateState({ overlayX: pos.x, overlayY: pos.y })}
								aria-label={`Position ${pos.x} ${pos.y}`}
								className={`aspect-square rounded-lg border transition-all ${
									active ? 'bg-accent border-accent' : 'bg-white/10 border-white/15 hover:bg-white/20'
								}`}
							/>
						);
					})}
				</div>
				<p className="text-[10px] text-white/45 mt-2 px-1">Or drag the text directly on the poster.</p>
			</div>
		</div>
	);
}

function SizeTab() {
	const { state } = useMapState();
	const updateState = useUpdateState();
	const resetState = useResetState();
	const [modalOpen, setModalOpen] = useState(false);

	const commitDimension = (key: 'width' | 'height', raw: string) => {
		const parsed = parseInt(raw, 10);
		if (Number.isNaN(parsed)) return;
		updateState({ [key]: clamp(parsed, MIN_RES, MAX_RES) });
	};

	const swap = () => updateState({ width: state.height, height: state.width });

	return (
		<div className="space-y-5">
			<div>
				<span className="label-sm">Quick Sizes</span>
				<div className="grid grid-cols-2 gap-2">
					{quickPresets.map(preset => {
						const active = state.width === preset.width && state.height === preset.height;
						return (
							<button
								key={preset.name}
								onClick={() => updateState({ width: preset.width, height: preset.height })}
								className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
									active
										? 'bg-accent text-white border-accent ring-2 ring-accent/30'
										: 'bg-white/10 text-white border-white/15 hover:bg-white/20'
								}`}
							>
								<div className="text-[11px] font-semibold">{preset.name}</div>
								<div className="text-[9px] opacity-60">{preset.width} × {preset.height}</div>
							</button>
						);
					})}
				</div>
			</div>

			<button
				onClick={() => setModalOpen(true)}
				className="w-full py-2.5 text-[11px] font-bold rounded-xl border border-dashed border-white/25 text-white/80 hover:bg-white/10 transition-colors"
			>
				All Sizes — Print, Wallpaper, Social
			</button>

			<div>
				<span className="label-sm">Custom Size</span>
				<div className="flex items-center gap-2">
					<input
						type="number"
						min={MIN_RES}
						max={MAX_RES}
						defaultValue={state.width}
						key={`w-${state.width}`}
						onBlur={e => commitDimension('width', e.target.value)}
						onKeyDown={e => e.key === 'Enter' && commitDimension('width', (e.target as HTMLInputElement).value)}
						className="input-field text-center text-xs"
					/>
					<button onClick={swap} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors" aria-label="Swap width and height">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
						</svg>
					</button>
					<input
						type="number"
						min={MIN_RES}
						max={MAX_RES}
						defaultValue={state.height}
						key={`h-${state.height}`}
						onBlur={e => commitDimension('height', e.target.value)}
						onKeyDown={e => e.key === 'Enter' && commitDimension('height', (e.target as HTMLInputElement).value)}
						className="input-field text-center text-xs"
					/>
				</div>
			</div>

			<div className="h-px bg-white/10" />

			<Toggle label="Mat Frame" checked={state.matEnabled} onChange={v => updateState({ matEnabled: v })} />

			{state.matEnabled && (
				<div className="space-y-4 p-4 bg-black/25 rounded-2xl border border-white/10">
					<Slider
						label="Frame Width"
						value={state.matWidth}
						display={`${state.matWidth}px`}
						min={10}
						max={Math.max(20, Math.round(Math.min(state.width, state.height) / 4))}
						step={5}
						onChange={v => updateState({ matWidth: v })}
					/>
					<Toggle label="Inner Fine Line" checked={state.matShowBorder} onChange={v => updateState({ matShowBorder: v })} />
					{state.matShowBorder && (
						<>
							<Slider
								label="Line Thickness"
								value={state.matBorderWidth}
								display={`${state.matBorderWidth}px`}
								min={1}
								max={10}
								step={1}
								onChange={v => updateState({ matBorderWidth: v })}
							/>
							<Slider
								label="Line Opacity"
								value={state.matBorderOpacity}
								display={`${Math.round(state.matBorderOpacity * 100)}%`}
								min={0}
								max={1}
								step={0.1}
								onChange={v => updateState({ matBorderOpacity: v })}
							/>
						</>
					)}
				</div>
			)}

			<button
				onClick={() => {
					if (window.confirm('Reset every setting back to the defaults?')) resetState();
				}}
				className="w-full py-2.5 text-[11px] font-bold rounded-xl border border-white/15 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
			>
				Reset to Defaults
			</button>

			<PresetsModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				width={state.width}
				height={state.height}
				onSelect={(width, height) => updateState({ width, height })}
			/>
		</div>
	);
}
