'use client';

import React from 'react';
import { usePosterStore } from '@/store/usePosterStore';
import { themes } from '@/config/themes';
import { artisticThemes } from '@/config/artistic-themes';

export const Overlay: React.FC = () => {
    const state = usePosterStore();

    const isArtistic = state.renderMode === 'artistic';
    const theme = isArtistic ? artisticThemes[state.artisticTheme] : themes[state.theme];

    if (!theme) return null;

    const textColor = isArtistic ? theme.text : theme.textColor;
    const overlayBg = isArtistic ? 'transparent' : theme.overlayBg;

    // Formatting coordinates
    const formatCoord = (coord: number, type: 'lat' | 'lon') => {
        const abs = Math.abs(coord);
        const deg = Math.floor(abs);
        const min = Math.floor((abs - deg) * 60);
        const sec = ((abs - deg - min / 60) * 3600).toFixed(1);
        const dir = type === 'lat' ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
        return `${deg}° ${min}' ${sec}" ${dir}`;
    };

    const cityText = state.cityOverride || state.city;
    const countryText = state.countryOverride || state.country;

    return (
        <div
            className="absolute inset-x-0 bottom-[10%] z-20 flex flex-col items-center justify-center p-8 pointer-events-none"
            style={{
                backgroundColor: state.overlaySize !== 'none' ? overlayBg : 'transparent',
                backdropFilter: state.overlayBgType === 'vignette' ? 'blur(4px)' : 'none',
                maskImage: state.overlayBgType === 'vignette' ? 'radial-gradient(circle, black 0%, transparent 80%)' : 'none'
            }}
        >
            <div className="text-center space-y-2">
                <h2
                    className="text-5xl font-bold tracking-tight uppercase"
                    style={{
                        fontFamily: state.cityFont,
                        color: textColor
                    }}
                >
                    {cityText}
                </h2>

                {state.showCountry && (
                    <p
                        className="text-lg font-medium tracking-[0.3em] uppercase opacity-80"
                        style={{
                            fontFamily: state.countryFont,
                            color: textColor
                        }}
                    >
                        {countryText}
                    </p>
                )}

                {state.showCoords && (
                    <div
                        className="flex items-center justify-center space-x-4 pt-2 text-xs font-mono tracking-widest opacity-60"
                        style={{
                            fontFamily: state.coordsFont,
                            color: textColor
                        }}
                    >
                        <span>{formatCoord(state.lat, 'lat')}</span>
                        <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                        <span>{formatCoord(state.lon, 'lon')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
