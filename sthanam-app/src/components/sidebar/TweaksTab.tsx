'use client';

import React from 'react';
import { usePosterStore } from '@/store/usePosterStore';

export const TweaksTab: React.FC = () => {
    const state = usePosterStore();

    return (
        <div className="space-y-8">
            {/* Matting Settings */}
            <section className="space-y-4">
                <label className="label-sm">Matting & Frame</label>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-sm font-semibold text-slate-600">Enable Mat</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={state.matEnabled}
                            onChange={(e) => state.updateState({ matEnabled: e.target.checked })}
                        />
                        <div className="toggle-pill"></div>
                    </div>
                </div>

                {state.matEnabled && (
                    <div className="space-y-6 px-1">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Mat Width</span>
                                <span className="text-[10px] font-bold text-accent">{state.matWidth}px</span>
                            </div>
                            <input
                                type="range"
                                min="20" max="200"
                                className="accent-input w-full"
                                value={state.matWidth}
                                onChange={(e) => state.updateState({ matWidth: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Show Inner Border</span>
                            <input
                                type="checkbox"
                                className="accent-input"
                                checked={state.matShowBorder}
                                onChange={(e) => state.updateState({ matShowBorder: e.target.checked })}
                            />
                        </div>

                        {state.matShowBorder && (
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Border Opacity</span>
                                    <span className="text-[10px] font-bold text-accent">{Math.round(state.matBorderOpacity * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    className="accent-input w-full"
                                    value={state.matBorderOpacity}
                                    onChange={(e) => state.updateState({ matBorderOpacity: parseFloat(e.target.value) })}
                                />
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* coordinates */}
            <section className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Show Coordinates</span>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={state.showCoordinates}
                        onChange={(e) => state.updateState({ showCoordinates: e.target.checked })}
                    />
                    <div className="toggle-pill"></div>
                </div>
            </section>
        </div>
    );
};
