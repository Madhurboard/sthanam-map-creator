'use client';

import React from 'react';
import { usePosterStore } from '@/store/usePosterStore';
import { themes } from '@/config/themes';
import { artisticThemes } from '@/config/artistic-themes';

export const StyleTab: React.FC = () => {
    const state = usePosterStore();

    return (
        <div className="space-y-8">
            {/* Mode Picker */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                <button
                    onClick={() => state.updateState({ renderMode: 'tile' })}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all
            ${state.renderMode === 'tile' ? 'bg-accent text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Minimal
                </button>
                <button
                    onClick={() => state.updateState({ renderMode: 'artistic' })}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all
            ${state.renderMode === 'artistic' ? 'bg-accent text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Artistic
                </button>
            </div>

            {/* Theme Grid */}
            <section>
                <label className="label-sm">Select Theme</label>
                <div className="grid grid-cols-3 gap-3">
                    {state.renderMode === 'tile' ? (
                        Object.entries(themes).map(([key, theme]) => (
                            <button
                                key={key}
                                onClick={() => state.updateState({ theme: key as any })}
                                className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all
                  ${state.theme === key ? 'border-accent ring-4 ring-accent/10' : 'border-transparent hover:border-slate-200'}`}
                            >
                                <div className="absolute inset-0 flex flex-col">
                                    <div className="flex-1" style={{ backgroundColor: theme.bg }}></div>
                                    <div className="h-1/3" style={{ backgroundColor: theme.overlayBg }}></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                    <span className="text-[8px] font-bold text-white uppercase tracking-tighter drop-shadow-md">{theme.name}</span>
                                </div>
                            </button>
                        ))
                    ) : (
                        Object.entries(artisticThemes).map(([key, theme]) => (
                            <button
                                key={key}
                                onClick={() => state.updateState({ artisticTheme: key as any })}
                                className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all
                  ${state.artisticTheme === key ? 'border-accent ring-4 ring-accent/10' : 'border-transparent hover:border-slate-200'}`}
                            >
                                <div className="absolute inset-0" style={{ backgroundColor: theme.bg }}>
                                    {/* Mini Pattern Preview */}
                                    <div className="absolute inset-2 border border-white/20 rounded-lg flex flex-col gap-1 overflow-hidden p-1">
                                        <div className="h-0.5 w-full" style={{ backgroundColor: theme.road_primary }}></div>
                                        <div className="h-0.5 w-3/4" style={{ backgroundColor: theme.road_secondary }}></div>
                                        <div className="h-0.5 w-1/2" style={{ backgroundColor: theme.road_tertiary }}></div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                                    <span className="text-[8px] font-bold text-white uppercase tracking-tighter drop-shadow-md">{theme.name}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </section>

            {/* Style Options */}
            <section className="space-y-4">
                <label className="label-sm">Labels</label>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-semibold text-slate-600">Show Map Labels</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            disabled={state.renderMode === 'artistic'}
                            checked={state.showLabels}
                            onChange={(e) => state.updateState({ showLabels: e.target.checked })}
                        />
                        <div className="toggle-pill opacity-50 disabled:cursor-not-allowed"></div>
                    </div>
                </div>
                {state.renderMode === 'artistic' && (
                    <p className="text-[10px] text-slate-400 font-medium italic px-2">
                        * Artistic mode uses custom vector styling without labels for a minimalist look.
                    </p>
                )}
            </section>
        </div>
    );
};
