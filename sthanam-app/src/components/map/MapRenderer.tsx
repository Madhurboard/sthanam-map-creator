'use client';

import React from 'react';
import { usePosterStore } from '@/store/usePosterStore';
import { LeafletMap } from './LeafletMap';
import { ArtisticMap } from './ArtisticMap';

export const MapRenderer: React.FC = () => {
    const renderMode = usePosterStore((state) => state.renderMode);

    return (
        <div className="absolute inset-0 z-0">
            {renderMode === 'tile' ? (
                <LeafletMap />
            ) : (
                <ArtisticMap />
            )}
        </div>
    );
};
