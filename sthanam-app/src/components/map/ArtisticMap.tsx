'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { usePosterStore } from '@/store/usePosterStore';
import { artisticThemes } from '@/config/artistic-themes';

export const ArtisticMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<maplibregl.Map | null>(null);
    const markerInstance = useRef<maplibregl.Marker | null>(null);

    const state = usePosterStore();
    const theme = artisticThemes[state.artisticTheme];

    useEffect(() => {
        if (!mapRef.current) return;

        mapInstance.current = new maplibregl.Map({
            container: mapRef.current,
            style: generateStyle(theme) as any,
            center: [state.lon, state.lat],
            zoom: state.zoom - 1, // MapLibre zoom is slightly different offset
            interactive: true,
            attributionControl: false,
            preserveDrawingBuffer: true
        });

        mapInstance.current.on('moveend', () => {
            const center = mapInstance.current!.getCenter();
            const zoom = mapInstance.current!.getZoom();
            state.updateState({
                lat: center.lat,
                lon: center.lng,
                zoom: zoom + 1
            });
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Sync state
    useEffect(() => {
        if (!mapInstance.current) return;
        const center = mapInstance.current.getCenter();
        const zoom = mapInstance.current.getZoom();

        if (Math.abs(center.lat - state.lat) > 0.0001 || Math.abs(center.lng - state.lon) > 0.0001 || Math.abs(zoom - (state.zoom - 1)) > 0.01) {
            mapInstance.current.jumpTo({
                center: [state.lon, state.lat],
                zoom: state.zoom - 1
            });
        }
    }, [state.lat, state.lon, state.zoom]);

    // Sync theme
    useEffect(() => {
        if (!mapInstance.current) return;
        mapInstance.current.setStyle(generateStyle(theme) as any);
    }, [state.artisticTheme]);

    // Marker handling
    useEffect(() => {
        if (!mapInstance.current) return;

        if (state.showMarker) {
            if (!markerInstance.current) {
                const el = document.createElement('div');
                el.className = 'custom-marker';
                el.innerHTML = `<div style="width: 40px; height: 40px; color: ${theme.road_primary || theme.text}; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        </div>`;
                markerInstance.current = new maplibregl.Marker({ element: el, draggable: true })
                    .setLngLat([state.markerLon, state.markerLat])
                    .addTo(mapInstance.current);

                markerInstance.current.on('dragend', () => {
                    const pos = markerInstance.current!.getLngLat();
                    state.updateState({ markerLat: pos.lat, markerLon: pos.lng });
                });
            } else {
                markerInstance.current.setLngLat([state.markerLon, state.markerLat]);
            }
        } else if (markerInstance.current) {
            markerInstance.current.remove();
            markerInstance.current = null;
        }
    }, [state.showMarker, state.markerLat, state.markerLon, state.artisticTheme]);

    return <div ref={mapRef} className="w-full h-full" />;
};

function generateStyle(theme: any) {
    return {
        version: 8 as const,
        sources: {
            openfreemap: {
                type: 'vector' as const,
                url: 'https://tiles.openfreemap.org/planet'
            }
        },
        layers: [
            { id: 'background', type: 'background' as const, paint: { 'background-color': theme.bg } },
            { id: 'water', source: 'openfreemap', 'source-layer': 'water', type: 'fill' as const, paint: { 'fill-color': theme.water } },
            { id: 'park', source: 'openfreemap', 'source-layer': 'park', type: 'fill' as const, paint: { 'fill-color': theme.parks } },
            {
                id: 'road-default', source: 'openfreemap', 'source-layer': 'transportation', type: 'line' as const,
                filter: ['!', ['match', ['get', 'class'], ['motorway', 'primary', 'secondary', 'tertiary', 'residential'], true, false]],
                paint: { 'line-color': theme.road_default, 'line-width': 0.5 }
            },
            { id: 'road-residential', source: 'openfreemap', 'source-layer': 'transportation', type: 'line' as const, filter: ['==', ['get', 'class'], 'residential'], paint: { 'line-color': theme.road_residential, 'line-width': 0.5 } },
            { id: 'road-tertiary', source: 'openfreemap', 'source-layer': 'transportation', type: 'line' as const, filter: ['==', ['get', 'class'], 'tertiary'], paint: { 'line-color': theme.road_tertiary, 'line-width': 0.8 } },
            { id: 'road-secondary', source: 'openfreemap', 'source-layer': 'transportation', type: 'line' as const, filter: ['==', ['get', 'class'], 'secondary'], paint: { 'line-color': theme.road_secondary, 'line-width': 1.0 } },
            { id: 'road-primary', source: 'openfreemap', 'source-layer': 'transportation', type: 'line' as const, filter: ['==', ['get', 'class'], 'primary'], paint: { 'line-color': theme.road_primary, 'line-width': 1.5 } },
            { id: 'road-motorway', source: 'openfreemap', 'source-layer': 'transportation', type: 'line' as const, filter: ['==', ['get', 'class'], 'motorway'], paint: { 'line-color': theme.road_motorway, 'line-width': 2.0 } }
        ]
    };
}
