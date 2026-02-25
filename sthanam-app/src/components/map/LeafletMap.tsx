'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePosterStore } from '@/store/usePosterStore';
import { themes } from '@/config/themes';

export const LeafletMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const tileLayer = useRef<L.TileLayer | null>(null);
    const marker = useRef<L.Marker | null>(null);

    const state = usePosterStore();
    const theme = themes[state.theme];

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map
        leafletMap.current = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: 'center',
            touchZoom: 'center'
        }).setView([state.lat, state.lon], state.zoom);

        tileLayer.current = L.tileLayer(state.showLabels ? theme.tileUrl : theme.tileUrlNoLabels, {
            maxZoom: 19,
            crossOrigin: true,
        }).addTo(leafletMap.current);

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, []); // Only on mount

    // Sync state to map
    useEffect(() => {
        if (!leafletMap.current) return;

        const center = leafletMap.current.getCenter();
        const zoom = leafletMap.current.getZoom();

        if (center.lat !== state.lat || center.lng !== state.lon || zoom !== state.zoom) {
            leafletMap.current.setView([state.lat, state.lon], state.zoom, { animate: false });
        }
    }, [state.lat, state.lon, state.zoom]);

    // Sync labels/theme
    useEffect(() => {
        if (!tileLayer.current) return;
        const url = state.showLabels ? theme.tileUrl : theme.tileUrlNoLabels;
        tileLayer.current.setUrl(url);
    }, [state.showLabels, state.theme]);

    // Marker handling
    useEffect(() => {
        if (!leafletMap.current) return;

        if (state.showMarker) {
            if (!marker.current) {
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="width: 40px; height: 40px; color: ${theme.textColor};">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                 </div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });
                marker.current = L.marker([state.markerLat, state.markerLon], { icon, draggable: true }).addTo(leafletMap.current);

                marker.current.on('dragend', () => {
                    const pos = marker.current!.getLatLng();
                    state.updateState({ markerLat: pos.lat, markerLon: pos.lng });
                });
            } else {
                marker.current.setLatLng([state.markerLat, state.markerLon]);
            }
        } else if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }
    }, [state.showMarker, state.markerLat, state.markerLon, theme.textColor]);

    return <div ref={mapRef} className="w-full h-full" />;
};
