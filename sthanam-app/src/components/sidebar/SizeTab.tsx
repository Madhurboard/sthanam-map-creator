'use client';

import React from 'react';
import { usePosterStore } from '@/store/usePosterStore';
import { outputPresets } from '@/config/output-presets';

export const SizeTab: React.FC = () => {
    const state = usePosterStore();

    return (
        <div className="space-y-8">
            {/* Dimension Picker */}
            <section>
                <label className="label-sm">Output Presets</label>
                <div className="grid grid-cols-2 gap-3">
                    {outputPresets.map((preset) => {
                        const isActive = state.width === preset.width && state.height === preset.height;
                        return (
                            <button
                                key={preset.name}
                                onClick={() => state.updateState({ width: preset.width, height: preset.height })}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1
                  ${isActive ? 'border-accent bg-accent/5 ring-4 ring-accent/5' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                            >
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-accent' : 'text-slate-500'}`}>
                                    {preset.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">
                                    {preset.width} × {preset.height} px
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Orientation Toggle */}
            <section className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-600">Swap Orientation</span>
                    <span className="text-[10px] text-slate-400">Swap width and height</span>
                </div>
                <button
                    onClick={() => state.updateState({ width: state.height, height: state.width })}
                    className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-accent hover:scale-110 active:scale-95 transition-all"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3L21 7L17 11" /><path d="M3 17L7 21L11 17" /><path d="M21 7H9C7.34315 7 6 8.34315 6 10V11" /><path d="M3 17H15C16.6569 17 18 15.6569 18 14V13" /></svg>
                </button>
            </section>
        </div>
    );
};
