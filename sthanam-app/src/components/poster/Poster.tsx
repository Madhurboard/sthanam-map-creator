'use client';

import React, { useRef, useEffect } from 'react';
import { usePosterStore } from '@/store/usePosterStore';
import { Overlay } from './Overlay';
import { MapRenderer } from '../map/MapRenderer';
import { themes } from '@/config/themes';
import { artisticThemes } from '@/config/artistic-themes';

export const Poster: React.FC = () => {
    const state = usePosterStore();
    const containerRef = useRef<HTMLDivElement>(null);

    const isArtistic = state.renderMode === 'artistic';
    const theme = isArtistic ? artisticThemes[state.artisticTheme] : themes[state.theme];

    // Calculate scaling to fit the screen
    const [scale, setScale] = React.useState(1);

    const handleResize = () => {
        if (!containerRef.current) return;
        const parent = containerRef.current.parentElement;
        if (!parent) return;

        const padding = 64;
        const availableWidth = parent.clientWidth - padding;
        const availableHeight = parent.clientHeight - padding;

        const scaleW = availableWidth / state.width;
        const scaleH = availableHeight / state.height;

        setScale(Math.min(scaleW, scaleH, 1));
    };

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);

        // Signal that we are ready for capture after a short delay for tiles to load
        const timer = setTimeout(() => {
            (window as any).renderReady = true;
        }, 2000);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [state.width, state.height]);

    if (!theme) return null;

    return (
        <div className="flex-1 flex items-center justify-center p-8 bg-[#f0ece1] overflow-hidden grayscale-[0.1]">
            <div
                ref={containerRef}
                className="relative shadow-2xl transition-all duration-500 ease-out bg-white overflow-hidden"
                style={{
                    width: state.width,
                    height: state.height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                }}
            >
                <MapRenderer />

                {/* Poster Content */}
                <div className="absolute inset-0 z-10">
                    <Overlay />
                </div>

                {/* Mat/Frame */}
                {state.matEnabled && (
                    <div
                        className="absolute inset-0 z-30 pointer-events-none"
                        style={{
                            border: `${state.matWidth}px solid white`,
                            boxShadow: state.matShowBorder ? `inset 0 0 0 ${state.matBorderWidth}px rgba(0,0,0,${state.matBorderOpacity})` : 'none'
                        }}
                    />
                )}
            </div>
        </div>
    );
};
