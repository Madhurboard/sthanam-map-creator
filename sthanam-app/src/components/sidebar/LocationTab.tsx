'use client';

import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { usePosterStore } from '@/store/usePosterStore';

export const LocationTab: React.FC = () => {
    const state = usePosterStore();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const mainText = display_name.split(',')[0];
                const subText = display_name.split(',').slice(1, 3).join(',').trim();

                state.updateState({
                    lat: parseFloat(lat),
                    lon: parseFloat(lon),
                    markerLat: parseFloat(lat),
                    markerLon: parseFloat(lon),
                    mainText: mainText.toUpperCase(),
                    subText: subText
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8">
            {/* Search Section */}
            <section>
                <label className="label-sm">Search Location</label>
                <form onSubmit={handleSearch} className="relative group">
                    <input
                        type="text"
                        placeholder="Search a city..."
                        className="input-field pr-12"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-accent text-white rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity">
                        <Search size={18} />
                    </button>
                </form>
            </section>

            {/* Label Controls */}
            <section className="space-y-4">
                <div>
                    <label className="label-sm">Poster Headline</label>
                    <input
                        type="text"
                        className="input-field"
                        value={state.mainText}
                        onChange={(e) => state.updateState({ mainText: e.target.value })}
                    />
                </div>
                <div>
                    <label className="label-sm">Subtext</label>
                    <input
                        type="text"
                        className="input-field"
                        value={state.subText}
                        onChange={(e) => state.updateState({ subText: e.target.value })}
                    />
                </div>
            </section>

            {/* Marker Toggle */}
            <section className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3 text-slate-600">
                    <MapPin size={20} className="text-accent" />
                    <span className="text-sm font-semibold">Show Location Pin</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={state.showMarker}
                        onChange={(e) => state.updateState({ showMarker: e.target.checked })}
                    />
                    <div className="toggle-pill"></div>
                </div>
            </section>
        </div>
    );
};
